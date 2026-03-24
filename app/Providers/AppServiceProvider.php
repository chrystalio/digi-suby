<?php

namespace App\Providers;

use App\Models\Category;
use App\Models\PaymentMethod;
use App\Models\Service;
use App\Policies\CategoryPolicy;
use App\Policies\PaymentMethodPolicy;
use App\Policies\ServicePolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Category::class, CategoryPolicy::class);
        Gate::policy(PaymentMethod::class, PaymentMethodPolicy::class);
        Gate::policy(Service::class, ServicePolicy::class);

    }
}
