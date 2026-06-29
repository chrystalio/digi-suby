<?php

namespace Tests\Unit\Enums;

use App\Enums\Currency;
use PHPUnit\Framework\TestCase;

class CurrencyTest extends TestCase
{
    public function test_symbol_returns_expected_symbol_for_each_case(): void
    {
        $this->assertSame('$', Currency::USD->symbol());
        $this->assertSame('Rp', Currency::IDR->symbol());
        $this->assertSame('S$', Currency::SGD->symbol());
    }

    public function test_label_returns_full_name_for_each_case(): void
    {
        $this->assertSame('US Dollar', Currency::USD->label());
        $this->assertSame('Indonesian Rupiah', Currency::IDR->label());
        $this->assertSame('Singapore Dollar', Currency::SGD->label());
    }
}
