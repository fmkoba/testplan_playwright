import { expect, request } from '@playwright/test';

interface Book {
  isbn: string;
  title: string;
  subTitle: string;
  author: string;
  publish_date: string;
  publisher: string;
  pages: number;
  description: string;
  website: string;
}
interface Books {
  books: Book[];
}

export default class BooksAPI {
  readonly request = request;

  readonly booksEndpoint: string;

  readonly bookEndpoint: string;

  readonly authEndpoint: string;

  readonly faultyISBN: string;

  readonly GETBookErrorMessage: string;

  readonly GETBookErrorCode: string;

  readonly GETBooksFixture: Books = {
    books: [
      {
        isbn: '9781449325862',
        title: 'Git Pocket Guide',
        subTitle: 'A Working Introduction',
        author: 'Richard E. Silverman',
        publish_date: '2020-06-04T08:48:39.000Z',
        publisher: "O'Reilly Media",
        pages: 234,
        description:
          'This pocket guide is the perfect on-the-job companion to Git, the distributed version control system. It provides a compact, readable introduction to Git for new users, as well as a reference to common commands and procedures for those of you with Git exp',
        website:
          'http://chimera.labs.oreilly.com/books/1230000000561/index.html',
      },
    ],
  };

  constructor() {
    this.booksEndpoint = '/BookStore/v1/Books';
    this.bookEndpoint = '/BookStore/v1/Book';
    this.authEndpoint = '/Account/v1/GenerateToken';
    this.faultyISBN = '1';
    this.GETBookErrorMessage =
      'ISBN supplied is not available in Books Collection!';
    this.GETBookErrorCode = '1205';
  }

  async getAuthToken(userName: string, password: string): Promise<string> {
    const context = await request.newContext();
    const authResponse = await context.post(this.authEndpoint, {
      data: {
        userName,
        password,
      },
    });
    expect(authResponse.status()).toBe(200);

    const authResponseJson = await authResponse.json();
    return authResponseJson.token;
  }

  async getBooks() {
    const context = await this.request.newContext();
    const books = await context.get(this.booksEndpoint);
    return books;
  }

  async getBookByISBN(isbn: string) {
    const context = await this.request.newContext();
    const book = await context.get(`${this.bookEndpoint}?ISBN=${isbn}`);
    return book;
  }

  async addBooksToAccount(userId: string, isbn: string, authToken: string) {
    const context = await this.request.newContext();
    const booksResponse = await context.post(this.booksEndpoint, {
      data: {
        userId,
        collectionOfIsbns: [
          {
            isbn,
          },
        ],
      },
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return booksResponse;
  }
}
