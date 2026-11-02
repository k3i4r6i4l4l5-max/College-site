const { assert, openClean, login } = require('./helpers.cjs');
module.exports = {
  name: 'создание и выполнение плана после начала обучения',
  async run(page) {
    await openClean(page); await login(page);
    await page.goto('http://127.0.0.1:5173/#/courses/java');
    await page.getByRole('button', { name: 'Составить план' }).click();
    const sidebar = page.locator('.preparation-plan-sidebar');
    await sidebar.getByText('Чтобы составить план подготовки, сначала пройдите курс хотя бы один раз.').waitFor();
    await page.goto('http://127.0.0.1:5173/#/training?topic=core');
    await page.getByRole('button', { name: 'Показать ответ' }).click();
    await page.getByRole('button', { name: 'Знаю', exact: true }).click();
    await page.getByRole('heading', { name: 'Что такое инкапсуляция?' }).waitFor();
    await page.goto('http://127.0.0.1:5173/#/courses/java');
    await page.getByRole('button', { name: 'Составить план' }).click();
    await sidebar.getByLabel('Срок подготовки').selectOption('3');
    await sidebar.getByRole('button', { name: /Создать план/ }).click();
    await sidebar.getByRole('button', { name: 'Отметить' }).first().click();
    assert.match(await sidebar.innerText(), /Выполнено/);
  },
};
