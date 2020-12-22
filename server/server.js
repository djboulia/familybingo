/**
 * Backend for the bingo game
 *
 */

var express = require('express'); // Express web server framework
var cors = require('cors')
var path = require('path');
var session = require("express-session");
const bodyParser = require('body-parser');

require("dotenv").config();

var Players = require('./models/players');
var Games = require('./models/games');
var Cards = require('./models/cards');
const { promises } = require('fs');

var client_url = (process.env.CLIENT_URL) ? process.env.CLIENT_URL : ""; // 'http://localhost:3000';
var server_url = (process.env.SERVER_URL) ? process.env.SERVER_URL : ""; // 'http://localhost:8888';

console.log("server_url ", server_url);
console.log("client_url ", client_url);


const app = express();

app.use(cors())

app.use(express.static(path.join(__dirname, '..', 'client')))
    .use(bodyParser.json());

app.use(
    session({
        secret: "keyboard cat",
        resave: true,
        saveUninitialized: true
    })
);

app.post('/api/login', function (req, res) {
    console.log("got body: ", req.body);

    // login attempt resets session data
    req.session.user = undefined;

    // for now, just return a positive response if there is any user/pass given
    const body = req.body;
    const userid = (body) ? body.userid : undefined;
    const password = (body) ? body.password : undefined;

    Players.authenticate(userid, password)
        .then((result) => {
            req.session.user = result;

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
        })
        .catch((err) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(err));
        })
});

app.post('/api/logout', function (req, res) {
    console.log("logout ");

    req.session.user = undefined;

    const result = {
        status: true,
        msg: 'success'
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result));
});

/**
 * get games for the current user
 */
app.get('/api/bingo/user/me/games', function (req, res) {

    const user = req.session.user;
    if (!user) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            status: false,
            msg: 'Not logged in.'
        }));
        return;
    }

    Games.getByUser(user.id)
        .then((result) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                status: true,
                msg: 'success',
                games: result
            }));
        })
        .catch((e) => {
            const err = {
                status: false,
                msg: 'Error retrieving games.'
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(err));
        })

});

/**
 * get a specific user's game cards
 */
app.get('/api/bingo/user/me/game/:gameid/cards', function (req, res) {
    const gameid = req.params.gameid;
    const user = req.session.user;

    if (!user) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            status: false,
            msg: 'Not logged in.'
        }));
        return;
    }

    console.log('found game id ' + gameid);

    Games.getAllCardIds(gameid, user.id)
        .then((results) => {
            const cards = [];

            for (let i = 0; i < results.length; i++) {
                const id = results[i];

                if (id) {
                    cards.push(Cards.getById(id));
                } else {
                    cards.push(new Promise((resolve, reject) => {
                        resolve(undefined);
                    }));
                }
            }
            return Promise.all(cards);
        })
        .then((cards) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                status: true,
                msg: 'success',
                cards: cards
            }));
        })
        .catch((e) => {
            console.log('error: ', e);

            const err = {
                status: false,
                msg: e
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(err));
        })
});

const hasBingo = function (card) {
    const rows = card.rows;

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        for (let j = 0; j < row.length; j++) {
            const cell = row[j];

            if (cell.bingo) return true;
        }
    }

    return false;
}

const completeRound = function (gameId) {
    return new Promise((resolve, reject) => {
        Games.getById(gameId)
            .then((game) => {
                const nextRound = game.activeRound + 1;
                if (nextRound >= game.totalRounds) {
                    // last round complete, game is now complete
                    game.complete = true;
                } else {
                    game.activeRound = nextRound;
                }

                // update the game info
                return Games.update(game);
            })
            .then((result) => {
                resolve(result);
            })
            .catch((e) => {
                reject(e);
            })
    })
}

const roundStillActive = function (game, cardId) {
    let thisCardRound = -1;

    const rounds = game.rounds;

    for (let i = 0; i < rounds.length; i++) {
        const round = rounds[i];

        for (let j = 0; j < round.length; j++) {
            const player = round[j];
            if (player.card === cardId) {
                thisCardRound = i;
                break;
            }
        }
    }

    return (thisCardRound === game.activeRound);
}

/**
 * update a users card
 */
app.post('/api/bingo/user/me/game/:gameid/card/:cardid', function (req, res) {
    const card = req.body;

    const gameid = req.params.gameid;
    const cardid = req.params.cardid;
    const user = req.session.user;

    if (!user) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            status: false,
            msg: 'Not logged in.'
        }));
        return;
    }

    console.log('found game id ' + gameid + ', and cardid ' + cardid);

    // check to make sure we can still update the card
    Games.getById(gameid)
        .then((game) => {
            if (game.complete) {
                throw 'Game is over';
            } else if (!roundStillActive(game, cardid)) {
                throw 'Round is already complete';
            }

            return Cards.update(card);
        })
        .then((card) => {
            // if this player got bingo, the round is complete
            // and we move to the next round or complete the entire game
            if (hasBingo(card)) {
                console.log('card ' + cardid + ' has bingo!');

                completeRound(gameid)
                    .then((result) => {
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({
                            status: true,
                            msg: 'success',
                            card: card
                        }));
                    })
                    .catch((e) => {
                        throw e;
                    })
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                    status: true,
                    msg: 'success',
                    card: card
                }));
            }
        })
        .catch((e) => {

            console.log('update error: ', e);
            const err = {
                status: false,
                msg: e
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(err));
        })

});

/**
 * get a specific game's summary data
 */
app.get('/api/bingo/game/:id', function (req, res) {

    const id = req.params.id;
    const gameSummary = {};

    console.log('game id ' + id);

    Games.getById(id)
        .then((result) => {
            gameSummary.id = result.id;
            gameSummary.name = result.name;
            gameSummary.complete = result.complete;
            gameSummary.activeRound = result.activeRound;
            gameSummary.totalRounds = result.totalRounds;

            console.log('gameSummary ', gameSummary);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                status: true,
                msg: 'success',
                game: gameSummary
            }));
        })
        .catch((e) => {
            const err = {
                status: false,
                msg: e
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(err));
        })
});

const getPlayerAndCard = function (gameid, playerId, roundId) {
    return new Promise((resolve, reject) => {
        const result = {};

        console.log('player ' + playerId);

        Players.getById(playerId)
            .then((playerData) => {
                result.name = playerData.name;
                result.id = playerData.id;

                return Games.getAllCardIds(gameid, playerData.id)
            })
            .then((cardIds) => {

                console.log('cardids: ', cardIds);

                for (let i = 0; i < cardIds.length; i++) {
                    const cardid = cardIds[i];

                    if (i.toString() === roundId) {
                        return Cards.getById(cardid);
                    }
                }

                throw 'Round ' + roundId + ' doesnt exist!';
            })
            .then((card) => {
                result.card = card;

                resolve(result);
            })
            .catch((err) => {
                reject(err);
            })
    })
}

/**
 * get a specific round's summary data
 */
app.get('/api/bingo/game/:id/round/:roundid', function (req, res) {

    const id = req.params.id;
    const roundId = req.params.roundid;
    const gameSummary = {};

    console.log('game id ' + id + ' roundId ' + roundId);

    Games.getById(id)
        .then((result) => {
            gameSummary.id = result.id;
            gameSummary.name = result.name;
            gameSummary.round = roundId;

            // go get all the player and card data
            const players = result.players;
            const promises = [];

            for (let i = 0; i < players.length; i++) {
                const player = players[i];

                promises.push(getPlayerAndCard(id, player, roundId));
            }

            return Promise.all(promises);
        })
        .then((results) => {
            gameSummary.players = results;
            console.log('gameSummary ', gameSummary);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                status: true,
                msg: 'success',
                game: gameSummary
            }));
        })
        .catch((e) => {
            const err = {
                status: false,
                msg: e
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(err));
        })
});



// catch all other non-API calls and redirect back to our REACT app
app.get('/*', function (req, res) {
    const defaultFile = path.join(__dirname, '..', 'client', 'index.html');
    res.sendFile(defaultFile);
});

console.log('Listening on 8888');
app.listen(process.env.PORT || 8888);