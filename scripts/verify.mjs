#!/usr/bin/env node
/**
 * verify.mjs — the ship gate, as code.
 *
 * Runs the full browser verification protocol against the production build:
 *   • desktop 1440×900 + mobile 390×844, every route passed as an arg
 *   • zero console errors / page errors (FAIL)
 *   • incremental scroll (triggers whileInView) + full-page screenshots
 *   • horizontal overflow check (FAIL)
 *   • reduced-motion pass — no text left stuck at opacity 0 (WARN)
 *   • keyboard pass — tab reaches interactive elements, focus visible (WARN)
 *
 * Usage:  npm run build && npm run verify -- / /about /contact
 * Exit 1 on any FAIL. Screenshots in ./verify-screens/ — LOOK at them.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";

const PORT = 4173;
const BASE = `http://localhost:${PORT}`;
const routes = process.argv.slice(2).filter((a) => a.startsWith("/"));
if (routes.length === 0) routes.push("/");
const viewports = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};
const results = [];
const add = (status, check, target, detail = "") =>
  results.push({ status, check, target, detail });

if (!existsSync("dist")) {
  console.error("FAIL: no dist/ — run `npm run build` first.");
  process.exit(1);
}
mkdirSync("verify-screens", { recursive: true });

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error(
    "FAIL: playwright not installed.\nRun: npm i -D playwright && npx playwright install chromium"
  );
  process.exit(1);
}

// Start `vite preview` and wait for it to answer.
const server = spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort"], {
  stdio: "ignore",
  detached: true,
});
const up = await (async () => {
  for (let i = 0; i < 60; i++) {
    try {
      await fetch(BASE);
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  return false;
})();
if (!up) {
  console.error("FAIL: vite preview did not start on :" + PORT);
  try { process.kill(-server.pid); } catch {}
  process.exit(1);
}

const slug = (r) => (r === "/" ? "home" : r.replace(/\W+/g, "-").replace(/^-|-$/g, ""));

const browser = await chromium.launch();
try {
  // ── Main pass: both viewports × every route ────────────────────────────
  for (const [vpName, viewport] of Object.entries(viewports)) {
    const ctx = await browser.newContext({ viewport });
    for (const route of routes) {
      const page = await ctx.newPage();
      const errors = [];
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      page.on("pageerror", (e) => errors.push(String(e)));
      const target = `${route} @ ${vpName}`;
      try {
        await page.goto(BASE + route, { waitUntil: "load", timeout: 30000 });
        await page.waitForTimeout(600);
        // Incremental scroll to bottom — triggers whileInView reveals.
        await page.evaluate(async () => {
          const step = window.innerHeight * 0.8;
          for (let y = 0; y <= document.body.scrollHeight; y += step) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 150));
          }
          window.scrollTo(0, document.body.scrollHeight);
        });
        await page.waitForTimeout(400);

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth
        );
        overflow > 1
          ? add("FAIL", "horizontal overflow", target, `${overflow}px too wide`)
          : add("PASS", "horizontal overflow", target);

        await page.screenshot({
          path: `verify-screens/${slug(route)}-${vpName}.png`,
          fullPage: true,
        });

        errors.length
          ? add("FAIL", "console/page errors", target, errors.slice(0, 3).join(" | "))
          : add("PASS", "console/page errors", target);
      } catch (e) {
        add("FAIL", "page load", target, String(e).slice(0, 200));
      }
      await page.close();
    }
    await ctx.close();
  }

  // ── Reduced-motion pass ─────────────────────────────────────────────────
  const rmCtx = await browser.newContext({
    viewport: viewports.desktop,
    reducedMotion: "reduce",
  });
  for (const route of routes) {
    const page = await rmCtx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    try {
      await page.goto(BASE + route, { waitUntil: "load", timeout: 30000 });
      await page.waitForTimeout(800);
      // Scroll through first — whileInView content must get its chance to enter,
      // exactly as a real reduced-motion user scrolling the page would see it.
      await page.evaluate(async () => {
        const step = window.innerHeight * 0.8;
        for (let y = 0; y <= document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
      });
      await page.waitForTimeout(500);
      // Text that stays invisible under reduced motion = content held hostage.
      const hidden = await page.evaluate(() => {
        const bad = [];
        for (const el of document.querySelectorAll("h1,h2,h3,p,li,a,button")) {
          const t = (el.textContent || "").trim();
          if (t.length < 10) continue;
          const s = getComputedStyle(el);
          if (parseFloat(s.opacity) < 0.05 || s.visibility === "hidden")
            bad.push(t.slice(0, 40));
        }
        return bad.slice(0, 5);
      });
      hidden.length
        ? add("WARN", "reduced-motion readability", route, `invisible text: ${hidden.join(" · ")}`)
        : add("PASS", "reduced-motion readability", route);
      if (errors.length) add("FAIL", "reduced-motion page errors", route, errors[0]);
    } catch (e) {
      add("FAIL", "reduced-motion load", route, String(e).slice(0, 200));
    }
    await page.close();
  }
  await rmCtx.close();

  // ── Keyboard pass (first route, desktop) ────────────────────────────────
  const kbCtx = await browser.newContext({ viewport: viewports.desktop });
  const kbPage = await kbCtx.newPage();
  try {
    await kbPage.goto(BASE + routes[0], { waitUntil: "load", timeout: 30000 });
    const focused = [];
    for (let i = 0; i < 12; i++) {
      await kbPage.keyboard.press("Tab");
      const info = await kbPage.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const s = getComputedStyle(el);
        return {
          desc: el.tagName + (el.textContent || "").trim().slice(0, 20),
          indicator: s.outlineStyle !== "none" || s.boxShadow !== "none",
        };
      });
      if (info) focused.push(info);
    }
    const distinct = new Set(focused.map((f) => f.desc));
    distinct.size >= 2
      ? add("PASS", "keyboard reachability", routes[0], `${distinct.size} elements reached`)
      : add("WARN", "keyboard reachability", routes[0], "fewer than 2 focusable elements reached by Tab");
    focused.length && !focused.some((f) => f.indicator)
      ? add("WARN", "focus visibility", routes[0], "no focused element showed outline/box-shadow")
      : add("PASS", "focus visibility", routes[0]);
  } catch (e) {
    add("FAIL", "keyboard pass", routes[0], String(e).slice(0, 200));
  }
  await kbPage.close();
  await kbCtx.close();
} finally {
  await browser.close();
  try { process.kill(-server.pid); } catch {}
  try { server.kill(); } catch {}
}

// ── Report ────────────────────────────────────────────────────────────────
const pad = (s, n) => String(s).padEnd(n);
console.log("\n" + pad("STATUS", 7) + pad("CHECK", 30) + pad("TARGET", 22) + "DETAIL");
for (const r of results)
  console.log(pad(r.status, 7) + pad(r.check, 30) + pad(r.target, 22) + r.detail);

const fails = results.filter((r) => r.status === "FAIL").length;
const warns = results.filter((r) => r.status === "WARN").length;
console.log(
  `\n${fails ? "❌ FAIL" : "✅ PASS"} — ${fails} fail, ${warns} warn, ` +
    `${results.length - fails - warns} pass. Screenshots: verify-screens/ (look at them).`
);
process.exit(fails ? 1 : 0);
