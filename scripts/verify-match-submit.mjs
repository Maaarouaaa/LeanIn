import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const posts = [];

page.on("request", (req) => {
  if (req.method() === "POST" && req.url().includes("/match")) {
    posts.push({
      url: req.url(),
      method: req.method(),
      nextAction: req.headers()["next-action"] || null,
    });
  }
});

page.on("console", (msg) => {
  if (msg.text().includes("MatchForm onSubmit")) {
    console.log("CONSOLE:", msg.text());
  }
});

await page.goto("http://127.0.0.1:3000/match", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /Find my Circles/i }).waitFor({
  state: "visible",
});
await page.waitForFunction(() => {
  const btn = [...document.querySelectorAll("button")].find((b) =>
    b.textContent?.includes("Find my Circles"),
  );
  return btn && !btn.disabled;
});

await page.getByRole("button", { name: /Find my Circles/i }).click();
await page.waitForTimeout(4000);

console.log("POSTS:", JSON.stringify(posts, null, 2));
console.log("URL_AFTER:", page.url());

await browser.close();
if (!posts.length) process.exit(1);
