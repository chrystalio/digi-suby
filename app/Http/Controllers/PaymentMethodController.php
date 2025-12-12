<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentMethodRequest;
use App\Http\Requests\UpdatePaymentMethodRequest;
use App\Models\PaymentMethod;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentMethodController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $paymentMethods = PaymentMethod::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate($perPage);

        return inertia('payment-methods/index', [
            'paymentMethods' => $paymentMethods,
        ]);
    }

    public function store(StorePaymentMethodRequest $request): RedirectResponse
    {
        try {
            $this->authorize('create', PaymentMethod::class);
        } catch (AuthorizationException) {
            return redirect()
                ->route('payment-methods.index')
                ->with('error', 'You do not have permission to create payment methods.');
        }

        DB::beginTransaction();

        try {
            $data = [
                ...$request->validated(),
                'user_id' => $request->user()->id,
            ];

            if ($request->boolean('is_default')) {
                PaymentMethod::query()
                    ->where('user_id', $request->user()->id)
                    ->update(['is_default' => false]);
            }

            PaymentMethod::create($data);

            DB::commit();

            return redirect()
                ->route('payment-methods.index')
                ->with('success', 'Payment method added successfully.');

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Payment method creation failed', ['error' => $e->getMessage()]);

            return redirect()
                ->route('payment-methods.index')
                ->with('error', 'Failed to add payment method. Please try again.');
        }
    }

    public function update(UpdatePaymentMethodRequest $request, PaymentMethod $paymentMethod): RedirectResponse
    {
        try {
            $this->authorize('update', $paymentMethod);
        } catch (AuthorizationException) {
            return redirect()
                ->route('payment-methods.index')
                ->with('error', 'You do not have permission to update this payment method.');
        }

        DB::beginTransaction();

        try {
            // If setting as default, unset all other default payment methods
            if ($request->boolean('is_default') && ! $paymentMethod->is_default) {
                PaymentMethod::query()
                    ->where('user_id', $request->user()->id)
                    ->where('id', '!=', $paymentMethod->id)
                    ->update(['is_default' => false]);
            }

            $paymentMethod->update($request->validated());

            DB::commit();

            return redirect()
                ->route('payment-methods.index')
                ->with('success', 'Payment method updated successfully.');

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Payment method update failed', ['error' => $e->getMessage(), 'payment_method_id' => $paymentMethod->id]);

            return redirect()
                ->route('payment-methods.index')
                ->with('error', 'Failed to update payment method. Please try again.');
        }
    }

    public function destroy(PaymentMethod $paymentMethod): RedirectResponse
    {
        try {
            $this->authorize('delete', $paymentMethod);
        } catch (AuthorizationException) {
            return redirect()
                ->route('payment-methods.index')
                ->with('error', 'You do not have permission to delete this payment method.');
        }

        DB::beginTransaction();

        try {
            $paymentMethod->delete();

            DB::commit();

            return redirect()
                ->route('payment-methods.index')
                ->with('success', 'Payment method deleted successfully.');

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Payment method deletion failed', ['error' => $e->getMessage(), 'payment_method_id' => $paymentMethod->id]);

            return redirect()
                ->route('payment-methods.index')
                ->with('error', 'Failed to delete payment method. Please try again.');
        }
    }

    public function setDefault(Request $request, PaymentMethod $paymentMethod): RedirectResponse
    {
        try {
            $this->authorize('update', $paymentMethod);
        } catch (AuthorizationException) {
            return redirect()
                ->route('payment-methods.index')
                ->with('error', 'You do not have permission to update this payment method.');
        }

        DB::beginTransaction();

        try {
            // Unset other defaults
            PaymentMethod::query()
                ->where('user_id', $request->user()->id)
                ->where('is_default', true)
                ->update(['is_default' => false]);

            $paymentMethod->update(['is_default' => true]);

            DB::commit();

            return redirect()
                ->route('payment-methods.index')
                ->with('success', 'Default payment method updated.');

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Set default payment method failed', ['error' => $e->getMessage(), 'payment_method_id' => $paymentMethod->id]);

            return redirect()
                ->route('payment-methods.index')
                ->with('error', 'Failed to set default payment method. Please try again.');
        }
    }
}
