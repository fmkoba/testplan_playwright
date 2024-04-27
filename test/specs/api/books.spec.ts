import { test, expect } from '@playwright/test';
import BooksAPI from '../../pages/books';

const { ISBN, USER_ID, USER_NAME, PASSWORD } = process.env;

const booksAPI = new BooksAPI();

const userId = USER_ID;
const isbn = ISBN;
const userName = USER_NAME || 'username';
const password = PASSWORD || 'password';

test.describe('BookStore API', () => {
  test('should return a list of books', async ({ request }) => {
    const testBook = booksAPI.GETBooksFixture.books[0];

    const books = await request.get(booksAPI.booksEndpoint);

    await expect(books.status()).toBe(200);

    const booksJson = await books.json();
    await expect(booksJson).not.toBe(null);
    await expect(booksJson).toHaveProperty('books');
    Object.keys(testBook).forEach(async (key) => {
      await expect(booksJson.books[0][key]).toBe(testBook[key]);
    });
  });

  test('should return a 400 for a book that does not exist', async ({
    request,
  }) => {
    const isbn = booksAPI.faultyISBN;
    const errorMessage = booksAPI.GETBookErrorMessage;
    const errorCode = booksAPI.GETBookErrorCode;

    const book = await request.get(`${booksAPI.bookEndpoint}?ISBN=${isbn}`);

    await expect(book.status()).toBe(400);

    const bookJson = await book.json();
    await expect(bookJson.message).toEqual(errorMessage);
    await expect(bookJson.code).toEqual(errorCode);
  });

  test('should return a book by ISBN', async ({ request }) => {
    const testBook = booksAPI.GETBooksFixture.books[0];

    const book = await request.get(
      `${booksAPI.bookEndpoint}?ISBN=${testBook.isbn}`,
    );

    await expect(book.status()).toBe(200);

    const bookJson = await book.json();
    await expect(bookJson).not.toBe(null);
    Object.keys(testBook).forEach(async (key) => {
      await expect(bookJson[key]).toBe(testBook[key]);
    });
  });

  test('should add Books to account', async ({ request }) => {
    const token = await booksAPI.getAuthToken(userName, password);

    const booksResponse = await request.post(booksAPI.booksEndpoint, {
      data: {
        userId,
        collectionOfIsbns: [
          {
            isbn,
          },
        ],
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const booksResponseJson = await booksResponse.json();
    await expect(booksResponse.status()).toBe(201);
    await expect(booksResponseJson).toHaveProperty('books');
    await expect(booksResponseJson.books[0].isbn).toBe(isbn);
  });

  test('should remove Books from account', async ({ request }) => {
    const token = await booksAPI.getAuthToken(userName, password);

    const booksResponse = await request.delete(
      `${booksAPI.booksEndpoint}?UserId=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    await expect(booksResponse.status()).toBe(204);
  });
});
