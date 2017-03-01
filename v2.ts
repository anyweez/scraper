const fs = require('mz/fs');

import { Article } from './v2_structs/article';
import { ArticleStore } from './v2_structs/articlestore';
import { createSource } from './v2_structs/sources/source';

if (!process.env.hasOwnProperty('NEWS_API_KEY')) {
    console.error('Must specify a NEWS_API_KEY.');
    process.exit(1);
}

const print = console.log.bind(console);
const store = new ArticleStore('v2_news');


/**
 * 1. Load all news sources.
 * 2. Set up at least one ArticleSource for each news source.
 * 3. Each ArticleSource should add content to shared queue.
 * 4. Periodically pull article from queue and add to ArticleStore (validate first).
 */

const queue : Array<Article> = [];

fs.readFile('sources.json').then(content => {
    return JSON.parse(content).map(source => createSource(source));
}).then(sources => {
    print(`Initialized ${sources.length} sources.`);
    /**
     * Each stream will monitor itself and add articles to a shared queue. Streams
     * share a registry of articles that have been added previously so no duplicates
     * will be allowed (based on article id).
     */
    sources.forEach(source => {
        source.stream_to(queue);
        source.start();
    });
});

/**
 * Regularly pull articles from the queue and fetch them. If we get a valid response, 
 * add the article to the article store and write the contents to disk.
 * 
 * TODO: potentially validate that the content is 'worthwhile' (length > 0, etc).
 */
setInterval(() => {
    console.log(`Checking queue (len=${queue.length})`);

    if (queue.length > 0) {
        const next = queue.shift();
        console.log(`Fetching '${next.title}'`);

        next.fetch().then(content => store.add(next, content));
    }
}, 1000);