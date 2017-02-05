let request = require('request-promise-native');

import { Source } from './structs/source'; 
import { fetchLatest } from './stages/fetch';
import { URLS } from './urls';

const ARTICLE_CHECK_INTERVAL = 5 * 60 * 1000; // once every five minutes

function main() {
    /* Fetch all news sources once, then check each of those sources on an interval. */
    request(URLS.sources())
        .then(response => {
            const sources : Array<Source> = JSON.parse(response).sources.map(source => new Source(source));

            sources.forEach(source => {
                setTimeout(
                    () => fetchLatest(source),
                    Math.random() * 10000
                );

                // Randomly delay the start of each request so that we distribute the work
                // a little better.
                setInterval(
                    () => fetchLatest(source), 
                    ARTICLE_CHECK_INTERVAL + (Math.random() * 10000)
                ); 
            });
        })
        .catch(err => {
            console.error(`Couldn't load source list: ${err}`);
        });
}

/* A newsapi API key is required */
if (!process.env.hasOwnProperty('NEWS_API_KEY')) {
    throw new Error('No NEWS_API_KEY specified');
}

main();