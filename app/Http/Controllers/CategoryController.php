<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
        $this->authorize('create', Category::class);

        Category::create([
            ...$request->validated(),
            'slug' => Str::slug($request->name),
            'user_id' => $request->user()->id,
        ]);

        return back();
    }

    public function update(StoreCategoryRequest $request, Category $category): RedirectResponse
    {
        if ($category->is_system) {
            return back()->with('error', 'System categories cannot be modified.');
        }

        if ($category->user_id !== $request->user()->id) {
            return back()->with('error', 'You do not have permission to edit this category.');
        }

        $category->update([
            ...$request->validated(),
            'slug' => Str::slug($request->name),
        ]);

        return back()->with('success', 'Category updated successfully.');
    }

    public function destroy(Request $request, Category $category): RedirectResponse
    {
        if ($category->is_system) {
            return back()->with('error', 'System categories cannot be deleted.');
        }

        if ($category->user_id !== $request->user()->id) {
            return back()->with('error', 'You do not have permission to delete this category.');
        }

        if ($category->services()->count() > 0) {
            return back()->with('error', 'Cannot delete category with attached services.');
        }

        $category->delete();

        return back()->with('success', 'Category deleted successfully.');
    }
}
