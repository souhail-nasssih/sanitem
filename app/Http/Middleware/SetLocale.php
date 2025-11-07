<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get locale from session, cookie, or default to 'fr'
        $locale = $request->session()->get('locale') 
            ?? $request->cookie('locale') 
            ?? config('app.locale', 'fr');

        // Ensure locale is valid (fr or ar)
        if (!in_array($locale, ['fr', 'ar'])) {
            $locale = 'fr';
        }

        // Set the application locale
        app()->setLocale($locale);

        return $next($request);
    }
}
