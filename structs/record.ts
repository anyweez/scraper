const crypto = require('crypto');
const fs = require('mz/fs');

const DURABILITY_CHECK_DURATION = 30000;

export class Record {
    _id: string
    url: string
    author: string
    title: string
    description: string
    publishedAt: Date

    constructor(raw : any) {
        this.url = raw.url;
        this.author = raw.author;
        this.title = raw.title;
        this.description = raw.description;
        this.publishedAt = new Date(Date.parse(raw.publishedAt));

        this._id = Record.HashOf(this);
    }

    static HashOf(record: Record) {
        return crypto.createHash('md5').update(record.url).digest('hex');
    }
}

export class RecordSet {
    records = [];
    ids = new Set();
    path : string

    constructor(path : string) {
        this.path = path;

        fs.exists(path).then(exists => {
            if (exists) this._load();
        });

        this._makeDurable();
    }

    add(r : Record) {
        if (!this.exists(r)) {
            this.records.push(r);
            this.ids.add(r._id);
        }
    }

    exists(r : Record) : boolean {
        return this.ids.has(r._id);
    }

    _makeDurable() {
        let size = this.records.length;

        setInterval(() => {
            if (this.records.length > size) {
                size = this.records.length;
                this._save();
            }
        }, DURABILITY_CHECK_DURATION);
    }

    /**
     * Usually invoked by _makeDurable, not directly. Records a JSON representation
     * of the RecordSet to the `path`.
     */
    _save() {
        const rs = {
            lastUpdate: new Date(),
            records: this.records
        };

        console.log(`Recording RecordSet with ${rs.records.length} records.`);

        fs.writeFileSync(this.path, JSON.stringify(rs));
    }

    _load() {
        fs.readFile(this.path)
            .then(content => {
                let { records } = JSON.parse(content);

                records
                    .map(record => new Record(record)) // Convert back to Record objects
                    .forEach(record => this.add(record));

                console.log(`Loaded ${records.length} records from stored recordset.`);
            })
    }
}