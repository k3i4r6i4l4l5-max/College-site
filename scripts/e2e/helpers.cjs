const assert = require('node:assert/strict');
async function openClean(page) { await page.goto('http://127.0.0.1:5173'); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.getByRole('heading', { name: 'Создайте аккаунт' }).waitFor(); }
async function login(page) { await page.evaluate(() => localStorage.setItem('practice-onboarding-seen-v1', 'true')); await page.getByRole('button', { name: /Тестовый вход/ }).click(); await page.getByRole('heading', { name: 'Подготовка', exact: true }).waitFor(); assert.equal(new URL(page.url()).pathname, '/'); }
module.exports = { assert, openClean, login };
