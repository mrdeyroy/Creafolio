/**
 * URL Validation and Security Utilities for Creafolio
 * Enforces safe public URLs, protects against SSRF, internal network probing, and XSS schemes.
 */

// Private IPv4 ranges (RFC 1918, RFC 3927, loopback, broadcast, test-net)
const PRIVATE_IP_PATTERNS = [
  /^127\./, // Loopback 127.0.0.0/8
  /^10\./, // Private 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private 172.16.0.0/12
  /^192\.168\./, // Private 192.168.0.0/16
  /^169\.254\./, // Link-local / Cloud Metadata 169.254.0.0/16 (AWS/GCP/Azure)
  /^0\./, // Current network 0.0.0.0/8
  /^224\./, // Multicast 224.0.0.0/4
  /^240\./, // Reserved
  /^255\.255\.255\.255$/,
  /^192\.0\.2\./, // TEST-NET-1
  /^198\.51\.100\./, // TEST-NET-2
  /^203\.0\.113\./, // TEST-NET-3
];

const DISALLOWED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "metadata.google.internal",
  "instance-data",
]);

const DISALLOWED_TLDS = [
  ".local",
  ".localhost",
  ".internal",
  ".lan",
  ".home",
  ".arpa",
  ".test",
  ".example",
  ".invalid",
];

export interface UrlValidationResult {
  isValid: boolean;
  sanitizedUrl?: string;
  domain?: string;
  error?: string;
}

/**
 * Validates, normalizes, and sanitizes a URL before saving or fetching metadata.
 */
export function validateAndSanitizeUrl(rawInput: string): UrlValidationResult {
  if (!rawInput || typeof rawInput !== "string") {
    return { isValid: false, error: "URL cannot be empty." };
  }

  let clean = rawInput.trim();

  // Guard against oversized inputs
  if (clean.length > 2048) {
    return { isValid: false, error: "URL is excessively long (maximum 2048 characters)." };
  }

  // Reject dangerous schemes explicitly
  const lower = clean.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("file:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("blob:")
  ) {
    return { isValid: false, error: "Invalid URL scheme. Only HTTP and HTTPS URLs are permitted." };
  }

  // Prepend https:// if protocol is omitted
  if (!/^https?:\/\//i.test(clean)) {
    clean = "https://" + clean;
  }

  let parsed: URL;
  try {
    parsed = new URL(clean);
  } catch {
    return { isValid: false, error: "Malformed URL syntax. Please enter a valid web address." };
  }

  // Enforce http or https protocol only
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { isValid: false, error: "Only web addresses starting with https:// or http:// are supported." };
  }

  const hostname = parsed.hostname.toLowerCase().trim();

  // Hostname validation
  if (!hostname || hostname.length < 3) {
    return { isValid: false, error: "Invalid domain name." };
  }

  if (hostname.includes(" ") || hostname.includes("\n") || hostname.includes("\t")) {
    return { isValid: false, error: "Domain name contains invalid whitespace characters." };
  }

  // Disallow explicit internal hostnames
  if (DISALLOWED_HOSTNAMES.has(hostname)) {
    return { isValid: false, error: "Localhost and loopback addresses cannot be added." };
  }

  // Disallow internal / reserved TLDs
  for (const tld of DISALLOWED_TLDS) {
    if (hostname.endsWith(tld)) {
      return { isValid: false, error: "Internal and private top-level domains are not allowed." };
    }
  }

  // Disallow private / local IPv4 address ranges (SSRF protection)
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      return { isValid: false, error: "Private, local, and cloud metadata IP addresses are not permitted." };
    }
  }

  // If not an IP, domain must contain at least one dot separating name and TLD
  const isIpv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  if (!isIpv4) {
    if (!hostname.includes(".")) {
      return { isValid: false, error: "Domain name must include a valid extension (e.g., .com, .dev, .io)." };
    }
    const parts = hostname.split(".");
    const tld = parts[parts.length - 1];
    if (tld.length < 2 || !/^[a-z0-9-]+$/i.test(tld)) {
      return { isValid: false, error: "Invalid top-level domain." };
    }
  }

  // Clean trailing slashes on bare domain paths
  let sanitized = parsed.toString();
  if (parsed.pathname === "/" && !parsed.search && !parsed.hash) {
    sanitized = sanitized.replace(/\/+$/, "");
  }

  const domain = hostname.replace(/^www\./, "");

  return {
    isValid: true,
    sanitizedUrl: sanitized,
    domain,
  };
}

/**
 * Returns a guaranteed safe external URL for rendering in <a> href attributes.
 * Prevents stored XSS injection via javascript: or data: URIs.
 */
export function getSafeExternalUrl(url: string | undefined | null): string {
  if (!url || typeof url !== "string") return "#";
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();

  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return "#";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return "https://" + trimmed;
}

/**
 * Sanitizes image and video preview URLs.
 */
export function isSafeMediaUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== "string") return false;
  const lower = url.trim().toLowerCase();
  return lower.startsWith("https://") || lower.startsWith("http://");
}
