/**
 * SEO Utilities and Constants
 */

export const SEO_CONSTANTS = {
  BRAND_NAME: 'ResolveHub',
  BRAND_ALT_NAME: 'Get ResolveHub',
  WEBSITE_URL: 'https://getresolvehub.com',
  DESCRIPTION: 'ResolveHub is a QR-based complaint and feedback management SaaS that helps businesses capture complaints, track issues, and resolve them faster.',
  KEYWORDS: 'get resolve, getresolvehub, ResolveHub, complaint management system, feedback management SaaS, QR complaint system Ghana, customer feedback system, complaint tracking software',
  OG_IMAGE: 'https://getresolvehub.com/og-image.png',
  TWITTER_HANDLE: '@ResolveHub',
  CONTACT_EMAIL: 'support@getresolvehub.com',
  COUNTRY: 'GH',
  LANGUAGE: 'en',
};

export const PAGE_META = {
  home: {
    title: 'Get ResolveHub | Smart Complaint & Feedback Management SaaS',
    description: 'ResolveHub is a QR-based complaint and feedback management SaaS that helps businesses capture complaints, track issues, and resolve them faster.',
    keywords: 'get resolve, getresolvehub, ResolveHub, complaint management system, feedback management SaaS, QR complaint system',
  },
  pricing: {
    title: 'Pricing - Get ResolveHub | Complaint Management SaaS',
    description: 'Simple, transparent pricing for complaint management. Choose Starter at 150 GHS/month or Enterprise at 300 GHS/month. Start your free 14-day trial today.',
    keywords: 'ResolveHub pricing, complaint management cost, feedback system pricing, SaaS pricing Ghana',
  },
  about: {
    title: 'About ResolveHub | Smart Complaint Management Platform',
    description: 'Learn how ResolveHub helps businesses in Ghana capture and resolve customer complaints faster using QR-based feedback technology.',
    keywords: 'about ResolveHub, complaint management platform, customer feedback system, ResolveHub story',
  },
  contact: {
    title: 'Contact ResolveHub | Get Support for Complaint Management',
    description: 'Get in touch with ResolveHub team. We\'re here to help with questions about our complaint management system and QR feedback platform.',
    keywords: 'contact ResolveHub, complaint system support, feedback management help, ResolveHub contact',
  },
};

/**
 * Generate breadcrumb schema for navigation
 * @param {Array} breadcrumbs - Array of {name, url} objects
 * @returns {Object} JSON-LD breadcrumb list schema
 */
export function generateBreadcrumbSchema(breadcrumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SEO_CONSTANTS.WEBSITE_URL}${item.url}`,
    })),
  };
}

/**
 * Generate article schema for blog/content pages
 * @param {Object} article - Article metadata
 * @returns {Object} JSON-LD article schema
 */
export function generateArticleSchema(article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
    datePublished: article.publishDate,
    dateModified: article.modifiedDate,
    author: {
      '@type': 'Organization',
      name: SEO_CONSTANTS.BRAND_NAME,
    },
  };
}

/**
 * Generate FAQ schema
 * @param {Array} faqs - Array of {q, a} objects
 * @returns {Object} JSON-LD FAQ schema
 */
export function generateFAQSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };
}

/**
 * Generate product/pricing schema
 * @param {Object} product - Product metadata
 * @returns {Object} JSON-LD product schema
 */
export function generateProductSchema(product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: SEO_CONSTANTS.BRAND_NAME,
    },
    offers: {
      '@type': 'Offer',
      url: product.url,
      priceCurrency: product.currency || 'GHS',
      price: product.price,
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: product.rating && {
      '@type': 'AggregateRating',
      ratingValue: product.rating.value,
      ratingCount: product.rating.count,
    },
  };
}

export default {
  SEO_CONSTANTS,
  PAGE_META,
  generateBreadcrumbSchema,
  generateArticleSchema,
  generateFAQSchema,
  generateProductSchema,
};
