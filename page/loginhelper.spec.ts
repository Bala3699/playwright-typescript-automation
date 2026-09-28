
import { expect, Locator, Page, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import fs from 'fs';
import readXlsxFile from 'read-excel-file/node';
import ExcelJS from 'exceljs';

/**
 * Generic login helper.
 *
 * The actual credentials and environment configuration
 * should remain outside the repository.
 */
export async function login(
  page: Page,
  role: 'user' | 'admin' | 'readonly'
) {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.loginAs(role);
}

/**
 * Validate a numeric value with a tolerance.
 *
 * Example:
 * await expectValueWithinRange(locator, '75 MB');
 */
export async function expectValueWithinRange(
  locator: Locator,
  expectedText: string,
  rowName?: string
) {
  await test.step(
    `Validate ${rowName || 'Value'} → ${expectedText}`,
    async () => {
      const tolerance = 0.05;
      const percentAbsoluteTolerance = 3;

      const actualText =
        (await locator.textContent())?.trim() || '';

      const actualMatch = actualText.match(
        /^(-?\d+(?:\.\d+)?)\s*(.*)$/
      );

      if (!actualMatch) {
        throw new Error(
          `Could not parse actual value from "${actualText}"`
        );
      }

      const actualValue = parseFloat(actualMatch[1]);
      const actualUnit = actualMatch[2].trim().toLowerCase();

      const expectedMatch = expectedText.match(
        /^(-?\d+(?:\.\d+)?)\s*(.*)$/
      );

      if (!expectedMatch) {
        throw new Error(
          `Could not parse expected value from "${expectedText}"`
        );
      }

      const expectedValue = parseFloat(expectedMatch[1]);
      const expectedUnit =
        expectedMatch[2].trim().toLowerCase();

      let lowerBound: number;
      let upperBound: number;

      if (expectedUnit === '%') {
        lowerBound =
          expectedValue - percentAbsoluteTolerance;

        upperBound =
          expectedValue + percentAbsoluteTolerance;
      } else {
        lowerBound =
          expectedValue * (1 - tolerance);

        upperBound =
          expectedValue * (1 + tolerance);
      }

      test.info().annotations.push({
        type: 'Validation Details',
        description:
          `Expected: ${expectedText} | ` +
          `Actual: ${actualText} | ` +
          `Range: ${lowerBound.toFixed(2)} - ${upperBound.toFixed(2)}`
      });

      expect(
        actualUnit,
        `Expected unit "${expectedUnit}", received "${actualUnit}"`
      ).toContain(expectedUnit);

      expect(
        actualValue,
        `Expected value >= ${lowerBound.toFixed(2)}`
      ).toBeGreaterThanOrEqual(lowerBound);

      expect(
        actualValue,
        `Expected value <= ${upperBound.toFixed(2)}`
      ).toBeLessThanOrEqual(upperBound);
    }
  );
}

/**
 * Validate a table row metric.
 */
export async function verifyTableMetric(
  card: Locator,
  rowText: string,
  columnIndex: number,
  expectedValue: string,
  rowIndex: number = 0
) {
  const row = card
    .locator('tr')
    .filter({ hasText: rowText })
    .nth(rowIndex);

  const cell = row
    .locator('td, th')
    .nth(columnIndex);

  await expect(cell).toBeVisible();

  await expectValueWithinRange(
    cell,
    expectedValue,
    `${rowText}`
  );
}

/**
 * Validate a row using either a column index
 * or a CSS selector.
 */
export async function verifyRowValue(
  table: Locator,
  rowText: string,
  columnSelector: number | string,
  expectedValue: string,
  rowIndex: number = 0
) {
  const row = table
    .locator('tr')
    .filter({ hasText: rowText })
    .nth(rowIndex);

  await expect(row).toBeVisible();

  const cell =
    typeof columnSelector === 'string'
      ? row.locator(`td${columnSelector}`)
      : row.locator('td, th').nth(columnSelector);

  await expect(cell).toBeVisible();

  await expectValueWithinRange(
    cell,
    expectedValue,
    rowText
  );
}

/**
 * Generic table metric validation.
 *
 * Finds a column by its header name and validates
 * the corresponding value in a selected row.
 */
export async function validateTableMetric(
  page: Page,
  containerTitle: string,
  columnName: string,
  rowName: string,
  expectedValue: string
) {
  const container = page
    .locator('.card, .widget, section, [role="region"]')
    .filter({ hasText: containerTitle })
    .first();

  await expect(container).toBeVisible();

  const headers = await container
    .locator('thead tr, tr')
    .first()
    .locator('th, td')
    .allTextContents();

  const columnIndex = headers.findIndex(
    text =>
      text
        .trim()
        .toLowerCase()
        .includes(columnName.toLowerCase())
  );

  if (columnIndex === -1) {
    throw new Error(
      `Could not find column "${columnName}".`
    );
  }

  const row = container
    .locator('tr')
    .filter({ hasText: rowName })
    .first();

  await expect(row).toBeVisible();

  const cell = row
    .locator('th, td')
    .nth(columnIndex);

  await expectValueWithinRange(
    cell,
    expectedValue,
    `${rowName} → ${columnName}`
  );
}

/**
 * Wait for a dashboard/card component to become ready.
 */
export async function waitForComponentReady(
  page: Page,
  componentTitle: string,
  timeout = 60000
) {
  const component = page
    .locator(
      '.card, .widget, .panel, section, [role="region"]'
    )
    .filter({
      hasText: componentTitle
    })
    .first();

  await component.scrollIntoViewIfNeeded();

  await expect(component).toBeVisible({
    timeout
  });

  const loaders = page.locator(
    '.skeleton, .loading, .overlay, .spinner, [class*="skeleton"]'
  );

  await expect(loaders).toHaveCount(0, {
    timeout: 30000
  });
}

/**
 * Validate multiple metrics from a table row.
 */
export async function validateMetrics(
  row: Locator,
  expectedValues: Record<string, string>
) {
  const cells = row.locator('td, th');

  for (const [metric, expected] of Object.entries(
    expectedValues
  )) {
    const cell = cells.filter({
      hasText: expected
    }).first();

    if (await cell.count()) {
      await expectValueWithinRange(
        cell,
        expected,
        metric
      );
    }
  }
}

/**
 * Validate a generic text report.
 *
 * requiredFields contains only generic field names.
 */
export async function validateTextReport(
  filePath: string,
  requiredFields: string[]
) {
  await test.step(
    `Validate text report`,
    async () => {
      const content = fs.readFileSync(
        filePath,
        'utf8'
      );

      expect(
        content.trim(),
        'Report file must not be empty'
      ).not.toBe('');

      const lines = content
        .split(/\r?\n/)
        .filter(line => line.trim() !== '');

      expect(
        lines.length,
        'Report must contain a header and data'
      ).toBeGreaterThanOrEqual(2);

      const header = lines[0];

      const missingFields =
        requiredFields.filter(
          field => !header.includes(field)
        );

      test.info().annotations.push({
        type: 'Report Validation',
        description:
          `Rows: ${lines.length - 1} | ` +
          `Required Fields: ${requiredFields.length} | ` +
          `Missing Fields: ${missingFields.length}`
      });

      expect(
        missingFields,
        `Missing required fields: ${missingFields.join(', ')}`
      ).toEqual([]);
    }
  );
}

/**
 * Normalize spreadsheet values.
 */
function normalizeValue(value: unknown): string {
  return String(value ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\t/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Validate that required columns exist
 * in an Excel worksheet.
 */
export async function validateExcelColumns(
  filePath: string,
  requiredFields: string[]
) {
  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.readFile(filePath);

  const worksheet =
    workbook.worksheets[0];

  if (!worksheet) {
    throw new Error(
      'No worksheet found.'
    );
  }

  let headerRowNumber = -1;

  worksheet.eachRow(
    (row, rowNumber) => {
      if (headerRowNumber !== -1) {
        return;
      }

      const values: string[] = [];

      for (
        let column = 1;
        column <= worksheet.columnCount;
        column++
      ) {
        values.push(
          normalizeValue(
            row.getCell(column).value
          )
        );
      }

      const matches =
        requiredFields.filter(
          field =>
            values.includes(
              normalizeValue(field)
            )
        );

      if (
        matches.length >=
        Math.min(3, requiredFields.length)
      ) {
        headerRowNumber = rowNumber;
      }
    }
  );

  if (headerRowNumber === -1) {
    throw new Error(
      'Could not identify the Excel header row.'
    );
  }

  const headerRow =
    worksheet.getRow(headerRowNumber);

  const headers: string[] = [];

  for (
    let column = 1;
    column <= worksheet.columnCount;
    column++
  ) {
    headers.push(
      normalizeValue(
        headerRow.getCell(column).value
      )
    );
  }

  const missingFields =
    requiredFields.filter(
      field => {
        const normalized =
          normalizeValue(field);

        return !headers.some(
          header =>
            header === normalized ||
            header.includes(normalized) ||
            normalized.includes(header)
        );
      }
    );

  test.info().annotations.push({
    type: 'Excel Validation',
    description:
      `Header Row: ${headerRowNumber} | ` +
      `Required Fields: ${requiredFields.length} | ` +
      `Missing Fields: ${missingFields.length}`
  });

  expect(
    missingFields,
    `Missing Excel columns: ${missingFields.join(', ')}`
  ).toEqual([]);
}

/**
 * Read an Excel file using read-excel-file.
 *
 * Kept generic so it can be reused for
 * independent automation projects.
 */
export async function readExcelFile(
  filePath: string
) {
  const rows =
    await readXlsxFile(filePath);

  if (!rows) {
    throw new Error(
      'Excel file could not be read.'
    );
  }

  return rows;
}

/**
 * Validate required CSV columns.
 */
export async function validateCSVColumns(
  filePath: string,
  requiredFields: string[]
) {
  const content = fs.readFileSync(
    filePath,
    'utf8'
  );

  expect(
    content.trim(),
    'CSV file must not be empty'
  ).not.toBe('');

  const lines = content
    .split(/\r?\n/)
    .filter(line => line.trim() !== '');

  expect(
    lines.length,
    'CSV must contain a header and at least one data row'
  ).toBeGreaterThanOrEqual(2);

  const headers = lines[0]
    .split(',')
    .map(normalizeValue);

  const missingFields =
    requiredFields.filter(
      field =>
        !headers.includes(
          normalizeValue(field)
        )
    );

  test.info().annotations.push({
    type: 'CSV Validation',
    description:
      `Rows: ${lines.length - 1} | ` +
      `Required Fields: ${requiredFields.length} | ` +
      `Missing Fields: ${missingFields.length}`
  });

  expect(
    missingFields,
    `Missing CSV columns: ${missingFields.join(', ')}`
  ).toEqual([]);
}

