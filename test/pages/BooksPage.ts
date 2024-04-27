import { Locator, Page, expect } from '@playwright/test';

export default class BooksPage {
  readonly page: Page;

  readonly nextButton: Locator;

  readonly previousButton: Locator;

  readonly tableRows: Locator;

  readonly rowsSelect: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.previousButton = page.getByRole('button', { name: 'Previous' });
    this.tableRows = page.locator('.books-wrapper').getByRole('row');
    this.rowsSelect = page.getByLabel('rows per page');
  }

  async goto(): Promise<void> {
    await this.page.goto('/books');
  }

  async validateTableRowsCount(count: number): Promise<void> {
    await expect(this.tableRows).toHaveCount(count);
  }
}
