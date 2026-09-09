const { assert, openClean, login } = require('./helpers.cjs');

module.exports = {
  name: 'поиск и фильтры каталога',
  async run(page) {
    await openClean(page);
    await login(page);
    await page.goto('http://127.0.0.1:5173/?q=вероятностей');
    await page.getByRole('heading', { name: 'Курсы 1' }).waitFor();
    assert.equal(await page.locator('.course-tile').count(), 1);
    await page.getByRole('button', { name: 'Сбросить' }).click();
    await page.getByRole('heading', { name: 'Курсы 3' }).waitFor();
  },
};
