// client/src/lib/usePageMeta.tsx
import { useEffect } from "react";

export default function usePageMeta(
  title?: string,
  description?: string,
  canonical?: string,
  image?: string
) {
  useEffect(() => {
    // Title
    if (title) document.title = title;

    // Description meta
    if (description) {
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", description);
    }

    // Helper to add/update meta by property (og:) or name
    function upsertMeta(attrName: "name" | "property", attrValue: string, content: string) {
      const selector = attrName === "property"
        ? `meta[property="${attrValue}"]`
        : `meta[name="${attrValue}"]`;
      let m = document.querySelector(selector) as HTMLMetaElement | null;
      if (!m) {
        m = document.createElement("meta");
        m.setAttribute(attrName, attrValue);
        document.head.appendChild(m);
      }
      m.setAttribute("content", content);
    }

    // Open Graph
    if (title) upsertMeta("property", "og:title", title);
    if (description) upsertMeta("property", "og:description", description);
    if (image) upsertMeta("property", "og:image", image);

    // Twitter card
    if (title) upsertMeta("name", "twitter:title", title);
    if (description) upsertMeta("name", "twitter:description", description);
    if (image) upsertMeta("name", "twitter:image", image);
    upsertMeta("name", "twitter:card", "summary_large_image");

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonical || window.location.href);

    // cleanup not necessary for SPA since we overwrite values on next calls
  }, [title, description, canonical, image]);
    }
