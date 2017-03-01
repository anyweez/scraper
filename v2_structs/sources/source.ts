export class ArticleSource {
    name: string;
    slug: string;

    constructor(raw: any) {
        this.name = raw.name;
        this.slug = raw.slug;
    }
}

// TODO: should return different types of sources depending on `type` property.
export function createSource(source) : ArticleSource {
    return new ArticleSource(source);
}