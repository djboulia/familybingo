/**
 * Backend for the bingo game
 *
 */

require("dotenv").config();

var Players = require('./models/players');
var Topics = require('./models/topics');
var Games = require('./models/games');
var Cards = require('./models/cards');

const results = {};

const createCard = function (player, cardData) {
    return new Promise((resolve, reject) => {

        Cards.create({ rows: cardData })
            .then((card) => {
                resolve({
                    player: player,
                    card: card
                });
            })
            .catch((e) => {
                reject(e);
            })
    })
};

const rando = function (topic) {
    const max = topic.content.length;
    const index = Math.floor(Math.random() * Math.floor(max));
    console.log("rando found index: " + index);

    // remove the topic so we don't use it again
    const result = topic.content.splice(index, 1);
    console.log('rturning text ', result[0].text);
    return result[0].text;
};

const newCard = function (topic) {
    // randomize the topic and create a new card for this player 
    const cardData = [];
    const topicCopy = JSON.parse(JSON.stringify(topic));

    for (let i = 0; i < 5; i++) {
        const row = [];

        for (let j = 0; j < 5; j++) {
            const freeSpace = (i === 2) && (j === 2);

            row.push({
                "text": (freeSpace) ? '' : rando(topicCopy),
                "selected": false,
                "freeSpace": freeSpace
            });
        }

        cardData.push(row);
    }

    return cardData;
};

// get all players
Players.getAll()
    .then((players) => {
        results.players = players;

        // figure out which topics (content) to use
        return Topics.getById('1234');
    })
    .then((topic) => {
        results.topic = topic;

        // create bingo cards for each player
        const promises = [];
        const players = results.players;

        for (let i = 0; i < players.length; i++) {
            const player = players[i];

            promises.push(createCard(player, newCard(topic)));
        }

        return Promise.all(promises);
    })
    .then((cards) => {
        // create the game with the players and cards

        const game = {
            name: 'SuperBowl Test',
            startDate: new Date().toString(),
            endDate: new Date().toString(),
            topic: results.topic.id,
            players: []
        }

        for (let i = 0; i < cards.length; i++) {
            const player = cards[i].player;
            const card = cards[i].card;

            game.players.push({
                id: player.id,
                card: card.id
            })
        }

        return Games.create(game);
    })
    .then((game) => {
        console.log('game crated');
    })
