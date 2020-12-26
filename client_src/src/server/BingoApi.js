import axios from 'axios';

import Session from './Session';

/**
 * Wrapper for back end server calls to Bingo functions
 */


/**
 * if REACT_APP_API_URL is set, we send back end requests to that, otherwise
 * we default to the same host that served up the client
 * useful for dev mode where the server might be hosted on a different url
 */
const baseUrl = function () {
    console.log("baseUrl: " + process.env.REACT_APP_API_URL);

    return (process.env.REACT_APP_API_URL) ? process.env.REACT_APP_API_URL : "";
}

const BingoApi = {

    getLoginUrl() {
        return baseUrl() + "/api/login";
    },

    isLoggedIn() {
        console.log('isLoggedIn returning: ' + (Session.getToken() !== undefined));
        return Session.getToken() !== undefined;
    },

    getUser() {
        const user = Session.getUser();

        console.log("returning user " + JSON.stringify(user));
        return user;
    },

    login(userid, password) {
        // new login, remove any existing token
        Session.reset();

        return new Promise((resolve, reject) => {
            axios.post('/api/login', {
                userid: userid,
                password: password
            }).then(res => {
                console.log('login: ', res);

                const result = res.data;
                if (result.status) {
                    const user = result.user;

                    const name = user.name;
                    const token = user.token;
                    const admin = (user.admin) ? true : false;
                    const ttl = user.ttl;
    
                    Session.create(name, userid, admin, token, ttl);
    
                    resolve(res.data);
                } else {
                    console.log('Error: ' + result.msg);
                    reject(result.msg);
                }

            }).catch((e) => {
                console.log("error: " + JSON.stringify(e.response));
                reject(e.response);
            })
        })
    },

    logout() {
        const self = this;

        return new Promise((resolve, reject) => {
            if (!self.isLoggedIn()) {
                const str = "Not logged in, log in first";
                console.log(str);
                reject(str);
                return;
            }

            axios
                .post('/api/logout')
                .then(res => {
                    console.log(res);
                    console.log(res.data);

                    Session.reset();

                    resolve('success');
                })
                .catch((e) => {
                    reject(e);
                })
        })
    },

    games() {
        return new Promise((resolve, reject) => {

            axios
                .get('/api/bingo/user/me/games')
                .then(res => {
                    console.log(res);
                    console.log(res.data);

                    const result = res.data;
                    if (result.status) {
                        resolve(result.games);
                    } else {
                        reject(result.msg);
                    }
                })
                .catch((e) => {
                    reject(e);
                })
        })
    },

    game(id) {
        return new Promise((resolve, reject) => {

            axios
                .get('/api/bingo/game/' + id)
                .then(res => {
                    console.log(res);
                    console.log(res.data);

                    const result = res.data;
                    if (result.status) {
                        resolve(result.game);
                    } else {
                        reject(result.msg);
                    }
                })
                .catch((e) => {
                    reject(e);
                })
        })
    },

    /**
     * Get summary information for a specific round in the game
     * 
     * @param {String} id 
     * @param {String} roundId 
     */
    round(id, roundId) {
        return new Promise((resolve, reject) => {

            axios
                .get('/api/bingo/game/' + id + '/round/' + roundId)
                .then(res => {
                    console.log(res);
                    console.log(res.data);

                    const result = res.data;
                    if (result.status) {
                        resolve(result.game);
                    } else {
                        reject(result.msg);
                    }
                })
                .catch((e) => {
                    reject(e);
                })
        })
    },

    cards(id) {
        return new Promise((resolve, reject) => {

            axios
                .get('/api/bingo/user/me/game/' + id + '/cards')
                .then(res => {
                    console.log(res);
                    console.log(res.data);

                    const result = res.data;
                    if (result.status) {
                        resolve(result.cards);
                    } else {
                        reject(result.msg);
                    }
                })
                .catch((e) => {
                    reject(e);
                })
        })
    },

    card(id, roundId) {
        return new Promise((resolve, reject) => {

            axios
                .get('/api/bingo/user/me/game/' + id + '/cards/round/' + roundId)
                .then(res => {
                    console.log(res);
                    console.log(res.data);

                    const result = res.data;
                    if (result.status) {
                        resolve(result.cards);
                    } else {
                        reject(result.msg);
                    }
                })
                .catch((e) => {
                    reject(e);
                })
        })
    },

    cardUpdate(id, card) {
        const cardid = card._id;

        return new Promise((resolve, reject) => {

            axios
                .post('/api/bingo/user/me/game/' + id + '/card/' + cardid, card)
                .then(res => {
                    console.log(res);
                    console.log(res.data);

                    const result = res.data;
                    if (result.status) {
                        resolve(result.card);
                    } else {
                        reject(result.msg);
                    }
                })
                .catch((e) => {
                    reject(e);
                })
        })
    },

};

export default BingoApi;