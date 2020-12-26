/**
 * Backend for the bingo game
 *
 */

require("dotenv").config();

const DBLoader = function(modulePath, dataPath) {
    const module = require(modulePath);
    return new module(dataPath);    
}

const TEST_DATA_PATH = process.env.TEST_DATA_PATH;
// const Players = DBLoader('./testmodels/players', TEST_DATA_PATH);
// const Games = DBLoader('./testmodels/games', TEST_DATA_PATH);
// const Cards = DBLoader('./testmodels/cards', TEST_DATA_PATH);
// const Topics = DBLoader('./testmodels/topics', TEST_DATA_PATH);

var Cloudant = require('@cloudant/cloudant');
 
var me = process.env.CLOUDANT_USERNAME;
var password = process.env.CLOUDANT_PASSWORD;

var cloudant = Cloudant({ account: me, password: password });

const Players = DBLoader('./models/players', cloudant);
const Games = DBLoader('./models/games', cloudant);
const Cards = DBLoader('./models/cards', cloudant);
const Topics = DBLoader('./models/topics', cloudant);

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

// create the game with the players and cards

const game = {
    name: 'Christa-mas 2020',
    startDate: new Date().toString(),
    endDate: new Date().toString(),
    players: [],
    complete: false,
    activeRound: 0,
    totalRounds: 3,
    rounds: []
};

// get all players
Players.getAll()
    .then((players) => {
        results.players = players;

        // figure out which topics (content) to use
        return Topics.getById('250e77f28e2a0240932fd56247060d4e');
    })
    .then((topic) => {
        results.topic = topic;
        game.topic = topic._id;

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

        const round = [];

        for (let i = 0; i < cards.length; i++) {
            const player = cards[i].player;
            const card = cards[i].card;

            console.log('card ' , card);

            round.push({
                user: player._id,
                card: card._id
            })
        }

        game.rounds.push(round);

        // create bingo cards for each player
        const topic = results.topic;
        const promises = [];
        const players = results.players;

        for (let i = 0; i < players.length; i++) {
            const player = players[i];

            promises.push(createCard(player, newCard(topic)));
        }

        return Promise.all(promises);
    })
    .then((cards) => {

        const players = results.players;
        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            const playerId = player._id;

            game.players.push(playerId)
        }


        const round = [];

        for (let i = 0; i < cards.length; i++) {
            const player = cards[i].player;
            const card = cards[i].card;

            round.push({
                user: player._id,
                card: card._id
            })
        }

        game.rounds.push(round);

        // create bingo cards for each player
        const topic = results.topic;
        const promises = [];

        for (let i = 0; i < players.length; i++) {
            const player = players[i];

            promises.push(createCard(player, newCard(topic)));
        }

        return Promise.all(promises);
    })
    .then((cards) => {

        const players = results.players;

        const round = [];

        for (let i = 0; i < cards.length; i++) {
            const player = cards[i].player;
            const card = cards[i].card;

            round.push({
                user: player._id,
                card: card._id
            })
        }

        game.rounds.push(round);


        return Games.create(game);
    })
    .then((game) => {
        console.log('game created');
    })
