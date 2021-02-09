'use strict';

const fs = require('fs');

const writeFileSync = function (filename, contents) {
    const data = JSON.stringify(contents, null, 2);

    fs.writeFileSync(filename, data);

    console.log('Data written to file');

    return contents;
}

const fieldsMatch = function (record, fields) {
    for (var name in fields) {
        if (fields.hasOwnProperty(name)) {
            if (fields[name] != record[name]) {
                console.log('field ' + name + ' does not match: ' + fields[name] + ', ' + record[name]);
                return false;
            }
        }
    }

    console.log('found match: ', record);
    return true;
}

const findById = function (id, records) {
    for (let i = 0; i < records.length; i++) {
        const record = records[i];

        if (record._id === id) {
            return record;
        }
    }

    console.log('Error: could not find id ' + id);
    console.log('Records:  ', records);
    return undefined;
}

/**
 * Simple file based database mock up.  Useful for prototyping
 * and setting up a data model before committing to a true
 * database.  NOT meant for production environments!
 * 
 * @param {String} path 
 * @param {String} className 
 */
const FileDB = function (path, className) {

    const filename = path + '/' + className + '.json';

    const rawdata = fs.readFileSync(filename);
    let contents = JSON.parse(rawdata);
    console.log(contents);

    this.findFields = function (fields) {
        const self = this;

        return new Promise((resolve, reject) => {

            const matches = [];

            self.getAll()
                .then((results) => {

                    for (let i = 0; i < results.length; i++) {
                        const result = results[i];

                        if (fieldsMatch(result, fields)) {
                            matches.push(result);
                        }
                    }

                    resolve(matches);
                })
                .catch((e) => {
                    reject(e);
                })
        });
    }

    this.getAll = function () {
        return new Promise((resolve, reject) => {
            resolve(JSON.parse(JSON.stringify(contents))); // return a copy
        })
    };

    this.getById = function (id) {
        return new Promise((resolve, reject) => {
            const result = [];

            for (let i = 0; i < contents.length; i++) {
                const entry = contents[i];

                if (entry._id === id) {
                    resolve(JSON.parse(JSON.stringify(entry))); // return a copy
                    return;
                }
            }

            reject('could not find id ' + id);
        })
    }

    /**
     * Any updates to the database force a complete 
     * rewrite of the underlying file.  Not efficient by any
     * means, but workable for testing purposes.
     * 
     * @param {Object} newContents 
     */
    const rewriteDB = function (newContents) {
        return new Promise((resolve, reject) => {
            contents = newContents;

            const result = writeFileSync(filename, contents);
            resolve(contents);
        })
    }

    /**
     * Update an existing entry in the file store
     * Will look for the id property of updateEntry
     * to find the existing entry.  Underlying file store
     * will be updated if the id is found.
     * 
     * @param {Object} updateEntry 
     */
    this.update = function (updateEntry) {
        return new Promise((resolve, reject) => {
            for (let i = 0; i < contents.length; i++) {
                const entry = contents[i];

                if (entry._id === updateEntry._id) {
                    contents[i] = JSON.parse(JSON.stringify(updateEntry));

                    rewriteDB(contents)
                        .then((result) => {
                            resolve(updateEntry);
                        })
                        .catch((e) => {
                            reject(e);
                        })

                    return;
                }
            }

            reject('could not find id ' + updateEntry._id);
        })
    }

    /**
     * Get multiple records by id in one call
     * 
     * @param {Array} ids an array of ids to search for
     */
    this.getIds = function (ids) {
        const self = this;

        return new Promise((resolve, reject) => {
            self.getAll()
                .then((records) => {
                    const results = [];

                    for (let i = 0; i < ids.length; i++) {
                        const id = ids[i];

                        const record = findById(id, records);
                        results.push(record);
                    }

                    resolve(results);
                })
                .catch((e) => {
                    reject(e);
                })
        })
    }

    /**
     * Create a new record in the file store.  Will take
     * entryData as the fields for this record, adding a
     * unique identifier as part of the creation process.
     * 
     * @param {Object} entryData 
     */
    this.create = function (entryData) {
        return new Promise((resolve, reject) => {
            const now = new Date();
            const id = now.getTime().toString();

            const entry = JSON.parse(JSON.stringify(entryData));
            entry._id = id;
            entry.class = className;

            console.log('creating ' + JSON.stringify(entry));

            // add to our content
            contents.push(entry);

            // write to the file system
            rewriteDB(contents)
                .then(() => {
                    resolve(entry);
                })
                .catch((e) => {
                    reject(e);
                })
        })
    }

}

module.exports = FileDB;