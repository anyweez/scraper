const crypto = require('crypto');

import { ArticleSource } from './sources/source';

export class Article {
    id: string; // should be unique but deterministic (hash)
    title: string;
    url: string;

    published: Date;
    source: ArticleSource;

    constructor(raw: any, source : ArticleSource) {
        this.published = new Date(Date.parse(raw.publishedAt));
        this.url = raw.url;
        this.title = raw.title;
        this.source = source;

        this.id = Article.HashOf(this);
    }

    static HashOf(article: Article) : string {
        return crypto.createHash('md5').update(article.url).digest('hex');
    }

    fetch() : Promise<string> {
        return this.source.fetch(this);
    }
};