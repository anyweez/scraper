const fs = require('mz/fs');
const request = require('request-promise-native');

import { Article } from './v2_structs/article';
import { ArticleStore } from './v2_structs/articlestore';
import { createSource } from './v2_structs/sources/source';

const print = console.log.bind(console);

const store = new ArticleStore('v2_news');
const API_KEY = 'c9a640cfbfb64019837e520488ab2815';

/**
 * 1. Load all news sources.
 * 2. Set up at least one ArticleSource for each news source.
 * 3. Each ArticleSource should add content to shared queue.
 * 4. Periodically pull article from queue and add to ArticleStore (validate first).
 */

const queue = [];

fs.readFile('sources.json').then(content => {
    return JSON.parse(content).map(source => createSource(source));
}).then(sources => {
    sources.forEach(source => {
        const url = `https://newsapi.org/v1/articles?source=${source.slug}&apiKey=${API_KEY}`;

        request(url).then(resp => {
            const { articles } = JSON.parse(resp);

            articles
                .map(raw => new Article(raw, source))
                .forEach(article => store.add(article));
        })
    });
});