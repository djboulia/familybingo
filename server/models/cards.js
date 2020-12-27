
'use strict';

const BingoCard = require('../utils/bingocard');

const findCard = function (id, cards) {
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];

        if (card._id === id) {
            return card;
        }
    }

    console.log('Error: could not find id ' + id);
    console.log('Cards:  ', cards);
    return undefined;
}

module.exports = function (db) {

    this.getById = function (id) {
        return new Promise((resolve, reject) => {
            const result = [];

            db.getById(id)
                .then((card) => {
                    resolve({
                        _id: id,
                        _rev: card._rev,
                        class: card.class,
                        rows: BingoCard.updateBingoCard(card.rows)
                    });
                    return;
                })
                .catch((e) => {
                    reject(e);
                })

        })
    }

    this.getIds = function (ids) {
        return new Promise((resolve, reject) => {
            db.getAll()
                .then((cards) => {
                    const results = [];

                    for (let i = 0; i < ids.length; i++) {
                        const id = ids[i];

                        const card = findCard(id, cards);
                        results.push({
                            _id: card._id,
                            _rev: card._rev,
                            class: card.class,
                            rows: BingoCard.updateBingoCard(card.rows)
                        });
                    }

                    resolve(results);
                })
                .catch((e) => {
                    reject(e);
                })
        })
    }

    this.update = function (card) {
        return new Promise((resolve, reject) => {

            db.update({
                _id: card._id,
                _rev: card._rev,
                class: card.class,
                rows: BingoCard.getCardData(card.rows)
            })
                .then((card) => {
                    resolve({
                        _id: card._id,
                        _rev: card._rev,
                        class: card.class,
                        rows: BingoCard.updateBingoCard(card.rows)
                    });
                })
                .catch((e) => {
                    reject(e);
                })
        })
    }

    this.create = function (cardData) {
        return db.create(cardData);
    }

};