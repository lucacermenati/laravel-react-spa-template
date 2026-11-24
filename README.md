# React + Laravel session auth template

A starting point for a React app that authenticates with a **session cookie** against a Laravel backend running [Fortify](https://laravel.com/docs/fortify). It only contains the authentication and user features; build the app on top of it.

Vite, React, TypeScript, React Router, TanStack Query, React Hook Form, SCSS modules.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

| Variable | Example | |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000/api` | Base URL of the API, prefix included. Every path in `src/api/endpoints.ts` is appended to it. |
| `VITE_CSRF_COOKIE_URL` | `http://localhost:8000/sanctum/csrf-cookie` | Endpoint that sets the `XSRF-TOKEN` cookie. |

## Pages

| Route | Access | Backend call |
|---|---|---|
| `/login` | guest | `POST /login` |
| `/register` | guest | `POST /register` |
| `/forgot-password` | guest | `POST /forgot-password` |
| `/reset-password/:token?email=` | guest | `POST /reset-password` |
| `/email/verify` | logged in | `POST /email/verification-notification` |
| `/email/verify/:id/:hash?expires=&signature=` | logged in | `GET /email/verify/{id}/{hash}?expires=&signature=` |
| `/profile` | logged in, verified | `GET /user`, shown as JSON |
| `/profile-information` | logged in, verified | `PUT /user/profile-information` |
| `/password` | logged in, verified | `PUT /user/password` |
| `/confirm-password` | logged in, verified | `POST /user/confirm-password`, `GET /user/confirmed-password-status` |

Two factor authentication is not implemented.

## How it works

- `src/api/apiClient.ts` — `apiRequest()` sends the cookies with every request, adds the `X-XSRF-TOKEN` header to write requests (fetching the cookie first if needed, and once more after a `419`), and throws an `ApiError` carrying Laravel's `message` and `errors`.
- `src/auth/AuthProvider.tsx` — there is no token. The session is whatever `GET /user` answers: a user, or `401`. Login and registration reload the user; logout and any `401` clear it.
- `src/components/protected-route.tsx` and `guest-route.tsx` — route guards. A guest is sent to `/login` and brought back to the requested page after logging in. `requireVerified` sends unverified users to `/email/verify`.
- `src/utils/applyServerErrors.ts` — puts Laravel validation errors on the matching form fields.

## What the backend has to provide

- Fortify with `views` set to `false` and these features: registration, reset passwords, email verification, update profile information, update passwords. The routes must use the session (`web` middleware group, or Sanctum's stateful API) and sit under the `VITE_API_URL` prefix (`prefix` in `config/fortify.php`).
- `GET /user` under the same prefix, returning the logged in user as JSON (plain or wrapped in `data`) with `email_verified_at`, and `401` for guests.
- An endpoint that sets the `XSRF-TOKEN` cookie, like Sanctum's `GET /sanctum/csrf-cookie`.
- CORS for the SPA origin with `supports_credentials` enabled.
- The SPA and the backend on the same site (same registrable domain, or both on `localhost`), otherwise the browser does not send the session cookie and the SPA cannot read `XSRF-TOKEN`. For different subdomains, set `SESSION_DOMAIN` to the parent domain.
- A `User` model that implements `MustVerifyEmail`.
- Emailed links that open the SPA instead of the backend:

```php
// The SPA forwards id, hash and the signed query string to the API route.
VerifyEmail::createUrlUsing(function (object $notifiable) use ($frontendUrl) {
    $id = $notifiable->getKey();
    $hash = sha1($notifiable->getEmailForVerification());

    $signedApiUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(config('auth.verification.expire', 60)),
        ['id' => $id, 'hash' => $hash],
    );

    return "{$frontendUrl}/email/verify/{$id}/{$hash}?".parse_url($signedApiUrl, PHP_URL_QUERY);
});

ResetPassword::createUrlUsing(function (object $notifiable, string $token) use ($frontendUrl) {
    $email = urlencode($notifiable->getEmailForPasswordReset());

    return "{$frontendUrl}/reset-password/{$token}?email={$email}";
});
```

The verification link is signed for the URL of the API route, so `VITE_API_URL` has to be the same URL the backend generates for it.
