import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO Component
 * Dynamically sets page-specific SEO meta tags and structured data
 * Use this component in any page that needs custom SEO
 *
 * @param {Object} props - SEO configuration
 * @param {string} props.title - Page title (appears in browser tab and search results)
 * @param {string} props.description - Meta description for search results
 * @param {string} props.keywords - Keywords for search optimization
 * @param {string} props.canonical - Canonical URL (defaults to current window URL)
 * @param {string} props.ogImage - Open Graph image URL
 * @param {string} props.ogType - Open Graph type (default: website)
 * @param {string} props.twitterHandle - Twitter handle for attribution
 * @param {string} props.author - Article author name
 * @param {string} props.publishDate - Article publish date (ISO format)
 * @param {string} props.modifiedDate - Article modified date (ISO format)
 * @param {boolean} props.noindex - Set to true to prevent indexing (default: false)
 * @param {Object} props.structuredData - Additional JSON-LD structured data
 *
 * @example
 * <SEO
 *   title="Get ResolveHub | Smart Complaint Management"
 *   description="QR-based complaint management SaaS..."
 *   keywords="complaint system, feedback management"
 *   ogImage="https://getresolvehub.com/og-image.png"
 * />
 */
export function SEO({
  title = 'Get ResolveHub | Smart Complaint & Feedback Management SaaS',
  description = 'ResolveHub is a QR-based complaint and feedback management SaaS that helps businesses capture complaints, track issues, and resolve them faster.',
  keywords = 'get resolve, getresolvehub, ResolveHub, complaint management system, feedback management SaaS, QR complaint system',
  canonical,
  ogImage = 'https://getresolvehub.com/og-image.png',
  ogType = 'website',
  twitterHandle = '@ResolveHub',
  author = 'ResolveHub',
  publishDate,
  modifiedDate,
  noindex = false,
  structuredData = null,
}) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta description if it exists, create if not
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords);

    // Update OG tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', title);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', description);

    let ogImg = document.querySelector('meta[property="og:image"]');
    if (!ogImg) {
      ogImg = document.createElement('meta');
      ogImg.setAttribute('property', 'og:image');
      document.head.appendChild(ogImg);
    }
    ogImg.setAttribute('content', ogImage);

    let ogTypeTag = document.querySelector('meta[property="og:type"]');
    if (!ogTypeTag) {
      ogTypeTag = document.createElement('meta');
      ogTypeTag.setAttribute('property', 'og:type');
      document.head.appendChild(ogTypeTag);
    }
    ogTypeTag.setAttribute('content', ogType);

    // Update robots meta tag
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (robotsMeta) {
      const robotsContent = noindex
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
      robotsMeta.setAttribute('content', robotsContent);
    }

    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    const canonicalUrl = canonical || window.location.href;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);
  }, [title, description, keywords, ogImage, ogType, canonical, noindex]);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={ogType} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:creator" content={twitterHandle} />
      {author && <meta name="author" content={author} />}
      {publishDate && <meta property="article:published_time" content={publishDate} />}
      {modifiedDate && <meta property="article:modified_time" content={modifiedDate} />}
      <link rel="canonical" href={canonical || window.location.href} />
      {structuredData && <script type="application/ld+json">{JSON.stringify(structuredData)}</script>}
    </Helmet>
  );
}

export default SEO;
