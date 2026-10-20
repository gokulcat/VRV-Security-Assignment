# Role Manager

A role-based user management app with a React frontend, Express API, Neon Managed
Auth, Neon PostgreSQL, and a Neon Function health check.

## Requirements

- Node.js 20 or newer
- A Neon project with PostgreSQL, Neon Auth, and Neon Functions enabled

## Neon setup

The Neon project is configured in `neon.ts`. From the project root:

```sh
npm install
neon login
```

If the Neon CLI is not installed globally, use `npx neon@latest` in place of
`neon`. The CLI writes private database credentials and service URLs to
`.env.local`; keep this file out of version control. This project uses
PostgreSQL, Neon Managed Auth, and Neon Functions. AI Gateway is not configured
because it is unavailable on the project's current Neon plan.

Before deploying the Function, provide its CORS origin to the CLI process:

```powershell
$env:CLIENT_ORIGIN = "http://localhost:3000"
$envFile = (Resolve-Path ".env.local").Path
neon deploy --env $envFile --yes
```

Use the deployed frontend's origin instead of localhost when deploying for
production. The Function will reject requests from origins not listed here.

Set the Neon Auth allowed origin to `http://localhost:3000` for local development.
For a deployed frontend, add its origin in Neon Auth and set the public frontend
build variables in the hosting provider:

- `REACT_APP_NEON_AUTH_BASE_URL` — value of `NEON_AUTH_BASE_URL`
- `REACT_APP_NEON_FUNCTION_HELLO_BASE_URL` — value of `NEON_FUNCTION_HELLO_BASE_URL`
- `REACT_APP_API_URL` — API base URL if the API is hosted separately; otherwise
  leave it empty

## Run locally

Install dependencies and run the API and frontend together:

```sh
npm install
npm run dev
```

The frontend is available at `http://localhost:3000` and the API at
`http://localhost:5000`. The React development server proxies `/api` requests to
the API. `.env.local` must contain the environment variables pulled by Neon;
`REACT_APP_NEON_AUTH_BASE_URL` and
`REACT_APP_NEON_FUNCTION_HELLO_BASE_URL` must be set for the frontend. Copy
the missing non-secret settings from `.env.example` into `.env.local` if needed;
do not overwrite the values pulled by the Neon CLI.

The API creates the `app_users` profile/role table on startup. Neon Auth owns
identity, credentials, and sessions; the app database stores the user's display
name, email, role, and access status. Existing accounts from the former MongoDB
database are not copied; users must register again with Neon Auth.

## Registration and roles

Registration lets each applicant choose **User** or **Admin**. The selected
role is saved to the application profile, and the single login page routes
admins to the management dashboard and users to their read-only dashboard.
Admins can change roles in the registered-users table; the Actions column is
not used.

**Security warning:** registration is public and selected Admin roles take
effect immediately. Anyone can register as an administrator and view/manage
registered application profiles. Use this only for a trusted/private demo.
For a public production app, disable public Admin registration and use an
administrator-controlled promotion flow.

No password is stored or managed by this app. Neon Auth handles credentials.

## API

All application API routes are under `/api/auth`. Protected endpoints require a
Neon Auth bearer token.

| Method | Path | Access |
| --- | --- | --- |
| `GET` | `/me` | Authenticated user |
| `PATCH` | `/me/role` | Authenticated user |
| `GET` | `/users` | Administrator |
| `PATCH` | `/users/:id/role` | Administrator |
| `PATCH` | `/users/:id/active` | Administrator |
| `GET` | `/admin` | Administrator test route |
| `GET` | `/user` | Authenticated user or administrator |

Neon identities are managed separately from application profiles. Removing
access disables the application's profile; it does not delete the Neon Auth
identity.

The deployed Neon Function health endpoint requires a valid Neon Auth token,
checks PostgreSQL connectivity, and is available from the admin dashboard.

## Scripts

- `npm run dev` — run API and React development server together
- `npm start` — run the API server
- `npm run client` — run the React development server
- `npm run build` — build the frontend
- `npm test` — run frontend tests once
- `npm run test:server` — run backend authentication and profile tests
- `npm run seed:admin` — promote the registered `ADMIN_EMAIL` profile

For production hosting, configure `DATABASE_URL`, `NEON_AUTH_BASE_URL`,
`NEON_AUTH_JWKS_URL`, `CLIENT_ORIGIN`, and the frontend build variables in the
hosting provider. Do not expose `DATABASE_URL` to the browser.
