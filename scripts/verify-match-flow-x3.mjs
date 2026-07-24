import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const results = [];

for (let i = 1; i <= 3; i += 1) {
  const page = await browser.newPage();
  const posts = [];
  const logs = [];

  page.on("request", (req) => {
    if (req.method() === "POST" && req.url().includes("/match")) {
      posts.push({
        url: req.url(),
        nextAction: req.headers()["next-action"] || null,
      });
    }
  });

  page.on("console", (msg) => {
    const text = msg.text();
    if (text.includes("[circle-match]")) {
      logs.push(text);
    }
  });

  await page.goto("http://127.0.0.1:3000/match", { waitUntil: "networkidle" });
  await page.waitForFunction(() => {
    const btn = [...document.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("Find my Circles"),
    );
    return btn && !btn.disabled;
  });

  await page.getByRole("button", { name: /Find my Circles/i }).click();

  await page.waitForURL("**/matches**", { timeout: 15000 });
  await page.waitForSelector("text=Three Circles", { timeout: 15000 });

  const url = page.url();
  const hasSid = /[?&]sid=/.test(url);
  const circleNames = await page.locator("h2, h3").allTextContents();

  results.push({
    attempt: i,
    postCount: posts.length,
    hasNextAction: Boolean(posts[0]?.nextAction),
    url,
    hasSid,
    onSubmitLogged: logs.some((l) => l.includes("MatchForm onSubmit fired")),
    circleNames: circleNames.filter((name) =>
      /Leadership Lab|Women Building|Founders in Progress|Mid-Career|Early Career|Returning|Work-Life|Career Transition/i.test(
        name,
      ),
    ),
  });

  await page.close();
}

console.log(JSON.stringify(results, null, 2));
await browser.close();

const allOk = results.every(
  (r) => r.postCount >= 1 && r.hasNextAction && r.hasSid && r.onSubmitLogged,
);
if (!allOk) process.exit(1);
