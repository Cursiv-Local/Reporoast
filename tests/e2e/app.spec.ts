import { test,expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('landing page, example, mode consistency, accessibility and download',async({page})=>{
 await page.goto('/');await expect(page).toHaveTitle(/RepoRoast/);
 await expect(page.getByRole('heading',{level:1})).toContainText('Your repo is public.');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await expect(page.getByLabel('GITHUB REPOSITORY URL')).toBeVisible();
 const initial=await new AxeBuilder({page}).analyze();expect(initial.violations).toEqual([]);
 await page.getByRole('button',{name:'See Example'}).click();
 await expect(page.getByRole('heading',{name:'example/kindling'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Create public share link'})).toBeDisabled();
 const before=await page.locator('.big-score').innerText();const gains=await page.locator('.gain').allTextContents();
 await page.getByRole('button',{name:'Serious Mode',exact:true}).click();
 await expect(page.getByRole('heading',{name:'How to Improve Your Score'})).toBeVisible();
 expect(await page.locator('.big-score').innerText()).toBe(before);expect(await page.locator('.gain').allTextContents()).toEqual(gains);
 const report=await new AxeBuilder({page}).analyze();expect(report.violations).toEqual([]);
 const downloadEvent=page.waitForEvent('download');await page.getByRole('button',{name:'Download PNG'}).click();expect((await downloadEvent).suggestedFilename()).toMatch(/\.png$/);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.screenshot({path:'test-results/'+test.info().project.name+'-report.png',fullPage:true});
});
test('submission surfaces server errors without fabricating scores',async({page})=>{
 await page.route('**/api/scan',route=>route.fulfill({status:429,contentType:'application/json',body:JSON.stringify({error:{message:'Scan capacity exhausted.'}})}));
 await page.goto('/');await page.getByLabel('GITHUB REPOSITORY URL').fill('https://github.com/example/project');await page.getByRole('button',{name:'Score My Repo'}).click();await expect(page.getByRole('alert')).toContainText('Scan capacity exhausted');await expect(page.locator('.results')).toHaveCount(0);
});
test('untrusted descriptions are rendered as text and sharing requires consent',async({page})=>{
 const {EXAMPLE}=await import('../../src/shared/example');
 await page.route('**/api/scan',route=>route.fulfill({contentType:'application/json',body:JSON.stringify({...EXAMPLE,repository:{...EXAMPLE.repository,id:42,description:'<img src=x onerror=alert(1)>'}})}));
 let shareCalls=0;await page.route('**/api/share',route=>{shareCalls++;return route.fulfill({status:201,contentType:'application/json',body:JSON.stringify({url:'https://roast.cursiv.us/s/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',removalToken:'remove-token',expires:'2026-11-01T00:00:00Z'})});});
 await page.goto('/');await page.getByLabel('GITHUB REPOSITORY URL').fill('https://github.com/example/project');await page.getByRole('button',{name:'Score My Repo'}).click();await expect(page.locator('.results')).toContainText('<img src=x onerror=alert(1)>');await expect(page.locator('.results img')).toHaveCount(0);expect(shareCalls).toBe(0);
 await expect(page.getByRole('button',{name:'Create public share link'})).toBeDisabled();await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Create public share link'}).click();await expect(page.getByText('Public summary created. Save its removal token.')).toBeVisible();expect(shareCalls).toBe(1);
});
test('keyboard access and reduced motion',async({page})=>{await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();await page.keyboard.press('Enter');expect(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');});
