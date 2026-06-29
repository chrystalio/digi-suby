<?php

namespace Tests\Unit\Enums;

use App\Enums\Currency;
use PHPUnit\Framework\TestCase;

class CurrencyTest extends TestCase
{
    public function test_symbol_returns_expected_symbol_for_each_case(): void
    {
        $this->assertSame('$', Currency::USD->symbol());
        $this->assertSame('€', Currency::EUR->symbol());
        $this->assertSame('£', Currency::GBP->symbol());
        $this->assertSame('Rp', Currency::IDR->symbol());
        $this->assertSame('¥', Currency::JPY->symbol());
        $this->assertSame('A$', Currency::AUD->symbol());
        $this->assertSame('C$', Currency::CAD->symbol());
        $this->assertSame('S$', Currency::SGD->symbol());
        $this->assertSame('RM', Currency::MYR->symbol());
        $this->assertSame('₱', Currency::PHP->symbol());
    }

    public function test_label_returns_full_name_for_each_case(): void
    {
        $this->assertSame('US Dollar', Currency::USD->label());
        $this->assertSame('Euro', Currency::EUR->label());
        $this->assertSame('British Pound', Currency::GBP->label());
        $this->assertSame('Indonesian Rupiah', Currency::IDR->label());
        $this->assertSame('Japanese Yen', Currency::JPY->label());
        $this->assertSame('Australian Dollar', Currency::AUD->label());
        $this->assertSame('Canadian Dollar', Currency::CAD->label());
        $this->assertSame('Singapore Dollar', Currency::SGD->label());
        $this->assertSame('Malaysian Ringgit', Currency::MYR->label());
        $this->assertSame('Philippine Peso', Currency::PHP->label());
    }
}
