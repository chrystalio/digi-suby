<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Streaming Services', 'color' => '#E53E3E', 'icon' => 'tv'],
            ['name' => 'Music & Audio', 'color' => '#DD6B20', 'icon' => 'music'],
            ['name' => 'Software & Apps', 'color' => '#38B2AC', 'icon' => 'app-window'],
            ['name' => 'Cloud Storage', 'color' => '#3182CE', 'icon' => 'cloud'],
            ['name' => 'Gaming', 'color' => '#48BB78', 'icon' => 'gamepad-2'],
            ['name' => 'News & Publications', 'color' => '#D69E2E', 'icon' => 'newspaper'],
            ['name' => 'Learning & Education', 'color' => '#9F7AEA', 'icon' => 'graduation-cap'],
            ['name' => 'Productivity Tools', 'color' => '#00B5D8', 'icon' => 'briefcase'],
            ['name' => 'AI Services', 'color' => '#F6AD55', 'icon' => 'bot'],
            ['name' => 'Developer Tools', 'color' => '#4299E1', 'icon' => 'code'],
            ['name' => 'Design & Creative', 'color' => '#ED64A6', 'icon' => 'palette'],
            ['name' => 'Health & Fitness', 'color' => '#4FD1C5', 'icon' => 'heart-pulse'],
            ['name' => 'Social Media', 'color' => '#FC8181', 'icon' => 'share-2'],
            ['name' => 'Communication', 'color' => '#F687B3', 'icon' => 'message-circle'],
            ['name' => 'Security & Privacy', 'color' => '#F56565', 'icon' => 'shield'],
            ['name' => 'VPN & Networking', 'color' => '#667EEA', 'icon' => 'network'],
            ['name' => 'Finance & Banking', 'color' => '#68D391', 'icon' => 'wallet'],
            ['name' => 'Domain & Hosting', 'color' => '#A0AEC0', 'icon' => 'server'],
        ];

        $now = now();
        $categoriesWithTimestamps = collect($categories)->map(function ($category) use ($now) {
            return array_merge($category, [
                'slug' => Str::slug($category['name']),
                'is_system' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        })->toArray();

        Category::upsert(
            $categoriesWithTimestamps,
            ['name'],
            ['color', 'icon', 'slug', 'is_system', 'updated_at']
        );
    }
}
