# Playwright TypeScript Automation

## Overview

A personal UI test automation project built with **Playwright and TypeScript** to practice and demonstrate modern web application testing, reusable automation design, and end-to-end test validation.

This project is developed independently and does not contain or reproduce any proprietary company source code, test data, credentials, or internal application information.

## Technologies

* TypeScript
* Playwright
* Node.js
* Playwright Test
* Git & GitHub

## Automation Features

* End-to-end UI testing
* Page Object Model
* Reusable test helpers
* Test data management
* Assertions and validations
* Form and UI interaction testing
* Authentication testing
* Table and data validation
* Screenshot capture
* Trace collection
* HTML test reporting

## Project Structure

```text
playwright-typescript-automation/
│
├── tests/
│   ├── login.spec.ts
│   ├── dashboard.spec.ts
│   ├── forms.spec.ts
│   └── tables.spec.ts
│
├── pages/
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   └── FormsPage.ts
│
├── helpers/
│   ├── waitHelpers.ts
│   └── validationHelpers.ts
│
├── test-data/
│   └── testData.ts
│
├── playwright.config.ts
├── package.json
├── tsconfig.json
├── .gitignore
├── .env.example
└── README.md
```

## Automation Approach

The project follows a reusable automation architecture:

```text
Test Cases
    ↓
Page Objects
    ↓
Reusable Helpers
    ↓
UI Actions
    ↓
Assertions & Validation
    ↓
Test Report
```

### Page Object Model

Page-specific elements and actions are organized into separate page classes to improve:

* Reusability
* Maintainability
* Readability
* Test organization

### Reusable Helpers

Common operations are separated into reusable helper functions to avoid unnecessary duplication across test cases.

### Assertions

Tests use Playwright assertions to validate expected application behavior and UI states.

## Running the Project

Install dependencies:

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install
```

Run all tests:

```bash
npx playwright test
```

Run tests with the browser visible:

```bash
npx playwright test --headed
```

Run a specific test:

```bash
npx playwright test tests/login.spec.ts
```

Open the HTML report:

```bash
npx playwright show-report
```

## Configuration

Environment-specific values should be stored locally and should not be committed to GitHub.

Example:

```text
BASE_URL=
TEST_USERNAME=
TEST_PASSWORD=
```

Only placeholder values should be included in `.env.example`.

## Testing Areas

The project is intended to cover common web application testing scenarios such as:

* Login and authentication
* Navigation
* Form validation
* Dashboard components
* Tables and data
* Search functionality
* UI element validation
* Error handling
* Functional workflows

Additional test scenarios will be added as the project develops.

## Learning Objectives

Through this project, I am developing practical experience in:

* Playwright automation
* TypeScript
* End-to-end testing
* Page Object Model
* Test design
* Reusable automation utilities
* UI validation
* Test reporting
* Debugging automated tests
* Maintainable test architecture

## Disclaimer

This is a personal learning and portfolio project.

No proprietary company source code, internal application code, credentials, customer information, confidential test data, or private company infrastructure is included in this repository.

## Author

**Balamurugan P.**

Cybersecurity Analyst | CCNA | Network Security | Test Automation
