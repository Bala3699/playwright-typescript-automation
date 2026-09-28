import { test, expect } from '@playwright/test';
import { login, verifyRowData } from '../utils/loginHelper';

test(
  '15_query_multiple_parameters @genericApp @basic_query',
  async ({ page }) => {
    test.setTimeout(300000);

    await login(page, 'test_user');

    const queryIp = '192.168.1.100';
    const queryPort = '8080';
    const queryNatIp = '10.0.0.50';
    const queryDeviceIp = '10.0.0.1';
    const queryUsername = 'generic_user';

    await page.locator('#ip').fill(queryIp);
    await page.locator('i.fa-angle-double-down').first().click();

    await page.locator('#port').fill(queryPort);
    await page.locator('#tags_natip').fill(queryNatIp);
    await page.locator('#tags_deviceip').fill(queryDeviceIp);
    await page.locator('#aaausername').fill(queryUsername);

    await page.locator('#new_time_selector').click();
    await page
      .locator('.daterangepicker')
      .getByText('This Month', { exact: true })
      .click();

    const queryFromTime = await page.locator('#from_date').inputValue();
    const queryToTime = await page.locator('#to_date').inputValue();
    const requestDate = new Date().toISOString().slice(0, 10);

    await page.locator('input[type="submit"][name="commit"]').click();

    const resultRow = page
      .locator('#query_results_table tbody tr')
      .filter({ hasText: queryIp })
      .filter({ hasText: `Port=${queryPort}` })
      .filter({ hasText: `NATIP=${queryNatIp}` })
      .filter({ hasText: `DeviceIP=${queryDeviceIp}` })
      .filter({ hasText: `AAAUserName=${queryUsername}` })
      .first();

    await expect(resultRow).toBeVisible({ timeout: 30000 });

    await expect(resultRow.locator('td').nth(1)).toContainText('COMPLETED', {
      timeout: 240000,
    });

    await page.waitForTimeout(3000);
    await page.goto(page.url(), { waitUntil: 'networkidle' });

    await verifyRowData(page, queryIp, {
      Username: 'test_user',
      Status: 'COMPLETED',
      'Requested Time': requestDate,
      Query:
        `IP=${queryIp}` +
        `Port=${queryPort}` +
        `AAAUserName=${queryUsername}` +
        `natip=${queryNatIp}` +
        `deviceip=${queryDeviceIp}`,
      'Query From Time': queryFromTime,
      'Query To Time': queryToTime,
    });
  }
);
