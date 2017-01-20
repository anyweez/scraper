/**
 * Represents a single news source.
 */
export class Source {
    id: string;
    name: string;

    constructor(raw) {
        this.id = raw.id;
        this.name = raw.name;
    }
}