// client/src/lib/usePageMeta.tsx

import { useEffect } from "react";

interface MetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
}

export function usePageMeta({
  title = "AIMAI - Smart AI for NEET, JEE & NCERT",
  description = "Get instant AI-powered solutions for NEET, JEE & NCERT questions. Aimai helps students solve complex problems in seconds with smart, human-like AI answers.",
  keywords = "NEET AI, JEE AI, NCERT solutions, NEET preparation, Aimai app, AI for students, Study AI, Aimai study app",
  canonical = "https://aimai.onrender.com",
}: MetaProps) {
  useEffect(() => {
    document.title = title;

    const metaDesc = document.querySelector("meta[name='description']");
    const metaKeywords = document.querySelector("meta[name='keywords']");
    const linkCanonical = document.querySelector("link[rel='canonical']");

    if (metaDesc) metaDesc.setAttribute("content", description);
    if (metaKeywords) metaKeywords.setAttribute("content", keywords);

    if (linkCanonical) {
      linkCanonical.setAttribute("href", canonical);
    } else {
      const link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      link.setAttribute("href", canonical);
      document.head.appendChild(link);
    }
  }, [title, description, keywords, canonical]);
}
