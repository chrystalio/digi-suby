<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Service;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
    // Get all system categories by name for mapping
    $categories = Category::where('is_system', true)
        ->pluck('id', 'name')
        ->toArray();

    $services = [
        // Streaming Services
        ['name' => 'Netflix', 'url' => 'https://netflix.com', 'category' => 'Streaming Services'],
        ['name' => 'Disney+', 'url' => 'https://disneyplus.com', 'category' => 'Streaming Services'],
        ['name' => 'Hulu', 'url' => 'https://hulu.com', 'category' => 'Streaming Services'],
        ['name' => 'HBO Max', 'url' => 'https://hbomax.com', 'category' => 'Streaming Services'],
        ['name' => 'Amazon Prime Video', 'url' => 'https://primevideo.com', 'category' => 'Streaming Services'],
        ['name' => 'Apple TV+', 'url' => 'https://tv.apple.com', 'category' => 'Streaming Services'],
        ['name' => 'Paramount+', 'url' => 'https://paramountplus.com', 'category' => 'Streaming Services'],
        ['name' => 'Max', 'url' => 'https://max.com', 'category' => 'Streaming Services'],
        ['name' => 'YouTube Premium', 'url' => 'https://youtube.com/premium', 'category' => 'Streaming Services'],
        ['name' => 'Crunchyroll', 'url' => 'https://crunchyroll.com', 'category' => 'Streaming Services'],
        ['name' => 'Vidio', 'url' => 'https://vidio.com', 'category' => 'Streaming Services'],
        ['name' => 'Viu', 'url' => 'https://viu.com', 'category' => 'Streaming Services'],
        ['name' => 'Vision+', 'url' => 'https://visionplus.id', 'category' => 'Streaming Services'],
        ['name' => 'Twitch Turbo', 'url' => 'https://twitch.tv', 'category' => 'Streaming Services'],
        ['name' => 'Peacock', 'url' => 'https://peacocktv.com', 'category' => 'Streaming Services'],
        ['name' => 'MUBI', 'url' => 'https://mubi.com', 'category' => 'Streaming Services'],
        ['name' => 'Curiosity Stream', 'url' => 'https://curiositystream.com', 'category' => 'Streaming Services'],
        ['name' => 'iQIYI', 'url' => 'https://iq.com', 'category' => 'Streaming Services'],
        ['name' => 'Discovery+', 'url' => 'https://discoveryplus.com', 'category' => 'Streaming Services'],
        ['name' => 'WeTV', 'url' => 'https://wetv.com', 'category' => 'Streaming Services'],

        // Music & Audio
        ['name' => 'Spotify', 'url' => 'https://spotify.com', 'category' => 'Music & Audio'],
        ['name' => 'Apple Music', 'url' => 'https://music.apple.com', 'category' => 'Music & Audio'],
        ['name' => 'YouTube Music', 'url' => 'https://music.youtube.com', 'category' => 'Music & Audio'],
        ['name' => 'Tidal', 'url' => 'https://tidal.com', 'category' => 'Music & Audio'],
        ['name' => 'Amazon Music Unlimited', 'url' => 'https://music.amazon.com', 'category' => 'Music & Audio'],
        ['name' => 'Audible', 'url' => 'https://audible.com', 'category' => 'Music & Audio'],
        ['name' => 'SoundCloud Go+', 'url' => 'https://soundcloud.com', 'category' => 'Music & Audio'],

        // Software & Apps
        ['name' => 'Microsoft 365', 'url' => 'https://microsoft.com/microsoft-365', 'category' => 'Software & Apps'],
        ['name' => 'Adobe Creative Cloud', 'url' => 'https://adobe.com/creativecloud', 'category' => 'Software & Apps'],
        ['name' => 'Evernote', 'url' => 'https://evernote.com', 'category' => 'Software & Apps'],
        ['name' => 'CleanMyMac', 'url' => 'https://macpaw.com', 'category' => 'Software & Apps'],
        ['name' => 'Parallels Desktop', 'url' => 'https://parallels.com', 'category' => 'Software & Apps'],

        // Cloud Storage
        ['name' => 'Google One', 'url' => 'https://google.com/one', 'category' => 'Cloud Storage'],
        ['name' => 'iCloud+', 'url' => 'https://icloud.com', 'category' => 'Cloud Storage'],
        ['name' => 'OneDrive', 'url' => 'https://onedrive.com', 'category' => 'Cloud Storage'],
        ['name' => 'MEGA', 'url' => 'https://mega.io', 'category' => 'Cloud Storage'],
        ['name' => 'Dropbox', 'url' => 'https://dropbox.com', 'category' => 'Cloud Storage'],

        // Gaming
        ['name' => 'Xbox Game Pass', 'url' => 'https://xbox.com/gamepass', 'category' => 'Gaming'],
        ['name' => 'PlayStation Plus', 'url' => 'https://playstation.com/plus', 'category' => 'Gaming'],
        ['name' => 'Nintendo Switch Online', 'url' => 'https://nintendo.com/switch-online', 'category' => 'Gaming'],
        ['name' => 'EA Play', 'url' => 'https://ea.com/ea-play', 'category' => 'Gaming'],
        ['name' => 'Discord Nitro', 'url' => 'https://discord.com/nitro', 'category' => 'Gaming'],
        ['name' => 'Steam', 'url' => 'https://store.steampowered.com', 'category' => 'Gaming'],
        ['name' => 'Ubisoft+', 'url' => 'https://ubisoftconnect.com', 'category' => 'Gaming'],
        ['name' => 'NVIDIA GeForce Now', 'url' => 'https://nvidia.com/geforce-now', 'category' => 'Gaming'],
        ['name' => 'Humble Bundle', 'url' => 'https://humblebundle.com', 'category' => 'Gaming'],
        ['name' => 'Epic Games Store', 'url' => 'https://epicgames.com', 'category' => 'Gaming'],
        ['name' => 'Roblox Premium', 'url' => 'https://roblox.com', 'category' => 'Gaming'],
        ['name' => 'Mobile Legends (Starlight)', 'url' => 'https://mobilelegends.com', 'category' => 'Gaming'],

        // Lifestyle & Delivery
        ['name' => 'Tokopedia Plus', 'url' => 'https://tokopedia.com', 'category' => 'Lifestyle & Delivery'],
        ['name' => 'GrabUnlimited', 'url' => 'https://grab.com', 'category' => 'Lifestyle & Delivery'],
        ['name' => 'Gojek Plus', 'url' => 'https://gojek.com', 'category' => 'Lifestyle & Delivery'],
        ['name' => 'Shopee VIP', 'url' => 'https://shopee.co.id', 'category' => 'Lifestyle & Delivery'],

        // Creator Support
        ['name' => 'Patreon', 'url' => 'https://patreon.com', 'category' => 'Creator Support'],
        ['name' => 'YouTube Membership', 'url' => 'https://youtube.com', 'category' => 'Creator Support'],
        ['name' => 'KaryaKarsa', 'url' => 'https://karyakarsa.com', 'category' => 'Creator Support'],
        ['name' => 'OnlyFans', 'url' => 'https://onlyfans.com', 'category' => 'Creator Support'],
        ['name' => 'Instagram Subscriptions', 'url' => 'https://instagram.com', 'category' => 'Creator Support'],
        ['name' => 'Tiktok Subscriptions', 'url' => 'https://tiktok.com', 'category' => 'Creator Support'],
        ['name' => 'Tiktok Gifts', 'url' => 'https://tiktok.com', 'category' => 'Creator Support'],
        ['name' => 'GankNow', 'url' => 'https://ganknow.com', 'category' => 'Creator Support'],
        ['name' => 'Saweria', 'url' => 'https://saweria.co', 'category' => 'Creator Support'],

        // News & Publications
        ['name' => 'The New York Times', 'url' => 'https://nytimes.com', 'category' => 'News & Publications'],
        ['name' => 'The Economist', 'url' => 'https://economist.com', 'category' => 'News & Publications'],
        ['name' => 'Medium', 'url' => 'https://medium.com', 'category' => 'News & Publications'],
        ['name' => 'Substack', 'url' => 'https://substack.com', 'category' => 'News & Publications'],
        ['name' => 'Tempo', 'url' => 'https://tempo.co', 'category' => 'News & Publications'],

        // Learning & Education
        ['name' => 'Coursera Plus', 'url' => 'https://coursera.com', 'category' => 'Learning & Education'],
        ['name' => 'Udemy', 'url' => 'https://udemy.com', 'category' => 'Learning & Education'],
        ['name' => 'Duolingo Super', 'url' => 'https://duolingo.com', 'category' => 'Learning & Education'],
        ['name' => 'Brilliant', 'url' => 'https://brilliant.org', 'category' => 'Learning & Education'],
        ['name' => 'Ruangguru', 'url' => 'https://ruangguru.com', 'category' => 'Learning & Education'],
        ['name' => 'Zenius', 'url' => 'https://zenius.net', 'category' => 'Learning & Education'],

        // Productivity Tools
        ['name' => 'Slack', 'url' => 'https://slack.com', 'category' => 'Productivity Tools'],
        ['name' => 'Asana', 'url' => 'https://asana.com', 'category' => 'Productivity Tools'],
        ['name' => 'Trello', 'url' => 'https://trello.com', 'category' => 'Productivity Tools'],
        ['name' => 'Todoist', 'url' => 'https://todoist.com', 'category' => 'Productivity Tools'],
        ['name' => 'Notion', 'url' => 'https://notion.com', 'category' => 'Productivity Tools'],
        ['name' => 'Kairu', 'url' => 'https://kairu.app', 'category' => 'Productivity Tools'],
        ['name' => 'ClickUp', 'url' => 'https://clickup.com', 'category' => 'Productivity Tools'],
        ['name' => 'Monday.com', 'url' => 'https://monday.com', 'category' => 'Productivity Tools'],
        ['name' => 'Superhuman', 'url' => 'https://superhuman.com', 'category' => 'Productivity Tools'],
        ['name' => 'Zapier', 'url' => 'https://zapier.com', 'category' => 'Productivity Tools'],
        ['name' => 'Grammarly', 'url' => 'https://grammarly.com', 'category' => 'Productivity Tools'],
        ['name' => 'Loom', 'url' => 'https://loom.com', 'category' => 'Productivity Tools'],

        // AI Services
        ['name' => 'ChatGPT', 'url' => 'https://chat.openai.com', 'category' => 'AI Services'],
        ['name' => 'GitHub Copilot', 'url' => 'https://github.com/features/copilot', 'category' => 'AI Services'],
        ['name' => 'Claude', 'url' => 'https://claude.ai', 'category' => 'AI Services'],
        ['name' => 'Midjourney', 'url' => 'https://midjourney.com', 'category' => 'AI Services'],
        ['name' => 'Perplexity', 'url' => 'https://perplexity.ai', 'category' => 'AI Services'],
        ['name' => 'Z.ai', 'url' => 'https://z.ai', 'category' => 'AI Services'],
        ['name' => 'OpenRouter', 'url' => 'https://openrouter.com', 'category' => 'AI Services'],
        ['name' => 'Gemini', 'url' => 'https://gemini.google.com', 'category' => 'AI Services'],

        // Developer Tools
        ['name' => 'GitHub Pro', 'url' => 'https://github.com/pricing', 'category' => 'Developer Tools'],
        ['name' => 'GitKraken', 'url' => 'https://gitkraken.com', 'category' => 'Developer Tools'],
        ['name' => 'Raycast', 'url' => 'https://raycast.com', 'category' => 'Developer Tools'],
        ['name' => 'JetBrains All Products Pack', 'url' => 'https://jetbrains.com', 'category' => 'Developer Tools'],
        ['name' => 'BrowserStack', 'url' => 'https://browserstack.com', 'category' => 'Developer Tools'],
        ['name' => 'Datadog', 'url' => 'https://datadoghq.com', 'category' => 'Developer Tools'],
        ['name' => 'Supabase', 'url' => 'https://supabase.com', 'category' => 'Developer Tools'],
        ['name' => 'Postman', 'url' => 'https://postman.com', 'category' => 'Developer Tools'],
        ['name' => 'Travis CI', 'url' => 'https://travis-ci.com', 'category' => 'Developer Tools'],


        // Design & Creative
        ['name' => 'Figma', 'url' => 'https://figma.com', 'category' => 'Design & Creative'],
        ['name' => 'Sketch', 'url' => 'https://sketch.com', 'category' => 'Design & Creative'],
        ['name' => 'Envato Elements', 'url' => 'https://elements.envato.com', 'category' => 'Design & Creative'],
        ['name' => 'Canva', 'url' => 'https://canva.com', 'category' => 'Design & Creative'],

        // Health & Fitness
        ['name' => 'Headspace', 'url' => 'https://headspace.com', 'category' => 'Health & Fitness'],
        ['name' => 'Calm', 'url' => 'https://calm.com', 'category' => 'Health & Fitness'],
        ['name' => 'Strava', 'url' => 'https://strava.com', 'category' => 'Health & Fitness'],
        ['name' => 'MuscleWiki', 'url' => 'https://musclewiki.com', 'category' => 'Health & Fitness'],

        // Social Media
        ['name' => 'X Premium', 'url' => 'https://x.com', 'category' => 'Social Media'],
        ['name' => 'Telegram Premium', 'url' => 'https://telegram.org', 'category' => 'Social Media'],
        ['name' => 'Tinder Gold', 'url' => 'https://tinder.com', 'category' => 'Social Media'],
        ['name' => 'Meta Verified', 'url' => 'https://meta.com', 'category' => 'Social Media'],
        ['name' => 'LinkedIn Premium', 'url' => 'https://linkedin.com', 'category' => 'Social Media'],

        // Communication
        ['name' => 'Zoom', 'url' => 'https://zoom.com', 'category' => 'Communication'],
        ['name' => 'Google Workspace', 'url' => 'https://workspace.google.com', 'category' => 'Communication'],

        // Security & Privacy
        ['name' => '1Password', 'url' => 'https://1password.com', 'category' => 'Security & Privacy'],
        ['name' => 'Bitwarden', 'url' => 'https://bitwarden.com', 'category' => 'Security & Privacy'],
        ['name' => 'LastPass', 'url' => 'https://lastpass.com', 'category' => 'Security & Privacy'],
        ['name' => 'Dashlane', 'url' => 'https://dashlane.com', 'category' => 'Security & Privacy'],
        ['name' => 'ProtonMail', 'url' => 'https://proton.me', 'category' => 'Security & Privacy'],

        // VPN & Networking
        ['name' => 'ExpressVPN', 'url' => 'https://expressvpn.com', 'category' => 'VPN & Networking'],
        ['name' => 'NordVPN', 'url' => 'https://nordvpn.com', 'category' => 'VPN & Networking'],
        ['name' => 'Surfshark', 'url' => 'https://surfshark.com', 'category' => 'VPN & Networking'],
        ['name' => 'Hide My Ass', 'url' => 'https://hidemyass.com', 'category' => 'VPN & Networking'],

        // Finance & Banking
        ['name' => 'YNAB (You Need A Budget)', 'url' => 'https://ynab.com', 'category' => 'Finance & Banking'],
        ['name' => 'QuickBooks', 'url' => 'https://quickbooks.intuit.com', 'category' => 'Finance & Banking'],

        // Domain & Hosting
        ['name' => 'GoDaddy', 'url' => 'https://godaddy.com', 'category' => 'Domain & Hosting'],
        ['name' => 'Namecheap', 'url' => 'https://namecheap.com', 'category' => 'Domain & Hosting'],
        ['name' => 'Bluehost', 'url' => 'https://bluehost.com', 'category' => 'Domain & Hosting'],
        ['name' => 'Porkbun', 'url' => 'https://porkbun.com', 'category' => 'Domain & Hosting'],
        ['name' => 'Netlify', 'url' => 'https://netlify.com', 'category' => 'Domain & Hosting'],
        ['name' => 'Heroku', 'url' => 'https://heroku.com', 'category' => 'Domain & Hosting'],
        ['name' => 'Vercel', 'url' => 'https://vercel.com', 'category' => 'Domain & Hosting'],
        ['name' => 'DigitalOcean', 'url' => 'https://digitalocean.com', 'category' => 'Domain & Hosting'],
        ['name' => 'AWS', 'url' => 'https://aws.amazon.com', 'category' => 'Domain & Hosting'],
        ['name' => 'Cloudflare', 'url' => 'https://cloudflare.com', 'category' => 'Domain & Hosting'],
        ['name' => 'Hostinger', 'url' => 'https://hostinger.com', 'category' => 'Domain & Hosting'],
        ['name' => 'Railway', 'url' => 'https://railway.app', 'category' => 'Domain & Hosting'],
        ['name' => 'Render', 'url' => 'https://render.com', 'category' => 'Domain & Hosting'],
        ['name' => 'Fly.io', 'url' => 'https://fly.io', 'category' => 'Domain & Hosting'],
        ['name' => 'Linode', 'url' => 'https://linode.com', 'category' => 'Domain & Hosting'],
    ];

    $now = now();
    $servicesToInsert = [];

    foreach ($services as $service) {
        // Skip if category doesn't exist
        if (! isset($categories[$service['category']])) {
            continue;
        }

        $servicesToInsert[] = [
            'id' => (string) Str::ulid(),
            'name' => $service['name'],
            'slug' => Str::slug($service['name']),
            'url' => $service['url'],
            'category_id' => $categories[$service['category']],
            'is_system' => true,
            'user_id' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ];
    }

    // Use upsert to avoid duplicates on slug
    Service::upsert(
        $servicesToInsert,
        ['slug'],
        ['name', 'url', 'category_id', 'updated_at']
    );
}
}
