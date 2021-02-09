/**
 * Backend for the bingo game
 *
 */

const Config = require('./config');

const Players = Config.loadModel('player');
const Games = Config.loadModel('game');
const Cards = Config.loadModel('card');
const Topics = Config.loadModel('topic');

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
    console.log('returning text ', result[0].text);
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

async function createAllCards(totalRounds, players, topic) {
    const rounds = [];

    for (let j=0; j<totalRounds; j++) {
        // create bingo cards for each player
        const round = [];

        for (let i = 0; i < players.length; i++) {
            const player = players[i];

            const result = await createCard(player, newCard(topic));
            const card = result.card;

            round.push({
                user: player._id,
                card: card._id
            })
        }

        rounds.push(round);
    }

    return rounds;
}

// create the game with the players and cards

const game = {
    name: 'Five round test',
    startDate: new Date().toString(),
    endDate: new Date().toString(),
    players: [],
    complete: false,
    activeRound: 0,
    totalRounds: 5,
    rounds: []
};

// get all players
Players.getAll()
    .then((players) => {
        results.players = players;

        // figure out which topics (content) to use
        // return Topics.getById('4b7b27e387c97f85ddec89b2e7e24325');  // super bowl 2021
        // return Topics.getById('250e77f28e2a0240932fd56247060d4e'); // christa mas 2020
        return Topics.getById('1234');
    })
    .then((topic) => {
        results.topic = topic;
        game.topic = topic._id;

        // create bingo cards for each player
        const players = results.players;

        return createAllCards(game.totalRounds, players, topic);

    })
    .then((rounds) => {

        game.rounds = rounds;

        const players = results.players;
        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            const playerId = player._id;

            game.players.push(playerId)
        }

        return Games.create(game);
    })
    .then((game) => {
        console.log('game created');
    })
    .catch((e) => {
        console.log('error ' , e);
    })
