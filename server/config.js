require("dotenv").config();

const Cloudant = require('@cloudant/cloudant');
const CloudantDB = require('./db/cloudantdb');
const FileDB = require('./db/filedb');

let cloudant = undefined;

const config = {
    cloudant : {
        me : process.env.CLOUDANT_USERNAME,
        password : process.env.CLOUDANT_PASSWORD,
        db : 'familybingo'
    },

    cloudantDB: function(modelName) {
        if (!cloudant) {
            cloudant = Cloudant({ account: this.cloudant.me, password: this.cloudant.password });
        }

        return new CloudantDB(cloudant, this.cloudant.db, modelName);   
    },

    file : {
        path : process.env.TEST_DATA_PATH
    },

    fileDB: function(modelName) {
        return new FileDB(this.file.path, modelName);   
    },

    isProduction : function() {
        return false;
    },

    models : {
        'player' : './models/players',
        'game' : './models/games',
        'card' : './models/cards',
        'topic' : './models/topics',
    }
}

const DBLoader = function (modelName, modelPath) {
    const db = (config.isProduction()) ? config.cloudantDB(modelName) : config.fileDB(modelName);
    const module = require(modelPath);
    return new module(db);
}

module.exports = {
    loadModel : function(modelName) {
        const modelPath = config.models[modelName];
        if (!modelPath) {
            throw 'Model ' + modelName + ' not found!';
        }

        return DBLoader(modelName, modelPath);
    }
}


