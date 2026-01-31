# Supabase Backend

This folder contains the backend configuration for Supabase, including database migrations and edge functions.

## Structure

- **config.toml** - Supabase project configuration
- **migrations/** - SQL database migrations
- **functions/** - TypeScript edge functions (serverless)

## Development

### Start Supabase locally

```bash
supabase start
```

### Stop Supabase

```bash
supabase stop
```

### Run migrations

```bash
supabase migration up
```

## Edge Functions

### hello-world

Basic example edge function that returns a greeting.

**Endpoint:** `POST /functions/v1/hello-world`

**Body:**

```json
{
  "name": "World"
}
```

### send-email

Email sending function (requires email service integration).

**Endpoint:** `POST /functions/v1/send-email`

**Body:**

```json
{
  "to": "user@example.com",
  "subject": "Hello",
  "html": "<p>Your message</p>"
}
```

## Database Schema

See `migrations/` folder for database structure. Currently includes:

- `profiles` table with user profile information
- Row Level Security (RLS) policies for data access control
