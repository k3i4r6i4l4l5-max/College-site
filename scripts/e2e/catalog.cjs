const { assert, openClean, login } = require('./helpers.cjs');

module.exports = {
  name: 'поиск и фильтры каталога',
  async run(page) {
    await openClean(page);
    await login(page);
    const search = page.getByRole('searchbox', { name: 'Поиск' });
    await search.fill('вероятностей');
    assert.equal(await search.inputValue(), 'вероятностей');
    assert.equal(await search.evaluate(element => element === document.activeElement), true);
    await page.getByRole('heading', { name: 'Курсы 1' }).waitFor();
    assert.equal(await page.locator('.course-tile').count(), 1);
    await page.getByRole('button', { name: 'Сбросить' }).click();
    await page.getByRole('heading', { name: 'Курсы 3' }).waitFor();
    await page.getByRole('button', { name: 'Свернуть левую панель' }).click();
    await page.getByRole('button', { name: 'Развернуть левую панель' }).waitFor();
    await page.getByRole('button', { name: 'Свернуть правую панель' }).click();
    await page.getByRole('button', { name: 'Развернуть правую панель' }).waitFor();
  },
};
