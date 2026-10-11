/**
 * Meta and SEO Helpers for Aura Campus V2
 * Adheres to 07-DISCOVERY-SHARING-AND-SOCIAL-LINKS.md Section 5
 * Ensures private and unlisted paths emit noindex, nofollow
 * Ensures public profile/portfolio routes emit canonical and social Open Graph tags
 */

export interface MetaOptions {
  title: string;
  description?: string;
  canonicalPath?: string;
  isPublic?: boolean;
  ogImage?: string;
}

export function updatePageMeta(options: MetaOptions): void {
  // 1. Update Title
  const formattedTitle = options.title.includes('Aura Campus')
    ? options.title
    : `${options.title} | Aura Campus`;
  document.title = formattedTitle;

  // 2. Canonical URL
  const origin = window.location.origin;
  const canonicalUrl = options.canonicalPath ? `${origin}${options.canonicalPath}` : window.location.href;

  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', canonicalUrl);

  // 3. Robots Meta Tag (Enforce privacy guardrails)
  let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
  if (!robotsMeta) {
    robotsMeta = document.createElement('meta');
    robotsMeta.setAttribute('name', 'robots');
    document.head.appendChild(robotsMeta);
  }

  if (options.isPublic) {
    robotsMeta.setAttribute('content', 'index, follow');
  } else {
    // Private and unlisted resources MUST emit noindex, nofollow
    robotsMeta.setAttribute('content', 'noindex, nofollow');
  }

  // 4. Description Meta Tag
  if (options.description) {
    let descMeta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', options.description);
  }

  // 5. Open Graph Meta Tags
  setMetaProperty('og:title', formattedTitle);
  if (options.description) {
    setMetaProperty('og:description', options.description);
  }
  setMetaProperty('og:url', canonicalUrl);
  setMetaProperty('og:type', 'website');
  if (options.ogImage) {
    setMetaProperty('og:image', options.ogImage);
  }

  // 6. Twitter / X Card
  setMetaName('twitter:card', 'summary_large_image');
  setMetaName('twitter:title', formattedTitle);
  if (options.description) {
    setMetaName('twitter:description', options.description);
  }
}

function setMetaProperty(property: string, content: string): void {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setMetaName(name: string, content: string): void {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}
