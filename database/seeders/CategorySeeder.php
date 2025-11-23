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
            ['name' => 'Streaming Services', 'description' => 'Digital Video streaming platforms', 'color' => '#E53E3E', 'icon' => 'tv'],
            ['name' => 'Music & Audio', 'description' => 'Music streaming and podcast services', 'color' => '#DD6B20', 'icon' => 'music'],
            ['name' => 'Software & Apps', 'description' => 'Desktop and mobile applications', 'color' => '#38B2AC', 'icon' => 'app-window'],
            ['name' => 'Cloud Storage', 'description' => 'Online file storage and backup services', 'color' => '#3182CE', 'icon' => 'cloud'],
            ['name' => 'Gaming', 'description' => 'Gaming platforms and subscriptions', 'color' => '#48BB78', 'icon' => 'gamepad-2'],
            ['name' => 'News & Publications', 'description' => 'Digital newspapers and magazines', 'color' => '#D69E2E', 'icon' => 'newspaper'],
            ['name' => 'Learning & Education', 'description' => 'Online courses and educational platforms', 'color' => '#9F7AEA', 'icon' => 'graduation-cap'],
            ['name' => 'Productivity Tools', 'description' => 'Work and project management tools', 'color' => '#00B5D8', 'icon' => 'briefcase'],
            ['name' => 'AI Services', 'description' => 'AI assistants and machine learning tools', 'color' => '#F6AD55', 'icon' => 'bot'],
            ['name' => 'Developer Tools', 'description' => 'IDEs, APIs, and coding resources', 'color' => '#4299E1', 'icon' => 'code'],
            ['name' => 'Design & Creative', 'description' => 'Design software and creative suites', 'color' => '#ED64A6', 'icon' => 'palette'],
            ['name' => 'Health & Fitness', 'description' => 'Fitness apps and health tracking', 'color' => '#4FD1C5', 'icon' => 'heart-pulse'],
            ['name' => 'Social Media', 'description' => 'Social networking premium features', 'color' => '#FC8181', 'icon' => 'share-2'],
            ['name' => 'Communication', 'description' => 'Messaging and video call services', 'color' => '#F687B3', 'icon' => 'message-circle'],
            ['name' => 'Security & Privacy', 'description' => 'Antivirus and privacy protection tools', 'color' => '#F56565', 'icon' => 'shield'],
            ['name' => 'VPN & Networking', 'description' => 'VPN services and network utilities', 'color' => '#667EEA', 'icon' => 'network'],
            ['name' => 'Finance & Banking', 'description' => 'Banking apps and financial services', 'color' => '#68D391', 'icon' => 'wallet'],
            ['name' => 'Domain & Hosting', 'description' => 'Web hosting and domain registrars', 'color' => '#A0AEC0', 'icon' => 'server'],
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
            ['description', 'color', 'icon', 'slug', 'is_system', 'updated_at']
        );
    }
}
