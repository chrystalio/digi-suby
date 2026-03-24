<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreServiceRequest;
use App\Http\Requests\UpdateServiceRequest;
use App\Models\Category;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $perPage = request()->integer('per_page', 25);
        $type = request()->string('type')->toString();

        $services = Service::query()
            ->visibleTo($user)
            ->with('category:id,name,color,icon')
            ->when($type === 'user', fn ($query) => $query->where('is_system', false))
            ->when($type === 'system', fn ($query) => $query->where('is_system', true))
            ->when(request()->string('category')->toString(), fn ($query, $categoryId) => $query->where('category_id', $categoryId))
            ->when(request()->string('search')->toString(), fn ($query, $search) => $query->where('name', 'like', "%{$search}%"))
            ->orderBy('is_system', 'desc')
            ->orderBy('name')
            ->paginate($perPage)
            ->through(fn (Service $service) => [
                'id' => $service->id,
                'name' => $service->name,
                'slug' => $service->slug,
                'url' => $service->url,
                'logo' => $service->logo,
                'category' => $service->category ? [
                    'id' => $service->category->id,
                    'name' => $service->category->name,
                    'color' => $service->category->color,
                    'icon' => $service->category->icon,
                ] : null,
                'is_system' => $service->is_system,
                'can_edit' => $user->can('update', $service),
                'can_delete' => $user->can('delete', $service),
            ]);

        $categories = Category::query()
            ->visibleTo($user)
            ->orderBy('name')
            ->get(['id', 'name', 'color', 'icon']);

        return Inertia::render('services/index', [
            'services' => $services,
            'categories' => $categories,
            'filters' => [
                'search' => request()->string('search')->toString(),
                'category' => request()->string('category')->toString(),
                'type' => $type,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(StoreServiceRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        try {
            Service::create([
                'name' => $validated['name'],
                'slug' => $request->slug,
                'url' => $validated['url'],
                'category_id' => $validated['category_id'],
                'is_system' => false,
                'user_id' => $request->user()->id,
            ]);

            return redirect()
                ->route('services.index')
                ->with('success', 'Service added successfully.');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Failed to create service. Please try again.');
        }
    }

    public function update(UpdateServiceRequest $request, Service $service): RedirectResponse
    {
        try {
            $validated = $request->validated();

            $service->update([
                'name' => $validated['name'],
                'url' => $validated['url'],
                'category_id' => $validated['category_id'],
            ]);

            // Clear logo cache if URL changed
            if ($validated['url'] !== $service->getOriginal('url')) {
                $domain = $service->extractDomain($validated['url']);
                cache()->forget("logo_url:{$domain}");
            }

            return redirect()
                ->route('services.index')
                ->with('success', 'Service updated successfully.');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Failed to update service. Please try again.');
        }
    }

    public function destroy(Service $service): RedirectResponse
    {
        try {
            $this->authorize('delete', $service);

            $service->delete();

            return back()->with('success', 'Service deleted successfully.');
        } catch (\Exception $e) {
            return back()
                ->with('error', 'Failed to delete service. Please try again.');
        }
    }
}
