<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSubscriptionRequest;
use App\Http\Requests\UpdateSubscriptionRequest;
use App\Models\PaymentMethod;
use App\Models\Service;
use App\Models\Subscription;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $perPage = request()->integer('per_page', 25);
        $status = request()->string('status')->toString();
        $currency = request()->string('currency')->toString();
        $search = request()->string('search')->toString();

        $subscriptions = Subscription::query()
            ->where('user_id', $user->id)
            ->with([
                // `logo` and `logo_url` are $appends accessors, not DB columns — keep
                // only the real columns here so the eager-load SQL is valid. `url` is
                // needed by Service::getLogoAttribute() (which runs in PHP, not SQL).
                'service:id,name,slug,url',
                'paymentMethod:id,name,method_type,card_type,card_last_four,e_wallet_provider',
            ])
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->when($currency !== '', fn ($query) => $query->where('currency', $currency))
            ->when($search !== '', fn ($query) => $query->where('name', 'like', "%{$search}%"))
            ->orderBy('next_billing_date')
            ->orderBy('name')
            ->paginate($perPage)
            ->through(fn (Subscription $subscription) => [
                'id' => $subscription->id,
                'name' => $subscription->name,
                'amount' => $subscription->amount,
                'currency' => $subscription->currency->value,
                'interval' => $subscription->interval->value,
                'status' => $subscription->status->value,
                'next_billing_date' => $subscription->next_billing_date?->toDateString(),
                'started_at' => $subscription->started_at?->toDateString(),
                'trial_ends_at' => $subscription->trial_ends_at?->toDateString(),
                'cancelled_at' => $subscription->cancelled_at?->toDateString(),
                'notes' => $subscription->notes,
                'display_amount' => $subscription->display_amount,
                'days_until_next_billing' => $subscription->daysUntilNextBilling(),
                'is_trial_ending_soon' => (bool) $subscription->is_trial_ending_soon,
                'is_renewing_soon' => (bool) $subscription->is_renewing_soon,
                'is_cancelled' => $subscription->isCancelled(),
                'is_lifetime' => $subscription->isLifetime(),
                'monthly_equivalent' => $subscription->monthlyEquivalent(),
                'service' => $subscription->service ? [
                    'id' => $subscription->service->id,
                    'name' => $subscription->service->name,
                    'slug' => $subscription->service->slug,
                    'logo' => $subscription->service->logo,
                ] : null,
                'payment_method' => $subscription->paymentMethod ? [
                    'id' => $subscription->paymentMethod->id,
                    'name' => $subscription->paymentMethod->name,
                    'card_last_four' => $subscription->paymentMethod->card_last_four,
                ] : null,
                'can_edit' => $user->can('update', $subscription),
                'can_delete' => $user->can('delete', $subscription),
            ]);

        $services = Service::query()
            ->visibleTo($user)
            ->orderBy('name')
            ->get()
            ->map(fn (Service $service) => [
                'id' => $service->id,
                'name' => $service->name,
                'is_system' => $service->is_system,
                'logo' => $service->logo, // accessor — returns null if no url
            ]);

        $paymentMethods = PaymentMethod::query()
            ->where('user_id', $user->id)
            ->orderBy('name')
            ->get()
            ->map(fn (PaymentMethod $pm) => [
                'id' => $pm->id,
                'name' => $pm->name,
                'card_last_four' => $pm->card_last_four,
                'logo_url' => $pm->logo_url, // accessor
            ]);

        return Inertia::render('subscriptions/index', [
            'subscriptions' => $subscriptions,
            'services' => $services,
            'paymentMethods' => $paymentMethods,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'currency' => $currency,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(StoreSubscriptionRequest $request): RedirectResponse
    {
        try {
            $validated = $request->validated();

            // next_billing_date is derived from started_at + interval. Form no longer
            // sends it; ??= leaves any sent value alone (override path) but fills in
            // when the field isn't present or is null.
            $validated['next_billing_date'] ??= Subscription::computeNextBillingDate(
                $validated['started_at'],
                $validated['interval'],
            );

            Subscription::create([
                ...$validated,
                'user_id' => $request->user()->id,
            ]);

            return redirect()
                ->route('subscriptions.index')
                ->with('success', 'Subscription added successfully.');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Failed to create subscription. Please try again.');
        }
    }

    public function update(UpdateSubscriptionRequest $request, Subscription $subscription): RedirectResponse
    {
        try {
            $validated = $request->validated();

            // Always rederive on update so an interval change propagates to the
            // next billing date. Fall back to the model's current values when
            // the form didn't include them (defensive — current form always does).
            $validated['next_billing_date'] = Subscription::computeNextBillingDate(
                $validated['started_at'] ?? $subscription->started_at,
                $validated['interval'] ?? $subscription->interval,
            );

            $subscription->update($validated);

            return redirect()
                ->route('subscriptions.index')
                ->with('success', 'Subscription updated successfully.');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Failed to update subscription. Please try again.');
        }
    }

    public function destroy(Subscription $subscription): RedirectResponse
    {
        $this->authorize('delete', $subscription);

        try {
            $subscription->delete();

            return back()->with('success', 'Subscription deleted successfully.');
        } catch (\Exception $e) {
            return back()
                ->with('error', 'Failed to delete subscription. Please try again.');
        }
    }
}
