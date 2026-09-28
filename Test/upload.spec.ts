import { test, expect } from '@playwright/test';
import { login, verifyRowData } from '../utils/loginHelper';
import process from 'process';
import path from 'path';

test('16_upload @genericApp @basic_upload', async ({ page }) => {
  test.setTimeout(300000);

  await login(page, 'test_user');

  const importPath = process.cwd();
  const importFile = path.join(importPath, 'tests/files/sample_data.txt');

  await page.locator('i.fa-angle-double-down').first().click();

  await page.locator('#upload_datafile').setInputFiles(importFile);

  await page.locator('#new_time_selector').click();
  await page.locator('.daterangepicker').getByText('Last 1 Hour', { exact: true }).click();

  const queryFromTime = await page.locator('#from_date').inputValue();
  const queryToTime = await page.locator('#to_date').inputValue();
  const requestDate = new Date().toISOString().slice(0, 10);

  await page.locator('input[type="submit"][name="commit"]').click();

  const resultRow = page
    .locator('#query_results_table tbody tr')
    .filter({ hasText: 'File=sample_' })
    .first();

  await expect(resultRow).toBeVisible({ timeout: 60000 });

  await expect(resultRow.locator('td').nth(1)).toContainText('COMPLETED', {
    timeout: 240000,
  });

  const queryCell = resultRow.locator('td').nth(3);

  const actualQuery =
    (await queryCell.textContent())?.trim().replace(/\s+/g, ' ') || '';

  expect(actualQuery.toLowerCase()).toContain('file=sample_');

  await verifyRowData(page, 'File=sample_', {
    Username: 'test_user',
    Status: 'COMPLETED',
    'Requested Time': requestDate,
    Query: actualQuery,
    'Query From Time': queryFromTime,
    'Query To Time': queryToTime,
    Size: '10.00 K',
  });
});
