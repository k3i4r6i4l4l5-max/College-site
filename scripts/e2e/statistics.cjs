const { assert, openClean, login } = require('./helpers.cjs');
module.exports = { name: 'нулевая статистика, реальные ответы и разделение аккаунтов', async run(page) {
  await openClean(page); await login(page);
  assert.match(await page.locator('.personal-stats').innerText(), /0 курса.*0 тем начато.*0%/s);
  for (const card of await page.locator('.course-card-knowledge').all()) assert.deepEqual(await card.locator('strong').allTextContents(), ['0', '0', '0']);
  await page.goto('http://127.0.0.1:5173/#/profile');
  await page.getByRole('heading', { name: 'Личный кабинет', exact: true }).waitFor();
  assert.deepEqual(await page.locator('.profile-stats strong').allTextContents(), ['0', '0', '0%']);
  assert.equal(await page.locator('.activity-bar-track > span').evaluateAll(nodes => nodes.every(node => node.style.height === '0%')), true);
  const result = await page.evaluate(async () => {
    const { mockRequest: request } = await import('/src/app/mockBackend.js');
    const { user: originalUser } = await request('auth', 'session');
    const session = await request('training', 'start', { topicId: 'js' });
    await request('training', 'answer', { sessionId: session.id, cardId: session.deck[0].id, rating: 'know' });
    const before = await request('progress', 'get');
    await request('auth', 'logout');
    await request('auth', 'register', { name: 'New', email: 'new@example.ru', password: 'password' });
    const fresh = { progress: await request('progress', 'get'), activity: await request('activity', 'get'), courses: await request('userCourses', 'get'), training: await request('training', 'active') };
    await request('auth', 'logout');
    await request('auth', 'login', { email: originalUser.email, password: 'demo-password' });
    return { before, fresh, restored: await request('progress', 'get'), activity: await request('activity', 'get') };
  });
  assert.equal(result.before.js, 5);
  assert.equal(Object.values(result.fresh.progress).every(value => value === 0), true);
  assert.deepEqual(result.fresh.activity, []); assert.deepEqual(result.fresh.courses, []); assert.equal(result.fresh.training, null);
  assert.deepEqual(result.restored, result.before); assert.equal(result.activity.length, 1);
  await page.reload();
  await page.getByRole('heading', { name: 'Личный кабинет', exact: true }).waitFor();
  assert.equal((await page.locator('.profile-stats strong').allTextContents())[1], '1');
  const migrated = await page.evaluate(async () => {
    const { mockRequest: request } = await import('/src/app/mockBackend.js');
    localStorage.clear();
    localStorage.setItem('practice-auth-v1', 'true');
    localStorage.setItem('practice-user-v1', JSON.stringify({ name: 'Legacy', email: 'legacy@example.ru' }));
    localStorage.setItem('practice-progress-v1', JSON.stringify({ js: 80, core: 82 }));
    localStorage.setItem('practice-activity-v2', JSON.stringify([
      { id: 'demo-1', topicId: 'core', cardIndex: 0, rating: 'know', progressAfter: 82, timestamp: '2026-10-01T12:00:00Z' },
      { id: 'actual-answer', topicId: 'js', cardIndex: 0, rating: 'know', progressAfter: 39, timestamp: '2026-10-02T12:00:00Z' },
    ]));
    await request('auth', 'session');
    const progress = await request('progress', 'get');
    const activity = await request('activity', 'get');
    await request('auth', 'session');
    return { progress, activity, again: await request('progress', 'get') };
  });
  assert.equal(migrated.progress.js, 5); assert.equal(migrated.progress.core, 0);
  assert.equal(migrated.activity.length, 1); assert.equal(migrated.activity[0].progressAfter, 5);
  assert.deepEqual(migrated.again, migrated.progress);
} };
