# Database Schema and Row-Level Security Plan

This document is a design contract, not an instruction to run destructive SQL against the existing Aura Campus database. Create migrations for a new environment first. Do not reuse the old prototype's database records automatically.

## 1. Proposed tables

### `profiles`
- `id uuid primary key references auth.users(id) on delete cascade`
- `handle text unique` (normalized, lowercase, reserved-word checked)
- `display_name text not null`
- `headline text`, `bio text`, `avatar_path text`, `cover_path text`
- `institution text`, `program text`, `graduation_year smallint`, `location_label text`
- `visibility text not null default 'private' check in ('private','public')`
- `discoverable boolean not null default false` (effective discovery must also require public visibility)
- `created_at`, `updated_at` timestamptz

Do not put private email or auth metadata in a public-readable profile row unless it is strictly required and independently protected. Prefer a separate private settings table.

### `profile_sections`
- `id uuid primary key`, `user_id uuid references profiles(id) on delete cascade`
- `section_type text`, `title text`, `content jsonb`, `sort_order integer`
- `visibility text default 'private' check in ('private','public')`
- `created_at`, `updated_at`

### `portfolios`
- `id uuid primary key`, `user_id uuid references profiles(id) on delete cascade`
- `slug text unique`, `title text`, `data jsonb` only for flexible portfolio content (prefer normalized child tables for frequently queried entities)
- `visibility text not null default 'private' check in ('private','public','unlisted_link')`
- `published_at timestamptz`, `created_at`, `updated_at`
- Do not overload one boolean such as `is_published` to represent every privacy state.

### `projects`
- `id uuid primary key`, `owner_id uuid references profiles(id) on delete cascade`
- `slug text`, `title text not null`, `summary text`, `problem text`, `approach text`, `outcome text`
- `technologies text[]`, `repository_url text`, `demo_url text`, `cover_path text`, `status text`
- `visibility text not null default 'private' check in ('private','public','unlisted_link')`
- `sort_order integer`, timestamps

### Additional normalized tables as needed
- `profile_skills(user_id, skill, proficiency, sort_order)`
- `education(id, user_id, institution, qualification, dates, description, visibility)`
- `experience(id, user_id, organization, role, dates, description, visibility)`
- `credentials(id, user_id, kind, title, issuer, issued_at, credential_url, visibility)`
- `external_links(id, user_id, label, url, visibility, sort_order)`
- `share_links(id, owner_id, resource_type, resource_id, token_hash, expires_at, revoked_at, created_at)`
- `reports(id, reporter_id nullable, resource_type, resource_id, reason, status, created_at)`
- `audit_events(id, actor_id, action, resource_type, resource_id, created_at, safe_metadata jsonb)` (no secrets/private payload snapshots)

Connection/follow tables are phase 2, not required for the initial release.

## 2. RLS policy rules

Enable RLS on every user-data table. No table is considered protected just because the UI hides a button.

- **Profile select:** authenticated owner can read own profile; anonymous/authenticated non-owners can read only fields deliberately exposed through a public-safe view/RPC when profile visibility is `public`. Avoid `select *` against base profile rows for anonymous clients.
- **Profile update/delete:** `auth.uid() = id` only, with server-side validation of allowed fields.
- **Sections:** owner CRUD only; public exposure through a controlled view/function that filters section visibility.
- **Portfolios/projects:** owner CRUD only. Public reads only when the relevant resource visibility is `public`; unlisted reads require a valid server-checked share token. Never allow a token to grant edit access.
- **Private data:** never expose private rows through a broad `OR` condition, unfiltered join, view with unsafe security-definer behavior, or storage policy.
- **Share links:** owner may list/revoke their links; raw tokens are shown only at creation time and are not stored in plaintext.
- **Storage:** object paths include owner ID; upload/update/delete policy checks path owner equals `auth.uid()`. Public asset delivery is allowed only for explicitly public assets; private media uses signed URLs.

## 3. Public data access pattern

Use a public-safe view or RPC with an explicit field allowlist. It must:
1. Resolve the requested handle/slug.
2. Check profile and resource visibility.
3. Return only permitted fields and sections.
4. Omit email, internal IDs where unnecessary, private settings, draft records, share-token hashes, moderation metadata, and private media paths.
5. Return a generic unavailable response for private/nonexistent resources if that reduces enumeration risk.

Verify actual behavior with an anonymous client, owner client, and a second authenticated user.

## 4. Constraints, indexes, and validation

- Unique normalized handles/slugs; reject reserved routes and malformed Unicode/control characters.
- Index `(visibility, updated_at)` only where useful for public discovery, and index normalized handle/slug for lookup.
- Add ownership and foreign-key indexes for child tables.
- Validate maximum lengths, allowed URL schemes (`https` preferred), arrays, payload size, and image metadata.
- Enforce enum/check constraints in the database as well as TypeScript types.
- Use pagination for public discovery and a deterministic order.

## 5. Migration rules

- Store every schema/policy change as a numbered migration.
- Test migrations from an empty database in CI or a disposable environment.
- Never drop or overwrite existing production tables as part of initial setup.
- Any legacy-data import is a separately approved project with a mapping, backup, dry run, and rollback plan.
