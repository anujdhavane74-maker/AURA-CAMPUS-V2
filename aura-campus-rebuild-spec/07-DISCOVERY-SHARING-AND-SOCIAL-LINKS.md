# Discovery, Sharing, and Social Links

## 1. Discovery directory

- `/explore` lists only profiles with `visibility = public` and `discoverable = true`.
- Search supports normalized name/handle and, where indexed, public skills, program, institution, or interests.
- Filters must not reveal the existence of private accounts through counts, suggestions, “no results” differences, or autocomplete.
- Paginate results; rate-limit and monitor abusive scraping.
- Use a deterministic sort, such as relevance then recently updated, without claiming personalised ranking unless it exists.
- A user can disable discovery while keeping a public profile link if the product supports that distinction.

## 2. Canonical URLs

- Give each public profile a stable handle-based URL.
- Validate and reserve handles such as `admin`, `support`, `auth`, `explore`, `settings`, and route names.
- Handle changes must check uniqueness, preserve ownership, and optionally redirect the previous handle only when privacy policy allows it.
- Use a canonical URL configured from environment settings, not guessed from the current browser URL or hash routes.
- Do not place email addresses, internal auth IDs, private data, or raw share tokens in analytics/referrer URLs.

## 3. Sharing controls

For each shareable resource, offer only applicable options:
1. **Copy link** — write canonical URL to clipboard with a manual-select fallback.
2. **Native share** — use Web Share API when supported, otherwise expose copy-link.
3. **QR code** — encode the same canonical URL; show which audience it grants.
4. **Open preview** — opens a read-only visitor view.
5. **Revoke link / Unpublish** — available to owner, with confirmation where needed.

Avoid creating a share URL that serializes the entire profile into a query parameter. The server should resolve a short identifier or a high-entropy share token and return only the permitted resource.

## 4. Share-token requirements

- Generate tokens using a cryptographically secure random source.
- Store only a hash of the token.
- Link token to a resource, owner, creation time, optional expiration, and revocation state.
- Allow owner to revoke and optionally set expiration.
- Validate token server-side on every access; never rely on a client-side check.
- Do not log raw tokens. Redact them from error reporting and analytics.
- A share token grants read-only access to the exact resource and must not grant access to the owner's other resources or account.

## 5. Social previews and SEO

- Public profile and portfolio pages need crawler-readable title, description, canonical URL, Open Graph image/title/description, and appropriate Twitter/X card metadata.
- Generate metadata server-side or prerender the public page. Updating `<meta>` tags after client JavaScript executes is not enough for many social crawlers.
- Use a safe default image or owner-selected public cover image; never expose a private avatar/asset through the preview.
- Public content may be indexed; private content must emit noindex/no-follow and must not be included in sitemaps. For private resources, authorization must happen before content is returned; `noindex` is not access control.
- Unpublishing should remove sitemap entries and invalidate cache where possible.

## 6. Contact and outbound links

- Contact form is optional and controlled by the owner.
- Submit messages through a trusted endpoint with validation, rate limiting, spam protection, and a documented delivery mechanism.
- Do not tell a visitor a message was emailed if it was only stored locally or the provider did not confirm delivery.
- Validate `https` URLs, reject `javascript:` and unsafe schemes, and use safe external-link attributes.
- Contact email is not exposed unless the owner explicitly chooses to display it.

## 7. Sharing acceptance tests

- Copy-link and native-share fallback point to the correct canonical resource.
- Public link works in a logged-out browser and reveals only public-safe fields.
- Unlisted link works with a valid token and fails after revocation/expiry.
- Private resource cannot be fetched using a public slug alone.
- Social metadata is available to a crawler without executing client JavaScript.
- QR code resolves to the same route and visibility rules as the share dialog.
