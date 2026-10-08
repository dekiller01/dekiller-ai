const express = require("express");
const fetch = require("node-fetch");
const { URL } = require("url");

const router = express.Router();
const USER_AGENT = "Mozilla/5.0 (Android 10; Mobile) AppleWebKit/537.36 Chrome/140 Safari/537.36";
const MAX_RESULTS = 6;

function cleanQuery(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

function isPinterestPin(urlString) {
  try {
    const u = new URL(urlString);
    const host = u.hostname.toLowerCase();
    return (host === "pinterest.com" || host.endsWith(".pinterest.com")) &&
      /\/pin\//i.test(u.pathname);
  } catch {
    return false;
  }
}

function decodeSearchUrl(href) {
  try {
    const u = new URL(href, "https://duckduckgo.com");
    const redirected = u.searchParams.get("uddg");
    return redirected || u.toString();
  } catch {
    return href;
  }
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

async function searchDuckDuckGo(query) {
  const q = `site:pinterest.com/pin/ ${query}`;
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, "Accept": "text/html" },
    timeout: 15000
  });

  if (!response.ok) {
    throw new Error(`Search provider returned HTTP ${response.status}`);
  }

  const html = await response.text();
  const results = [];
  const linkRe = /<a[^>]+class=["'][^"']*result__a[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = linkRe.exec(html)) && results.length < MAX_RESULTS) {
    const url = decodeSearchUrl(match[1]);
    if (!isPinterestPin(url)) continue;

    const title = stripHtml(match[2]) || "Pinterest Pin";
    if (!results.some((item) => item.url === url)) {
      results.push({ title, url });
    }
  }

  return results;
}

async function getPinPreview(pin) {
  try {
    const response = await fetch(pin.url, {
      headers: { "User-Agent": USER_AGENT, "Accept": "text/html" },
      timeout: 12000
    });

    if (!response.ok) return pin;
    const html = await response.text();

    const imageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i);
    const descriptionMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["'][^>]*>/i) ||
      html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:description["'][^>]*>/i);

    return {
      ...pin,
      image: imageMatch ? imageMatch[1].replace(/&amp;/g, "&") : null,
      description: descriptionMatch ? stripHtml(descriptionMatch[1]) : ""
    };
  } catch {
    return pin;
  }
}

router.get("/search", async (req, res) => {
  const query = cleanQuery(req.query.q);
  if (!query) {
    return res.status(400).json({ error: "Falta el parámetro q." });
  }

  try {
    const pins = await searchDuckDuckGo(query);
    const previews = await Promise.all(pins.map(getPinPreview));

    res.json({
      query,
      source: "Pinterest public Pins via web search",
      count: previews.length,
      results: previews
    });
  } catch (error) {
    console.error("Pinterest search error:", error.message);
    res.status(502).json({
      error: "No se pudo consultar Pinterest en este momento.",
      detail: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

module.exports = router;
