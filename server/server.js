/**
 * Backend for the bingo game
 *
 */

var express = require('express'); // Express web server framework
var cors = require('cors')
var path = require('path');
var session = require("express-session");
const bodyParser = require('body-parser');
const {
    access
} = require('fs');
const { createDeflate } = require('zlib');

require("dotenv").config();

var Players = require('./models/players');
var Games = require('./models/games');
var Cards = require('./models/cards');

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
 * get a specific user's game details
 */
app.get('/api/bingo/user/me/game/:gameid/card', function (req, res) {
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

    Games.getCardId(gameid, user.id)
        .then((result) => {
            return Cards.getById(result);
        })
        .then((card) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                status: true,
                msg: 'success',
                card: card
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

/**
 * update a users card
 */
app.post('/api/bingo/user/me/game/:gameid/card', function (req, res) {
    const cardData = req.body;

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

    Games.getCardId(gameid, user.id)
        .then((result) => {
            const card = {
                id : result,
                rows : cardData
            }

            return Cards.update(card);
        })
        .then((card) => {            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                status: true,
                msg: 'success',
                card: card
            }));        
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

const getPlayerAndCard = function( player ) {
    return new Promise((resolve, reject) => {
        const result = {};

        Players.getById(player.id)
        .then((playerData) => {
            result.name = playerData.name;
            result.id = playerData.id;

            return Cards.getById(player.card);
        })
        .then((card) => {
            result.rows = card;

            resolve(result);
        })
        .catch((err) => {
            reject(err);
        })
    })
}

/**
 * get a specific game's summary data
 */
app.get('/api/bingo/game/:id', function (req, res) {

    const id = req.params.id;
    const gameSummary = {};

    Games.getById(id)
    .then((result) => {
        gameSummary.id = result.id;
        gameSummary.name = result.name;

        // go get all the player and card data
        const players = result.players;
        const promises = [];

        for (let i=0; i<players.length; i++) {
            const player = players[i];

            promises.push(getPlayerAndCard(player));
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