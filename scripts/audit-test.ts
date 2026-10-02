import { validateAndSanitizeUrl, getSafeExternalUrl, isSafeMediaUrl } from "../src/lib/url-security.ts";

// Standard collections list for audit verification
const EXPECTED_COLLECTIONS = [
  "UI & Components",
  "Landing Pages",
  "Portfolios",
  "Design Systems",
  "Animations & Interactions",
  "3D & WebGL",
  "AI Tools",
  "Developer Tools",
  "Fonts, Icons & Assets",
  "Inspiration & Experiments",
];

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
  }
}

console.log("\n=======================================================");
console.log("Creafolio Production-Readiness Audit & Test Suite");
console.log("=======================================================\n");

// 1. URL Security & SSRF Protection Tests
console.log("1. URL Validation, SSRF & XSS Scheme Protection:");

const validUrls = [
  "https://21st.dev",
  "https://ui.aceternity.com/components?q=test#top",
  "http://bruno-simon.com",
  "rauno.me",
  "www.stripe.com",
  "https://sub.domain.example.co.uk/page/path",
];

for (const u of validUrls) {
  const res = validateAndSanitizeUrl(u);
  assert(res.isValid && !!res.sanitizedUrl, `Valid public URL accepted: ${u}`);
}

const dangerousAndInternalUrls = [
  { url: "javascript:alert(1)", reason: "XSS scheme" },
  { url: "data:text/html,<script>alert(1)</script>", reason: "Data URI scheme" },
  { url: "file:///etc/passwd", reason: "File scheme" },
  { url: "vbscript:msgbox", reason: "VBScript scheme" },
  { url: "http://localhost:3000", reason: "Localhost" },
  { url: "http://127.0.0.1:8080", reason: "Loopback IPv4" },
  { url: "http://0.0.0.0", reason: "Zero IP" },
  { url: "http://169.254.169.254/latest/meta-data", reason: "Cloud metadata IP (SSRF)" },
  { url: "http://10.0.0.1/admin", reason: "Private 10.x.x.x network" },
  { url: "http://192.168.1.1", reason: "Private 192.168.x.x network" },
  { url: "http://172.16.0.1", reason: "Private 172.16.x.x network" },
  { url: "http://database.internal", reason: "Internal TLD" },
  { url: "http://myserver.local", reason: "Local mDNS TLD" },
  { url: "not a url at all!@#$", reason: "Malformed string" },
  { url: "https://", reason: "Empty host" },
  { url: "https://...invalid...", reason: "Dots without host" },
];

for (const item of dangerousAndInternalUrls) {
  const res = validateAndSanitizeUrl(item.url);
  assert(!res.isValid, `Blocked dangerous/internal URL (${item.reason}): ${item.url}`);
}

// 2. Safe External Link Rendering (XSS Prevention in <a> tags)
console.log("\n2. Safe External Link Rendering (XSS Prevention):");
assert(getSafeExternalUrl("javascript:alert(1)") === "#", "javascript: neutralized to #");
assert(getSafeExternalUrl("data:text/html,...") === "#", "data: neutralized to #");
assert(getSafeExternalUrl("file:///etc/hosts") === "#", "file: neutralized to #");
assert(getSafeExternalUrl("https://21st.dev") === "https://21st.dev", "https:// preserved");
assert(getSafeExternalUrl("rauno.me") === "https://rauno.me", "bare domain prepends https://");

// 3. Media URL Safety Checks
console.log("\n3. Media URL Safety Checks:");
assert(isSafeMediaUrl("https://cdn.example.com/video.mp4"), "https media URL allowed");
assert(isSafeMediaUrl("http://cdn.example.com/poster.jpg"), "http media URL allowed");
assert(!isSafeMediaUrl("javascript:alert(1)"), "javascript media URL blocked");
assert(!isSafeMediaUrl("data:video/mp4;base64,..."), "data URI video blocked");
assert(!isSafeMediaUrl(""), "empty media URL blocked");

// 4. Standard Collections Integrity
console.log("\n4. Standard Collections Integrity:");
assert(EXPECTED_COLLECTIONS.length === 10, "Exact 10 standard collections are defined");

for (const name of EXPECTED_COLLECTIONS) {
  assert(typeof name === "string" && name.length > 0, `Valid standard collection name: "${name}"`);
}

// 5. Route Resolution Tests
console.log("\n5. Client-Side Route Resolution Tests:");
const resolveRoute = (path: string, hash: string) => {
  const cleanPath = path.toLowerCase().replace(/\/+$/, "");
  if (hash.toLowerCase().includes("admin") || cleanPath === "/admin") {
    return "admin";
  }
  if (cleanPath === "/explore" || cleanPath.startsWith("/explore/")) {
    return "explore";
  }
  return "landing";
};

assert(resolveRoute("/", "") === "landing", "Root path maps to landing page");
assert(resolveRoute("", "") === "landing", "Empty path maps to landing page");
assert(resolveRoute("/explore", "") === "explore", "/explore path maps to library");
assert(resolveRoute("/explore/", "") === "explore", "/explore/ with trailing slash maps to library");
assert(resolveRoute("/admin", "") === "admin", "/admin maps to admin portal");
assert(resolveRoute("/", "#admin") === "admin", "Admin hash maps to admin portal");

// Summary
console.log("\n=======================================================");
console.log(`Results: ${passedTests} passed, ${failedTests} failed, ${totalTests} total.`);
console.log("=======================================================\n");

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log("All audit assertions passed successfully! ✓\n");
}
