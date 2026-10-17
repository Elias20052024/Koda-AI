# Server configuration

Set `AUTH_TOKEN_SECRET` to a securely provisioned value of at least 32 characters in production. The server signs bearer sessions with this secret and refuses to start in production when it is missing. Local development generates a process-only secret and warns that sessions will expire when the server restarts.

Social sign-in requires the existing Supabase project settings on the server (`SUPABASE_URL` and `SUPABASE_ANON_KEY`, or the existing `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`). The backend verifies the provider access token with Supabase before using its identity claims.

Existing plaintext passwords are upgraded to scrypt hashes on successful login. Signed sessions replace the previous unsigned development tokens, so users with an older browser session need to sign in again.

Run backend tests with `pnpm --filter @workspace/server test`.
