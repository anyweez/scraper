const request = require('request-promise-native');
const scrapeurl = require('scrapeurl');

import { Article } from '../article';

const API_KEY = process.env.NEWS_API_KEY;

const exists = new Set();
const REQUEST_NEW_ARTICLES_SECONDS = 60;

export class ArticleSource {
    name: string;
    slug: string;

    out: Array<Article>

    constructor(raw: any) {
        this.name = raw.name;
        this.slug = raw.slug;
    }

    /**
     * Sets the output queue for new articles. Sources will only add articles to the queue 
     * if they're unique.
     */
    stream_to(queue: Array<Article>) {
        this.out = queue;
    }

    exists(article: Article) : boolean {
        return exists.has(article.id);
    }

    /* Every five minutes, grab the list of available articles and add new ones to the queue */
    start() {
        const url = `https://newsapi.org/v1/articles?source=${this.slug}&apiKey=${API_KEY}`;

        setInterval(() => {
            request(url).then(resp => {
                const { articles } = JSON.parse(resp);

                articles
                    .map(raw => new Article(raw, this))
                    .filter(article => !this.exists(article))
                    .forEach(article => {                        
                        exists.add(article.id);
                        this.out.push(article);
                    });
            });
        }, REQUEST_NEW_ARTICLES_SECONDS * 1000);
    }

    /**
     * How to fetch an individual article. Should be implemented for each type of source.
     */
    fetch(article: Article): Promise<string> {
        return new Promise<string>(resolve => {
            scrapeurl({
                url: article.url,
            }).done(content => resolve(content.text));
        });
    }
}

// TODO: should return different types of sources depending on `type` property.
export function createSource(source): ArticleSource {
    return new ArticleSource(source);
}