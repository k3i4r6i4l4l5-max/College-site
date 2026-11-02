const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const scenarios = [require('./e2e/auth.cjs'), require('./e2e/statistics.cjs'), require('./e2e/catalog.cjs'), require('./e2e/training.cjs'), require('./e2e/plans.cjs')];

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  for (const scenario of scenarios) {
    const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await scenario.run(page);
    if (errors.length) throw new Error(`${scenario.name}: ${errors.join('\n')}`);
    await page.close();
    console.log(`PASS: ${scenario.name}`);
  }
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
