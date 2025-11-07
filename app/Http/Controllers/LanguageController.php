<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;

class LanguageController extends Controller
{
    /**
     * Switch application language
     */
    public function switch(Request $request, string $locale)
    {
        // Validate locale
        if (!in_array($locale, ['fr', 'ar'])) {
            return redirect()->back()->with('error', 'Langue non valide.');
        }

        // Store locale in session
        $request->session()->put('locale', $locale);

        // Set locale cookie (expires in 1 year)
        $cookie = Cookie::make('locale', $locale, 60 * 24 * 365);

        return redirect()->back()->withCookie($cookie)->with('success', 'Langue changée avec succès.');
    }
}
