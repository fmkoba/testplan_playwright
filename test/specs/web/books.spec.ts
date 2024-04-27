import { test, expect } from '@playwright/test';
import BooksPage from '../../pages/BooksPage';
import BooksAPI from '../../pages/books';

test.describe('BookStore Home Page', () => {
  test.beforeEach(async ({ page }) => {
    const booksPage = new BooksPage(page);
    await booksPage.goto();
  });

  test('should load the home page', async ({ page }) => {
    await expect(page).toHaveTitle('DEMOQA');
  });

  test('should see a list of books', async ({ page }) => {
    const booksPage = new BooksPage(page);

    await test.step('default book list state', async () => {
      await booksPage.validateTableRowsCount(11);
      await expect(booksPage.previousButton).toBeDisabled();
      await expect(booksPage.nextButton).toBeDisabled();
      await expect(booksPage.rowsSelect).toHaveValue('10');
    });

    await test.step('should paginate the book list', async () => {
      await booksPage.rowsSelect.selectOption('5');
      await expect(booksPage.previousButton).toBeDisabled();
      await expect(booksPage.nextButton).toBeEnabled();
      await booksPage.validateTableRowsCount(6);

      await booksPage.nextButton.click();
      await expect(booksPage.previousButton).toBeEnabled();
      await expect(booksPage.nextButton).toBeDisabled();

      await booksPage.previousButton.click();
      await expect(booksPage.previousButton).toBeDisabled();
      await expect(booksPage.nextButton).toBeEnabled();
    });
  });
});

test.describe('Auth Section BookStore Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#userName', 'asdqwe');
    await page.fill('#password', 'qwe123QWE!@#');
    await page.locator('#login').click();
  });

  // test.afterAll(async () => {
  //   console.log('No need for cleanup since we mocked the response 😜');
  // });

  test('/profile loads with 0 books to the account', async ({ page }) => {
    await page.waitForURL('/profile');
    await expect(page.getByText('No rows found')).toBeVisible();
  });

  test('mocked API response is displayed accordingly', async ({ page }) => {
    const booksAPI = new BooksAPI();
    await page.route('**/Account/v1/User/**', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          books: [booksAPI.GETBooksFixture.books[0]],
        }),
      });
    });

    await page.waitForURL('/profile');
    await expect(page.getByText('Git Pocket Guide')).toBeVisible();
  });
});
