import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const base =
  process.env.TEST_URL || "http://127.0.0.1:5173/babylon-lite-cubybert/";
await mkdir("test-results", { recursive: true });
const browser = await chromium.launch({
  channel: "chromium",
  headless: true,
  args: ["--enable-unsafe-webgpu", "--ignore-gpu-blocklist"],
});
const errors = [];
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") {
      errors.push(m.text());
      console.error(m.text());
    }
  });
  await page.goto(base);
  await page.waitForFunction(
    () =>
      window.qbert?.snapshot().webgpu ||
      document.body.dataset.state === "error",
    {},
    { timeout: 60000 },
  );
  assert.equal(
    await page.evaluate(() => window.qbert.snapshot().webgpu),
    true,
    await page.locator("#overlay-copy").textContent(),
  );
  console.log("WebGPU initialized");
  await page.getByRole("button", { name: "LET’S HOP", exact: true }).click();
  await page.waitForFunction(
    () => window.qbert.snapshot().status === "playing",
  );
  await page.keyboard.press("s");
  await page.waitForFunction(() => window.qbert.snapshot().score === 25);
  assert.deepEqual(
    (await page.evaluate(() => window.qbert.snapshot())).player,
    { r: 1, c: 1 },
  );
  await page.keyboard.press("ArrowUp");
  await page.waitForFunction(() => window.qbert.snapshot().score === 50);
  await page
    .getByRole("button", { name: "Hop lower left", exact: true })
    .click();
  await page.waitForFunction(() => window.qbert.snapshot().score === 75);
  await page.keyboard.press("p");
  await page.waitForFunction(() => window.qbert.snapshot().status === "paused");
  const paused = await page.evaluate(() => window.qbert.snapshot());
  await page.waitForTimeout(700);
  assert.deepEqual(await page.evaluate(() => window.qbert.snapshot()), paused);
  await page.getByRole("button", { name: "RESUME", exact: true }).click();
  await page.screenshot({ path: "test-results/desktop.png" });
  await page.keyboard.press("p");
  await page.getByRole("button", { name: "RESTART RUN", exact: true }).click();
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press("w");
    await page.waitForFunction(
      (n) => window.qbert.snapshot().lives === n,
      2 - i,
    );
  }
  await page.getByRole("button", { name: "PLAY AGAIN", exact: true }).click();
  assert.equal((await page.evaluate(() => window.qbert.snapshot())).lives, 3);
  await page.getByRole("button", { name: "Pause game", exact: true }).click();
  await page.getByRole("button", { name: "HOW TO PLAY ?" }).click();
  assert.equal(await page.getByRole("link", { name: "SOURCE ↗" }).count(), 1);
  assert.equal(await page.getByRole("button", { name: "Toggle fullscreen" }).isVisible(), true);
  assert.equal(await page.locator("#version").isVisible(), true);
  assert.match(await page.locator("#version").textContent(), /^v\d/);
  assert.equal(await page.locator(".bottom-right").count(), 0);
  assert.equal(await page.locator("#gpu-label").count(), 0);
  const sound = page.getByRole("button", { name: "Toggle sound" });
  await sound.click();
  assert.equal(await sound.getAttribute("aria-pressed"), "false");
  await page.reload();
  await page.waitForFunction(
    () => window.qbert?.snapshot().webgpu,
    {},
    { timeout: 60000 },
  );
  await page.getByRole("button", { name: "HOW TO PLAY ?" }).click();
  assert.equal(await sound.getAttribute("aria-pressed"), "false");
  assert.ok(Number(await page.locator("#best").textContent()) >= 75);
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 844, height: 390 },
    { width: 320, height: 568 },
    { width: 450, height: 1065 },
    { width: 600, height: 900 },
    { width: 500, height: 1000 },
  ]) {
    await page.setViewportSize(viewport);
    const boxes = await page.locator(".cabinet").boundingBox();
    const arena = await page.locator(".arena").boundingBox();
    const pad = await page.locator(".dpad").boundingBox();
    const direction = await page.getByRole("button", { name: "Hop lower right" }).boundingBox();
    assert.ok(Math.abs(pad.width - pad.height) < 1);
    assert.ok(Math.abs(direction.width - direction.height) < 1);
    assert.ok(boxes.width / boxes.height >= 0.45 - 0.002);
    assert.ok(boxes.width / boxes.height <= 0.625 + 0.002);
    assert.ok(Math.abs(boxes.width - Math.min(viewport.width, viewport.height * 0.625)) < 1);
    assert.ok(Math.abs(boxes.height - Math.min(viewport.height, viewport.width / 0.45)) < 1);
    assert.ok(Math.abs(arena.width / arena.height - 1.08) < 0.01);
    assert.equal(await page.locator(".marquee, .cabinet-bottom").count(), 0);
    assert.equal(await page.locator(".console h1").innerText(), "QBERTCLONE");
    assert.equal(await page.getByRole("button", { name: "Hop lower right" }).isVisible(), true);
    assert.ok(
      boxes.x >= 0 &&
        boxes.y >= 0 &&
        boxes.x + boxes.width <= viewport.width + 1 &&
        boxes.y + boxes.height <= viewport.height + 1,
    );
    assert.equal(
      await page.evaluate(
        () =>
          document.documentElement.scrollHeight > innerHeight ||
          document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.screenshot({
      path: `test-results/layout-${viewport.width}.png`,
    });
  }
  await context.close();
  const touch = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const mobile = await touch.newPage();
  await mobile.goto(base);
  await mobile.waitForFunction(
    () => window.qbert?.snapshot().webgpu,
    {},
    { timeout: 60000 },
  );
  await mobile.getByRole("button", { name: "LET’S HOP", exact: true }).tap();
  await mobile
    .getByRole("button", { name: "Hop lower right", exact: true })
    .tap();
  await mobile.waitForFunction(() => window.qbert.snapshot().score === 25);
  await mobile.screenshot({ path: "test-results/mobile.png" });
  await touch.close();
  const unsupported = await browser.newContext();
  await unsupported.addInitScript(() =>
    Object.defineProperty(navigator, "gpu", { value: undefined }),
  );
  const fallback = await unsupported.newPage();
  await fallback.goto(base);
  await fallback.getByRole("heading", { name: "WebGPU required" }).waitFor();
  assert.ok(
    await fallback
      .getByRole("button", { name: "RETRY", exact: true })
      .isVisible(),
  );
  await unsupported.close();
  assert.deepEqual(errors, []);
  console.log(
    "PASS: real WebGPU rendering, keyboard, arrows, touch, score, lives, pause, restart, persistence, responsive sizes and unsupported GPU.",
  );
} finally {
  await browser.close();
}
