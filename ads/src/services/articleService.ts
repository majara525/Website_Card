import articlesData from '../data/articles.json';
import type { Article } from '../types';

export interface ArticleService {
  listArticles(): Promise<Article[]>;
  getArticle(idOrSlug: string): Promise<Article | undefined>;
}

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export class LocalArticleService implements ArticleService {
  async listArticles(): Promise<Article[]> {
    await delay(360);
    return articlesData as Article[];
  }

  async getArticle(idOrSlug: string): Promise<Article | undefined> {
    await delay(160);
    return (articlesData as Article[]).find((article) => article.id === idOrSlug || article.slug === idOrSlug);
  }
}

export const articleService: ArticleService = new LocalArticleService();
