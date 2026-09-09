const { assert, openClean } = require('./helpers.cjs');

module.exports = {
  name: 'первый вход, онбординг и восстановление сессии',
  async run(page) {
    await openClean(page);
    await page.getByRole('button', { name: /Тестовый вход/ }).click();
    await page.waitForURL(/guide\.html/);
    assert.match(await page.title(), /Как начать обучение/);

    for (let step = 0; step < 5; step += 1) {
      await page.getByRole('button', { name: 'Далее' }).click();
    }
    await page.getByRole('button', { name: 'Ясно' }).click();
    await page.getByRole('heading', { name: 'Подготовка', exact: true }).waitFor();

    await page.reload();
    await page.getByRole('heading', { name: 'Подготовка', exact: true }).waitFor();
    assert.match(await page.locator('body').innerText(), /Курсы/);
  },
};
