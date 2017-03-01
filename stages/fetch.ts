const request = require('request-promise-native');
const scrapeurl = require('scrapeurl');
const fs = require('mz/fs');

import { Source } from '../structs/source';
import { Record, RecordSet } from '../structs/record';
import { URLS } from '../urls';

/* Load the recordset from news.json if it exists */
const rs = new RecordSet('news.json');

/**
 * Fetch the latest news articles and retrieve their contents. This function
 * is called periodically by the core application.
 */
export function fetchLatest(source: Source) {
    request(URLS.articles(source.id))
        .then(response => {
            const { articles } = JSON.parse(response);

            articles
                // Convert raw obj's to Record obj's
                .map(article => new Record(article, source))
                // Filter out articles we've already seen.
                .filter(article => !rs.exists(article))
                .forEach(record => getArticle(record));
        })
        .catch(err => {
            console.error(`Couldn't fetch articles from ${source.name}: ${err}`);
        });
}

/**
 * Actually fetch the article and write the article to disk. Also save the record
 * the recordset.
 */
export function getArticle(record: Record) {
    scrapeurl({
        url: record.url,
    }).done(response => {
        if (response.text && response.text.length > 0) {
            fs.writeFileSync(`news/${record._id}.html`, response.text);
            rs.add(record);
        } else {
            console.warn(`Warning: empty body`);
        }
    }).fail((err, response) => {
        console.error(err);
        console.error(`\tURL: ${record.url}\n\tStatus: ${err.status}`);
    });
}