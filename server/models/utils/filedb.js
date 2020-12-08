'use strict';

const fs = require('fs');

const writeFile = function (filename, contents) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(contents, null, 2);

        fs.writeFile(filename, data, (err) => {
            if (err) {
                console.log('Error: ', err);
                reject(err);
                return;
            }

            console.log('Data written to file');
            resolve(contents);
        });
    })
}


/**
 * Simple file based database mock up.  Useful for prototyping
 * and setting up a data model before committing to a true
 * database.
 * 
 * @param {String} filename 
 */
const FileDB = function (filename) {

    const rawdata = fs.readFileSync(filename);
    let contents = JSON.parse(rawdata);
    console.log(contents);


    this.getAll = function () {
        return new Promise((resolve, reject) => {
            resolve(contents);
        })
    };

    this.getById = function (id) {
        return new Promise((resolve, reject) => {
            const result = [];

            for (let i = 0; i < contents.length; i++) {
                const entry = contents[i];

                if (entry.id === id) {
                    resolve(entry);
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

            writeFile(filename, contents)
                .then((result) => {
                    resolve(contents);
                })
                .catch((e) => {
                    reject(e);
                })
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

                if (entry.id === updateEntry.id) {
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

            reject('could not find id ' + id);
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
            entry.id = id;

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