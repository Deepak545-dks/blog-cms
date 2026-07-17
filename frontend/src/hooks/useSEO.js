import { useEffect } from 'react';

const useSEO = ({ title, description, ogImage, canonicalUrl } = {}) => {
  useEffect(() => {
    // 1. Dynamic Page Title
    if (title) {
      document.title = `${title} | BlogCMS`;
    } else {
      document.title = 'BlogCMS | Modern Content Management System';
    }

    // Helper to query or create meta tags
    const setMetaTag = (attributeName, attributeValue, content) => {
      if (content === undefined || content === null) return;
      
      const selector = `meta[${attributeName}="${attributeValue}"]`;
      let element = document.querySelector(selector);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Meta Description
    setMetaTag('name', 'description', description || 'A professional, modern, and responsive Content Management System.');

    // 3. Open Graph Tags
    setMetaTag('property', 'og:title', title || 'BlogCMS');
    setMetaTag('property', 'og:description', description || 'A professional, modern, and responsive Content Management System.');
    setMetaTag('property', 'og:image', ogImage || 'http://localhost:5000/uploads/default-og-image.jpg');
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:url', canonicalUrl || window.location.href);

    // 4. Twitter Cards
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title || 'BlogCMS');
    setMetaTag('name', 'twitter:description', description || 'A professional, modern, and responsive Content Management System.');
    setMetaTag('name', 'twitter:image', ogImage || 'http://localhost:5000/uploads/default-og-image.jpg');

    // 5. Canonical Link
    const canonicalLinkSelector = 'link[rel="canonical"]';
    let canonicalElement = document.querySelector(canonicalLinkSelector);
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.setAttribute('href', canonicalUrl || window.location.href);

  }, [title, description, ogImage, canonicalUrl]);
};

export default useSEO;
