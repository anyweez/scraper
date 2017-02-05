# scraper: download news articles
This application downloads news articles available via a news api and dumps raw HTML into a `news/` subdirectory. It regularly polls all supported news sites.

## Inputs
News is being pulled from the [News API](https://newsapi.org/); all sources are polled every couple of minutes and new articles are downloaded once discovered.

## Outputs

**HTML file**. Each file is downloaded as an HTML file and saved into an output directory. No processing whatsoever is done on the files; they're saved as-is.

**JSON record**. The scraper will also maintain a repository of articles; the information maintained in each record can be seen in `structs/record.ts`. The records are saved in a single, uncompressed array and are persisted to disk periodically (configurable via command line).
