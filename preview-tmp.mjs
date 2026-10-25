import { chromium } from 'playwright'
const U = process.argv[2]
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const results = []; const check = (n, ok, d = '') => { results.push(ok); console.log((ok ? 'PASS ' : 'FAIL ') + n + (d ? ' — ' + d : '')) }
for (const [vp, opts] of [['desktop', { viewport: { width: 1440, height: 900 } }], ['phone', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]]) {
  const ctx = await browser.newContext(opts); const page = await ctx.newPage()
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => m.type() === 'error' && !/favicon|ReadPixels/.test(m.text()) && errs.push(m.text().slice(0, 160)))
  await page.goto(U, { waitUntil: 'load' }); await page.waitForTimeout(4500)
  check(vp + ': journey running', await page.evaluate(() => document.documentElement.dataset.journey) === 'on')
  check(vp + ': Italiana loaded', await page.evaluate(() => document.fonts.check('16px Italiana')))
  const H = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < H; y += 700) { await page.evaluate(yy => scrollTo(0, yy), y); await page.waitForTimeout(90) }
  check(vp + ': no sideways scroll', !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)))
  check(vp + ': Booking £500 and AI chatbox £250 on the page', await page.evaluate(() => /£500/.test(document.body.innerText) && /£250/.test(document.body.innerText)))
  check(vp + ': new contact email, old one gone', await page.evaluate(() => document.body.innerHTML.includes('aliy20@hotmail.co.uk') && !document.body.innerHTML.includes('admin.team@')))
  check(vp + ': zero console errors (Content Security Policy included)', errs.length === 0, errs.slice(0, 3).join(' | '))
  await ctx.close()
}
await browser.close(); console.log(results.every(Boolean) ? 'ALL PASS' : 'SOME FAILED')
