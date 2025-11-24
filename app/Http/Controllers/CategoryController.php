<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Models\Category;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $categories = Category::query()
            ->where(function ($query) use ($request) {
                $query->where('user_id', $request->user()->id)
                    ->orWhere('is_system', true);
            })
            ->latest()
            ->paginate($perPage);

        return inertia('categories/index', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        try {
            $this->authorize('create', Category::class);
        } catch (AuthorizationException) {
            return redirect()
                ->route('categories.index')
                ->with('error', 'You do not have permission to create categories.');
        }

        DB::beginTransaction();

        try {
            Category::create([
                ...$request->validated(),
                'slug' => Str::slug($request->name),
                'user_id' => $request->user()->id,
            ]);

            DB::commit();

            return redirect()
                ->route('categories.index')
                ->with('success', 'Category created successfully.');

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Category creation failed', ['error' => $e->getMessage()]);

            return redirect()
                ->route('categories.index')
                ->with('error', 'Failed to create category. Please try again.');
        }
    }

    public function update(StoreCategoryRequest $request, Category $category): RedirectResponse
    {
        try {
            $this->authorize('update', $category);
        } catch (AuthorizationException) {
            return redirect()
                ->route('categories.index')
                ->with('error', 'You do not have permission to edit this category.');
        }

        DB::beginTransaction();

        try {
            $category->update([
                ...$request->validated(),
                'slug' => Str::slug($request->name),
            ]);

            DB::commit();

            return redirect()
                ->route('categories.index')
                ->with('success', 'Category updated successfully.');

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Category update failed', ['error' => $e->getMessage(), 'category_id' => $category->id]);

            return redirect()
                ->route('categories.index')
                ->with('error', 'Failed to update category. Please try again.');
        }
    }

    public function destroy(Category $category): RedirectResponse
    {
        try {
            $this->authorize('delete', $category);
        } catch (AuthorizationException) {
            return redirect()
                ->route('categories.index')
                ->with('error', 'You do not have permission to delete this category.');
        }

        DB::beginTransaction();

        try {
            $category->delete();

            DB::commit();

            return redirect()
                ->route('categories.index')
                ->with('success', 'Category deleted successfully.');

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Category deletion failed', ['error' => $e->getMessage(), 'category_id' => $category->id]);

            return redirect()
                ->route('categories.index')
                ->with('error', 'Failed to delete category. Please try again.');
        }
    }
}
