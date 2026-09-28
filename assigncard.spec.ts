import { test, expect } from "@playwright/test";
import { login, verifyRowMetric , expectValueWithinRange} from "../../utils/loginHelper";
import { Locator } from "@playwright/test";

test.describe(
  "XXX Counters - Operational Suite",
  () => {
    test(
      "ASNUMBER @yyy_tag @user_topper_counts_xxx_counters",
      async ({ page }) => {
        test.setTimeout(60000);

        // ==========================================================
        // 1. Session & Navigation
        // ==========================================================
        await login(page, "user");
        
        await page.waitForLoadState(
          "networkidle"
        );

        await page
          .getByRole("link", {
            name: "XXX_Menu",
            exact: true,
          })
          .click();

        await page
          .getByRole("link", {
            name: "XXX Counters",
            exact: true,
          })
          .click();

        // ==========================================================
        // 2. Counter Filter Selection
        // ==========================================================
        await page
          .locator("a")
          .filter({
            hasText: "Please select",
          })
          .click();

        const asNumber = page
          .locator(
            ".chosen-results li"
          )
          .filter({
            hasText: "ASNUMBER",
          })
          .first();

        await expect(
          asNumber
        ).toBeVisible();

        await asNumber.click();

        // ==========================================================
        // 3. Upload Card
        // ==========================================================
        const uploadCard = page
          .locator(
            '#top-0-0 > .card-body'
          )
          .first();

        await expect(
          page.getByRole(
            "heading",
            {
              name: /0 \| Upload Bytes/i,
            }
          )
        ).toBeVisible();

        await verifyRowMetric(
          uploadCard,
          "COMPANY_A",
          1,
          "00%",
          "000.00 GB",
          "00%"
        );
        await uploadCard.locator('label:has-text("Max")').click();

        await verifyRowMetric(
          uploadCard,
          "NETWORK_PROVIDER_B",
          2,
          "00%",
          "000.00 Mb"
        );
        await uploadCard.locator('label:has-text("Min")').click();

        await verifyRowMetric(
          uploadCard,
          "NETWORK_PROVIDER_C",
          3,
          "00%",
          "000.00 Mb"
        );
        await uploadCard.locator('label:has-text("Average")').click();

        await verifyRowMetric(
          uploadCard,
          "COMPANY_D",
          4,
          "0%",
          "000.00 Mb"
        );
        await uploadCard.locator('label:has-text("%tile")').click();

        await verifyRowMetric(
          uploadCard,
          "NETWORK_PROVIDER_E",
          5,
          "0%",
        );

        // ==========================================================
        // 4. Download Card
        // ==========================================================
        const downloadCard = page.locator('div[id^="top-"]').filter({
          has: page.getByRole("heading", { name:  /1 \| Download Bytes/i }),
        });

        // Verify visibility of the header
        await expect(page.getByRole("heading", { name:  /1 \| Download Bytes/i })).toBeVisible();

        // Use Playwright's built-in text assertion directly on the locator
        const downloadCardValue = downloadCard.locator('.card-header span.text-success');
        await expectValueWithinRange(downloadCardValue , "0.00 TB");

        await verifyRowMetric(
          downloadCard,
          "NETWORK_PROVIDER_F",
          1,
          "00%",
          "000.00 GB"
        );
        await downloadCard.locator('label:has-text("Max")').click();
        
        await verifyRowMetric(
          downloadCard,
          "COMPANY_G",
          2,
          "00%",
          "000.00 Mb"
        );
        await downloadCard.locator('label:has-text("Min")').click();
        
        await verifyRowMetric(
          downloadCard,
          "CDN_PROVIDER_H",
          3,
          "0%",
          "000.00 Mb"
        );
        await downloadCard.locator('label:has-text("Average")').click();
        
        await verifyRowMetric(
          downloadCard,
          "NETWORK_PROVIDER_I",
          4,
          "0%",
          "000.00 Mb"
        );
        await downloadCard.locator('label:has-text("%tile")').click();
        
        await verifyRowMetric(
          downloadCard,
          "COMPANY_J",
          5,
          "0%",
        );
      }
    );
  }
);
