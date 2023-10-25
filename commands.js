require('dotenv').config();
const { InstallGlobalCommands } = require('./utils.js');

// Commande de test
const TEST_COMMAND = {
    name: 'test',
    description: 'Commande basique',
    type: 1,
};

// Commandes de musique
const PLAY_COMMAND = {
    name: 'play',
    description: 'Joue une musique à partir d\'un lien YouTube',
    type: 1,
    options: [{
        name: 'lien',
        type: 3, // STRING
        description: 'Lien YouTube de la musique',
        required: true,
    }],
};

const SKIP_COMMAND = {
    name: 'skip',
    description: 'Passe à la chanson suivante',
    type: 1,
};

const STOP_COMMAND = {
    name: 'stop',
    description: 'Arrête la musique',
    type: 1,
};

// Commandes de modération
const BAN_COMMAND = {
    name: 'ban',
    description: 'Bannit un utilisateur du serveur',
    type: 1,
    options: [{
        name: 'utilisateur',
        type: 6, // USER
        description: 'Utilisateur à bannir',
        required: true,
    }],
};

const KICK_COMMAND = {
    name: 'kick',
    description: 'Expulse un utilisateur du serveur',
    type: 1,
    options: [{
        name: 'utilisateur',
        type: 6, // USER
        description: 'Utilisateur à expulser',
        required: true,
    }],
};

const WARN_COMMAND = {
    name: 'avertir',
    description: 'Envoie un avertissement à un utilisateur',
    type: 1,
    options: [{
        name: 'utilisateur',
        type: 6, // USER
        description: 'Utilisateur à avertir',
        required: true,
    }],
};

// Ajoutez d'autres commandes ici si nécessaire

const ALL_COMMANDS = [TEST_COMMAND, PLAY_COMMAND, SKIP_COMMAND, STOP_COMMAND, BAN_COMMAND, KICK_COMMAND, WARN_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
