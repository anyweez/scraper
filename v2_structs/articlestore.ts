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
    rootDir: string;

    constructor(rootDir: string) {
        this.rootDir = rootDir;

        /* Save changes every two minutes */
        setInterval(() => this.save_deltas(rootDir), 120000);
    }

    add(article: Article, content: string) {
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

        this.write_html(article, content);
    }

    get_bucket(article: Article): string {
        const day = article.published.getDate() > 10
            ? article.published.getDate()
            : '0' + article.published.getDate();
        const month = article.published.getMonth() + 1 > 10
            ? article.published.getMonth() + 1
            : '0' + (article.published.getMonth() + 1);
        const year = article.published.getFullYear();

        return `${year}-${month}-${day}`;
    }

    write_html(article: Article, content: string) {
        const dir = this.get_bucket(article);

        try {
            /* Try to create it. If it already exists, no prob. */
            fs.mkdirSync(`${this.rootDir}/html/${dir}`);
        } catch (e) { }

        fs.writeFile(`${this.rootDir}/html/${dir}/${article.id}.html`, content);
    }

    save_deltas(root: string) {
        Object.keys(this.modified)
            .filter(key => this.modified[key])
            .forEach(key => {
                /* Exclude the 'out' property from JSON */
                fs.writeFile(
                    `${root}/metadata/${key}.json`, 
                    JSON.stringify(this.buckets[key], (k, v) => k === 'out' ? undefined : v)
                );
                this.modified[key] = false;
            });
    }
}