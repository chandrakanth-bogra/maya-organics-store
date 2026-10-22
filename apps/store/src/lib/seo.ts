/**
 * Schema.org JSON-LD for search engines and AI agents.
 * Prices come from the live catalogue, so rich results always match the page.
 */
import { SITE } from './site';
import { amount } from './format';
import type { CatalogueProduct } from './catalogue';
import type { Variant } from '@maya/db';

type Json = Record<string, unknown>;

const orgId = `${SITE.url}/#organization`;

export function organizationLd(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    '@id': orgId,
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/logo.png`,
    description: SITE.description,
    email: SITE.email,
    telephone: SITE.phoneDisplay.replace(/\s/g, ''),
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE.locality,
      addressRegion: SITE.region,
      addressCountry: SITE.country,
    },
    areaServed: { '@type': 'Country', name: 'India' },
    sameAs: [SITE.b2bUrl],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: SITE.phoneDisplay.replace(/\s/g, ''),
      availableLanguage: ['en', 'hi', 'te'],
    },
  };
}

export function websiteLd(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    publisher: { '@id': orgId },
    inLanguage: 'en-IN',
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE.url}${it.path}`,
    })),
  };
}

const variantName = (p: CatalogueProduct, v: Variant) =>
  [p.name, v.grainSize, v.packSize].filter(Boolean).join(' — ');

function offer(url: string, v: Variant): Json {
  return {
    '@type': 'Offer',
    url,
    sku: v.sku,
    price: amount(v.price),
    priceCurrency: SITE.currency,
    availability: v.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@id': orgId },
  };
}

/**
 * One size → Product. Several sizes → ProductGroup with one Product per size
 * (Google's format for variants).
 */
export function productLd(p: CatalogueProduct, url: string, imageUrls: string[]): Json {
  const base = {
    '@context': 'https://schema.org',
    name: p.name,
    description: p.copy.data.description,
    image: imageUrls,
    category: p.category,
    brand: { '@type': 'Brand', name: SITE.name },
    additionalProperty: p.copy.data.specs.map((s) => ({ '@type': 'PropertyValue', name: s.label, value: s.value })),
  };

  if (p.variants.length <= 1) {
    const v = p.variants[0];
    return { ...base, '@type': 'Product', ...(v ? { sku: v.sku, offers: offer(url, v) } : {}) };
  }

  return {
    ...base,
    '@type': 'ProductGroup',
    productGroupID: p.slug,
    variesBy: [
      ...(p.variants.some((v) => v.grainSize) ? ['https://schema.org/size'] : []),
      'https://schema.org/weight',
    ],
    hasVariant: p.variants.map((v) => ({
      '@type': 'Product',
      name: variantName(p, v),
      sku: v.sku,
      ...(v.weightGrams ? { weight: { '@type': 'QuantitativeValue', value: v.weightGrams, unitCode: 'GRM' } } : {}),
      offers: offer(`${url}?size=${encodeURIComponent(v.sku)}`, v),
    })),
  };
}

export function faqLd(faqs: { q: string; a: string }[]): Json | null {
  if (!faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function itemListLd(products: CatalogueProduct[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE.url}/products/${p.slug}`,
      name: p.name,
    })),
  };
}

export function articleLd(a: { title: string; description: string; url: string; published: Date; updated?: Date; image?: string }): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    url: a.url,
    mainEntityOfPage: a.url,
    datePublished: a.published.toISOString().slice(0, 10),
    dateModified: (a.updated ?? a.published).toISOString().slice(0, 10),
    ...(a.image ? { image: [a.image] } : {}),
    author: { '@id': orgId },
    publisher: { '@id': orgId },
    inLanguage: 'en-IN',
  };
}

/** Serialise for a <script type="application/ld+json"> without breaking out of the tag. */
export const ldJson = (data: Json | Json[]) => JSON.stringify(data).replace(/</g, '\\u003c');
