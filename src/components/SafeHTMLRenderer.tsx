import React from 'react';
import DOMPurify from 'dompurify';

interface SafeHTMLRendererProps {
  html: string;
  className?: string;
  allowedTags?: string[];
  allowedAttributes?: string[];
}

const SafeHTMLRenderer: React.FC<SafeHTMLRendererProps> = ({ 
  html, 
  className = '',
  allowedTags = ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a'],
  allowedAttributes = ['href', 'target', 'rel']
}) => {
  const cleanHTML = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit']
  });

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: cleanHTML }}
    />
  );
};

export default SafeHTMLRenderer;