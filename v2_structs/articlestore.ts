const fs = require('mz/fs');

import { Article } from './article';

/**
 * An ArticleStore is used for organizing and, unsurprisingly, storing those files
 * on disk.
 */
export class ArticleStore {
    buckets: { [key: string]: Array<Article> } = {};
    modified: { [key: string]: boolean } = {};

    exists = new Set();

    constructor(rootDir: string) {
        /* Save changes every two minutes */
        setInterval(() => this.save_deltas(rootDir), 120000);
    }

    add(article: Article) {
        const bucket = this.get_bucket(article);

        if (this.buckets.hasOwnProperty(bucket)) {
            this.buckets[bucket].push(article);
        } else {
            this.buckets[bucket] = [article];
            this.modified[bucket] = true;
        }

        this.exists.add(article.id);
        this.modified[bucket] = true;

        console.log(`Added '${article.title}' to bucket ${bucket}`);
        console.log(article.url);
    }

    get_bucket(article: Article): string {
        const day = article.published.getDate() > 10 ? article.published.getDate() : '0' + article.published.getDate();
        const month = article.published.getMonth() + 1 > 10 ? article.published.getMonth() + 1 : '0' + (article.published.getMonth() + 1);
        const year = article.published.getFullYear();

        return `${year}-${month}-${day}`;
    }

    save_deltas(root: string) {
        Object.keys(this.modified)
            .filter(key => this.modified[key])
            .forEach(key => fs.writeFile(`${root}/metadata/${key}.json`, JSON.stringify(this.buckets[key])));
    }
}