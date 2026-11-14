import { test, expect } from '@playwright/test';

test('two windows merge independent favorites and synchronize removal', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ locale: 'zh-CN' });
  const a = await context.newPage(), b = await context.newPage();
  await a.goto(`${baseURL}/#learning`);
  await b.goto(`${baseURL}/#learning`);
  await a.getByRole('button', { name: '收藏：视频与音频辅导', exact: true }).click();
  await expect(a.getByRole('button', { name: '取消收藏：视频与音频辅导', exact: true })).toBeVisible();
  await b.getByRole('button', { name: '收藏：听力理解自测', exact: true }).click();
  await expect(b.getByRole('button', { name: '取消收藏：听力理解自测', exact: true })).toBeVisible();
  await a.reload();
  await expect(a.getByRole('button', { name: '取消收藏：视频与音频辅导', exact: true })).toBeVisible();
  await expect(a.getByRole('button', { name: '取消收藏：听力理解自测', exact: true })).toBeVisible();
  await a.getByRole('button', { name: '取消收藏：听力理解自测', exact: true }).click();
  await expect(b.getByRole('button', { name: '收藏：听力理解自测', exact: true })).toBeVisible();
  await a.goto(`${baseURL}/#collection/companions`);
  await b.goto(`${baseURL}/#collection/companions`);
  await a.locator('[data-favorite="daily-check-in"]').click();
  await expect(a.locator('[data-favorite="daily-check-in"]')).toHaveAttribute('aria-pressed', 'true');
  await b.locator('[data-favorite="gentle-start"]').click();
  await expect(b.locator('[data-favorite="gentle-start"]')).toHaveAttribute('aria-pressed', 'true');
  await a.reload();
  await expect(a.locator('[data-favorite="daily-check-in"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(a.locator('[data-favorite="gentle-start"]')).toHaveAttribute('aria-pressed', 'true');
  await context.close();
});

test('safe current choices survive reload without adding history or private background', async ({ page }) => {
  await page.goto('/#library?prompt=roleplay-coach&scene=project-deep-dive&pace=mock&format=spoken');
  await expect(page.getByRole('tab', { name: '语音开场白', exact: true })).toHaveAttribute('aria-selected','true');
  const length = await page.evaluate(() => history.length);
  await page.getByRole('tab', { name: '完整提示词', exact: true }).click();
  await page.locator('.scene-settings summary').click();
  await page.locator('#scene-background').fill('PRIVATE_URL_937');
  await page.getByRole('button', { name: '逐题辅导', exact: true }).click();
  expect(page.url()).not.toContain('format=spoken');
  expect(page.url()).not.toContain('pace=mock');
  expect(page.url()).not.toContain('PRIVATE_URL_937');
  expect(await page.evaluate(() => history.length)).toBe(length);
  await expect(page.locator('#scene-background')).toHaveValue('PRIVATE_URL_937');
  await page.reload();
  await expect(page.getByRole('tab', { name: '完整提示词', exact: true })).toHaveAttribute('aria-selected','true');
  await page.locator('.scene-settings summary').click();
  await expect(page.getByRole('button', { name: '逐题辅导', exact: true })).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#scene-background')).toHaveValue('');
});

test('review source and format refresh accurately and preserve close navigation', async ({ page }) => {
  await page.goto('/#review');
  await page.locator('[data-detail="complete-study-notes"]').click();
  await page.locator('#review-source').selectOption('transcript');
  await page.reload();
  await expect(page.locator('#review-source')).toHaveValue('transcript');
  await page.getByRole('tab', { name: '语音结尾提示', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('tab', { name: '语音结尾提示', exact: true })).toHaveAttribute('aria-selected','true');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page).toHaveURL(/#review$/);
});

test('failed writes retain multiple selections for this session and show save errors', async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key.startsWith('talksprout:') && key !== 'talksprout:locale') throw new DOMException('Quota', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await page.goto('/#collection/companions');
  await page.locator('[data-favorite="daily-check-in"]').click();
  await expect(page.locator('[data-favorite="daily-check-in"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-favorite="gentle-start"]').click();
  await expect(page.locator('[data-favorite="gentle-start"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-favorite="daily-check-in"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#toast')).toContainText('保存');
  expect(await page.evaluate(() => localStorage.getItem('talksprout:favorites'))).toBeNull();
});

test('concurrent windows preserve both combinations through atomic local transactions', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ locale: 'zh-CN' });
  const a = await context.newPage(), b = await context.newPage();
  await a.goto(`${baseURL}/#library?prompt=daily-check-in`);
  await b.goto(`${baseURL}/#library?prompt=gentle-start`);
  await Promise.all([a.getByRole('button', { name:'保存常用组合', exact:true }).click(), b.getByRole('button', { name:'保存常用组合', exact:true }).click()]);
  await expect(a.getByRole('button', { name:'移除常用组合', exact:true })).toBeVisible();
  await expect(b.getByRole('button', { name:'移除常用组合', exact:true })).toBeVisible();
  await a.reload();
  await expect(a.getByRole('button', { name:'移除常用组合', exact:true })).toBeVisible();
  await a.goto(`${baseURL}/#library?prompt=gentle-start`);
  await expect(a.getByRole('button', { name:'移除常用组合', exact:true })).toBeVisible();
  await a.goto(`${baseURL}/#library?prompt=daily-check-in`);
  await a.getByRole('button', { name:'移除常用组合', exact:true }).click();
  await expect(a.getByRole('button', { name:'保存常用组合', exact:true })).toBeVisible();
  await b.keyboard.press('Escape');
  await expect(b.locator('.quick-row')).toHaveCount(1);
  await context.close();
});

test('legacy storage fallback merges sequential stale-window updates', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ locale: 'zh-CN' });
  await context.addInitScript(() => { Object.defineProperty(navigator, 'locks', { value: undefined }); Object.defineProperty(window, 'indexedDB', { value: undefined }); });
  const a = await context.newPage(), b = await context.newPage();
  await a.goto(`${baseURL}/#collection/companions`);
  await b.goto(`${baseURL}/#collection/companions`);
  await a.locator('[data-favorite="daily-check-in"]').click();
  await b.locator('[data-favorite="gentle-start"]').click();
  await expect(b.locator('[data-favorite="gentle-start"]')).toHaveAttribute('aria-pressed','true');
  await a.reload();
  await expect(a.locator('[data-favorite="daily-check-in"]')).toHaveAttribute('aria-pressed','true');
  await expect(a.locator('[data-favorite="gentle-start"]')).toHaveAttribute('aria-pressed','true');
  await context.close();
});

test('transient save failures merge pending intent with external additions and removals on recovery', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ locale: 'zh-CN' });
  const b = await context.newPage();
  await b.goto(`${baseURL}/#collection/companions`);
  await b.locator('[data-favorite="gentle-start"]').click();
  await expect(b.locator('[data-favorite="gentle-start"]')).toHaveAttribute('aria-pressed','true');
  const a = await context.newPage();
  await a.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key === 'talksprout:favorites' && !(window as unknown as { writesRecovered?: boolean }).writesRecovered) throw new DOMException('Quota', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await a.goto(`${baseURL}/#collection/companions`);
  await a.locator('[data-favorite="daily-check-in"]').click();
  await expect(a.locator('[data-favorite="daily-check-in"]')).toHaveAttribute('aria-pressed','true');
  await b.locator('[data-favorite="gentle-start"]').click();
  await expect(b.locator('[data-favorite="gentle-start"]')).toHaveAttribute('aria-pressed','false');
  await b.locator('[data-favorite="focused-correction"]').click();
  await expect(b.locator('[data-favorite="focused-correction"]')).toHaveAttribute('aria-pressed','true');
  await expect(a.locator('[data-favorite="focused-correction"]')).toHaveAttribute('aria-pressed','true');
  await expect(a.locator('[data-favorite="gentle-start"]')).toHaveAttribute('aria-pressed','false');
  await a.evaluate(() => { (window as unknown as {writesRecovered: boolean}).writesRecovered = true; });
  await a.locator('[data-favorite="expression-upgrade"]').click();
  await expect(a.locator('[data-favorite="expression-upgrade"]')).toHaveAttribute('aria-pressed','true');
  await b.reload();
  for (const id of ['daily-check-in','focused-correction','expression-upgrade']) await expect(b.locator(`[data-favorite="${id}"]`)).toHaveAttribute('aria-pressed','true');
  await expect(b.locator('[data-favorite="gentle-start"]')).toHaveAttribute('aria-pressed','false');
  await context.close();
});

test('clearing local preferences in another window clears the native snapshot too', async ({browser, baseURL}) => {
  const context=await browser.newContext({locale:'zh-CN'});
  const a=await context.newPage(), b=await context.newPage();
  await a.goto(`${baseURL}/#collection/companions`);
  await b.goto(`${baseURL}/#collection/companions`);
  await a.locator('[data-favorite="daily-check-in"]').click();
  await expect(a.locator('[data-favorite="daily-check-in"]')).toHaveAttribute('aria-pressed','true');
  await expect(b.locator('[data-favorite="daily-check-in"]')).toHaveAttribute('aria-pressed','true');
  await a.evaluate(() => localStorage.clear());
  await expect(b.locator('[data-favorite="daily-check-in"]')).toHaveAttribute('aria-pressed','false');
  await b.reload();
  await expect(b.locator('[data-favorite="daily-check-in"]')).toHaveAttribute('aria-pressed','false');
  await context.close();
});

test('native metadata excludes private background from a saved combination', async ({page}) => {
  await page.goto('/#library?prompt=roleplay-coach&scene=project-deep-dive');
  await page.locator('.scene-settings summary').click();
  await page.locator('#scene-background').fill('PRIVATE_NATIVE_937');
  await page.getByRole('button',{name:'保存常用组合',exact:true}).click();
  await expect(page.getByRole('button',{name:'移除常用组合',exact:true})).toBeVisible();
  const metadata=await page.evaluate(() => new Promise<string>((resolve,reject) => {
    const open=indexedDB.open('talksprout:saved',1);
    open.onerror=()=>reject(open.error);
    open.onsuccess=()=>{
      const db=open.result;
      const tx=db.transaction('snapshot','readonly');
      const request=tx.objectStore('snapshot').get('current');
      request.onsuccess=()=>resolve(JSON.stringify(request.result));
      request.onerror=()=>reject(request.error);
      tx.oncomplete=()=>db.close();
    };
  }));
  expect(metadata).toContain('project-deep-dive');
  expect(metadata).not.toContain('PRIVATE_NATIVE_937');
});

test('denied native storage preserves session choices and reports the save failure', async ({page}) => {
  await page.addInitScript(() => {
    IDBFactory.prototype.open=function() { throw new DOMException('Denied','SecurityError'); };
  });
  await page.goto('/#collection/companions');
  for(const id of ['daily-check-in','gentle-start']) {
    await page.locator(`[data-favorite="${id}"]`).click();
    await expect(page.locator(`[data-favorite="${id}"]`)).toHaveAttribute('aria-pressed','true');
  }
  await expect(page.locator('[data-favorite="daily-check-in"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#toast')).toContainText('保存');
  expect(await page.evaluate(()=>localStorage.getItem('talksprout:favorites'))).toBeNull();
});

test('retrying identical mirrors notifies other windows only after a successful native commit', async ({browser, baseURL}) => {
  const context=await browser.newContext({locale:'zh-CN'});
  const b=await context.newPage();
  await b.goto(`${baseURL}/#collection/companions`);
  await b.locator('[data-favorite="gentle-start"]').click();
  await expect(b.locator('[data-favorite="gentle-start"]')).toHaveAttribute('aria-pressed','true');
  await b.goto(`${baseURL}/#library`);
  const a=await context.newPage();
  await a.addInitScript(() => {
    Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.resolve()}});
    const put=IDBObjectStore.prototype.put;
    let failed=false;
    IDBObjectStore.prototype.put=function(...args: Parameters<IDBObjectStore['put']>) {
      if(this.name==='snapshot'&&!failed) {failed=true;throw new DOMException('Quota','QuotaExceededError');}
      return put.apply(this,args);
    };
  });
  await a.goto(`${baseURL}/#library?prompt=daily-check-in`);
  await a.locator('.modal-copy').click();
  await expect(a.locator('.sheet-footer')).toContainText('保存');
  const mirror=await a.evaluate(()=>localStorage.getItem('talksprout:recent-items'));
  await expect(b.getByRole('region',{name:'最近复制',exact:true})).toHaveCount(0);
  await a.locator('.modal-copy').click();
  await expect(a.locator('.sheet-footer')).not.toContainText('保存');
  expect(await a.evaluate(()=>localStorage.getItem('talksprout:recent-items'))).toBe(mirror);
  await expect(b.getByRole('region',{name:'最近复制',exact:true})).toBeVisible();
  await context.close();
});
