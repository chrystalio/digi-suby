<?php

namespace Tests\Unit\Enums;

use App\Enums\SubscriptionInterval;
use PHPUnit\Framework\TestCase;

class SubscriptionIntervalTest extends TestCase
{
    public function test_label_returns_human_string_for_each_case(): void
    {
        $this->assertSame('Weekly', SubscriptionInterval::Weekly->label());
        $this->assertSame('Monthly', SubscriptionInterval::Monthly->label());
        $this->assertSame('Quarterly', SubscriptionInterval::Quarterly->label());
        $this->assertSame('Yearly', SubscriptionInterval::Yearly->label());
        $this->assertSame('Lifetime', SubscriptionInterval::Lifetime->label());
    }

    public function test_interval_days_returns_expected_values(): void
    {
        $this->assertSame(7, SubscriptionInterval::Weekly->intervalDays());
        $this->assertSame(30, SubscriptionInterval::Monthly->intervalDays());
        $this->assertSame(90, SubscriptionInterval::Quarterly->intervalDays());
        $this->assertSame(365, SubscriptionInterval::Yearly->intervalDays());
        $this->assertNull(SubscriptionInterval::Lifetime->intervalDays());
    }
}
