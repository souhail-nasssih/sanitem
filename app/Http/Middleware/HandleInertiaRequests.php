<?php

namespace App\Http\Middleware;

use App\Models\VendeurEmployeeConfirmation;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();

        // Always load roles if user exists
        if ($user) {
            $user->load('roles');
        }

        // Check if user is Vendeur with pending confirmation
        $hasPendingConfirmation = false;
        if ($user && $user->hasRole('Vendeur')) {
            $vendeur = $user->vendeur;
            if ($vendeur) {
                $hasPendingConfirmation = VendeurEmployeeConfirmation::where('vendeur_id', $vendeur->id)
                    ->where('status', 'pending')
                    ->exists();
            }
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $user,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'locale' => app()->getLocale(),
            'translations' => $this->getTranslations(),
            'hasPendingConfirmation' => $hasPendingConfirmation,
            'pusher' => [
                'key' => config('broadcasting.connections.pusher.key'),
                'cluster' => config('broadcasting.connections.pusher.options.cluster'),
                'host' => config('broadcasting.connections.pusher.options.host'),
                'port' => config('broadcasting.connections.pusher.options.port'),
                'scheme' => config('broadcasting.connections.pusher.options.scheme'),
            ],
        ];
    }

    /**
     * Get translations for the current locale
     */
    protected function getTranslations(): array
    {
        $locale = app()->getLocale();
        $translations = [];

        // Load common translations
        if (file_exists(lang_path("{$locale}/common.php"))) {
            $translations = array_merge($translations, require lang_path("{$locale}/common.php"));
        }

        return $translations;
    }
}
