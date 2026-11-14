import { test, expect } from '@playwright/test';

for (const locale of ['zh','en'] as const) {
  test(`${locale}: prompt favorites keep the same label across practice and review`, async ({ page }) => {
    await page.addInitScript(language => localStorage.setItem('talksprout:locale',language), locale);
    await page.goto('/#library?prompt=daily-check-in');
    await page.getByRole('button',{name:locale==='zh'?'保存常用组合':'Save practice combination',exact:true}).click();
    await expect(page.getByRole('button',{name:locale==='zh'?'移除常用组合':'Remove practice combination',exact:true})).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('region',{name:locale==='zh'?'常用练习组合':'Saved practice combinations',exact:true})).toBeVisible();
    const filter=page.getByRole('button',{name:locale==='zh'?'收藏':'Saved',exact:true});
    await expect(filter.locator('svg')).toBeVisible();
    await expect(filter).toHaveText('');
    await filter.click();
    await expect(page.getByRole('heading',{name:locale==='zh'?'这里还没有收藏':'Nothing saved here yet',exact:true})).toBeVisible();
    await page.goto('/#review');
    await expect(page.getByRole('button',{name:locale==='zh'?'收藏':'Saved',exact:true})).toBeVisible();
  });
}

test('keyboard guide dismissal and saved-row removal retain visible logical focus', async ({page}) => {
  await page.goto('/');
  const dismiss=page.getByRole('button',{name:'收起指引',exact:true});
  await dismiss.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-collection="companions"]')).toBeFocused();
  await page.goto('/#library?prompt=daily-check-in');
  await page.locator('.save-combination').click();
  await expect(page.locator('.save-combination')).toHaveAttribute('aria-pressed','true');
  await page.keyboard.press('Escape');
  const remove=page.getByRole('button',{name:/移除组合/});
  await remove.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.quick-row')).toHaveCount(0);
  await expect(page.locator('[data-collection="companions"]')).toBeFocused();
});

test('keyboard removal selects the next remaining row', async ({page}) => {
  await page.addInitScript(() => {
    localStorage.setItem('talksprout:guide-dismissed','yes');
    localStorage.setItem('talksprout:practice-shortcuts',JSON.stringify(['daily-check-in','gentle-start','focused-correction','expression-upgrade'].map(promptId=>({promptId,variant:'full',pace:'coached'}))));
  });
  await page.goto('/');
  const region=page.getByRole('region',{name:'常用练习组合'});
  await region.locator('.quick-row').nth(1).getByRole('button',{name:/移除组合/}).focus();
  await page.keyboard.press('Enter');
  await expect(region.locator('.quick-row')).toHaveCount(3);
  await expect(region.locator('.quick-open').nth(1)).toBeFocused();
});

test('a removed expansion control restores focus after another window deletes a combination', async ({page}) => {
  await page.addInitScript(() => {
    if (localStorage.getItem('focus-seeded')) return;
    localStorage.setItem('focus-seeded','yes');
    localStorage.setItem('talksprout:guide-dismissed','yes');
    localStorage.setItem('talksprout:practice-shortcuts',JSON.stringify(['daily-check-in','gentle-start','focused-correction','expression-upgrade'].map(promptId=>({promptId,variant:'full',pace:'coached'}))));
  });
  await page.goto('/');
  const other=await page.context().newPage();
  await other.goto('/');
  await page.getByRole('button',{name:'展开全部 4 个组合',exact:true}).focus();
  await other.getByRole('button',{name:'展开全部 4 个组合',exact:true}).click();
  await other.locator('.quick-row').last().getByRole('button',{name:/移除组合/}).click();
  await expect(page.locator('.quick-row')).toHaveCount(3);
  await expect(page.locator('.quick-open').last()).toBeFocused();
  await other.close();
});

test('removing the last combination focuses the collection even when recent copies exist', async ({page}) => {
  await page.addInitScript(() => {
    localStorage.setItem('talksprout:guide-dismissed','yes');
    localStorage.setItem('talksprout:practice-shortcuts',JSON.stringify([{promptId:'daily-check-in',variant:'full',pace:'coached'}]));
    localStorage.setItem('talksprout:recent-items',JSON.stringify([{kind:'practice',promptId:'gentle-start',variant:'full',pace:'coached'}]));
  });
  await page.goto('/');
  await page.getByRole('button',{name:/移除组合/}).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.quick-row')).toHaveCount(0);
  await expect(page.getByRole('region',{name:'最近复制',exact:true})).toBeVisible();
  await expect(page.locator('[data-collection="companions"]')).toBeFocused();
});
