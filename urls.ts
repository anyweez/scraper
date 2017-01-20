export const URLS = {
    /**
     * The URL for requesting the canonical list of sources
     */
    sources() {
        return 'https://newsapi.org/v1/sources?language=en';
    },
    /**
     * The URL for requesting news articles for the specified source. 
     */
    articles(source: string) {
        return [
            `https://newsapi.org/v1/articles?`,
            `source=${source}`,
            `&apiKey=${process.env.NEWS_API_KEY}`,
        ].join('');
    },
};