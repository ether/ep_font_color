import {expect, test} from '@playwright/test';
import {clearPadContent, getPadBody, goToNewPad, writeToPad}
    from 'ep_etherpad-lite/tests/frontend-new/helper/padHelper';

test.beforeEach(async ({page}) => {
  await goToNewPad(page);
});

const setColor = async (page: any, value: string) => {
  await page.evaluate((v: string) => {
    const sel = document.querySelector<HTMLSelectElement>('.color-selection')!;
    sel.value = v;
    sel.dispatchEvent(new Event('change', {bubbles: true}));
  }, value);
};

test.describe('ep_font_color', () => {
  test('changes color from black to red and back to black', async ({page}) => {
    const padBody = await getPadBody(page);
    await padBody.click();
    await clearPadContent(page);
    await writeToPad(page, 'foo');
    await page.keyboard.press('ControlOrMeta+A');

    await setColor(page, '1');
    await expect(padBody.locator('div').first().locator('.color\\:red').first())
        .toHaveCount(1, {timeout: 10_000});

    await page.keyboard.press('ControlOrMeta+A');
    await setColor(page, '0');
    await expect(padBody.locator('div').first().locator('.color\\:black').first())
        .toHaveCount(1, {timeout: 10_000});
  });

  test('selector reflects color of current caret position', async ({page}) => {
    const padBody = await getPadBody(page);
    await padBody.click();
    await clearPadContent(page);
    await writeToPad(page, 'foo');
    await page.keyboard.press('ControlOrMeta+A');

    await setColor(page, '1');
    await expect(padBody.locator('div').first().locator('.color\\:red').first())
        .toHaveCount(1, {timeout: 10_000});

    // Move caret around inside coloured text — the selector should still read '1'.
    await page.keyboard.press('End');
    await page.keyboard.press('ArrowLeft');
    await expect.poll(async () => page.evaluate(
        () => document.querySelector<HTMLSelectElement>('.color-selection')!.value),
    {timeout: 5_000}).toBe('1');
  });
});

test.describe('ep_font_color l10n', () => {
  const expected: Record<string, string> = {
    'ep_font_color.color': 'Couleur',
    'ep_font_color.black': 'noir',
    'ep_font_color.red': 'rouge',
    'ep_font_color.green': 'vert',
    'ep_font_color.blue': 'bleu',
    'ep_font_color.yellow': 'jaune',
    'ep_font_color.orange': 'orange',
  };

  test('dropdown options translate when language is changed', async ({page}) => {
    await page.locator('.buttonicon-settings').click();
    await page.locator('#languagemenu').selectOption('fr');
    // Wait for translation to apply.
    await expect(page.locator('.buttonicon-bold').locator('..'))
        .toHaveAttribute('title', /Gras/, {timeout: 10_000});

    const opts = page.locator('#editbar #font-color option');
    const count = await opts.count();
    for (let i = 0; i < count; i++) {
      const opt = opts.nth(i);
      const key = await opt.getAttribute('data-l10n-id');
      if (!key) continue;
      const want = expected[key];
      if (!want) continue;
      await expect(opt).toHaveText(want);
    }

    // Restore English so other test runs are not affected.
    await page.locator('#languagemenu').selectOption('en');
  });
});
