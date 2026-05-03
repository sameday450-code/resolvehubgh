import { useEffect } from 'react';

/**
 * Inject JSON-LD structured data directly into the document head
 * Useful for additional schema.org data that Helmet doesn't handle
 *
 * @param {Object} data - JSON-LD structured data object
 */
export function useStructuredData(data) {
  useEffect(() => {
    if (!data) return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(data);
    script.id = `structured-data-${Date.now()}`;

    document.head.appendChild(script);

    return () => {
      const element = document.getElementById(script.id);
      if (element) {
        element.remove();
      }
    };
  }, [data]);
}

export default useStructuredData;
