require('dotenv').config();
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const { Client, IntentsBitField, MessageEmbed } = require('discord.js');
const { createAudioPlayer, createAudioResource, joinVoiceChannel } = require('@discordjs/voice');
const fs = require('fs');



const client = new Discord.Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildVoiceStates,
    ]
});

const queue = new Map();

client.once('ready', () => {
    console.log('Bot connecté!');
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const args = interaction.options.data.map(opt => opt.value);
    const serverQueue = queue.get(interaction.guildId);

    if (interaction.commandName === 'play') {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) return interaction.reply('Vous devez être dans un canal vocal pour jouer de la musique.');
        
        if (!args[0]) {
            return interaction.reply('Veuillez fournir une URL valide.');
        }
        
        try {
            const songInfo = await ytdl.getInfo(args[0]);   
            const song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url,
            };

            if (!serverQueue) {
                const queueConstruct = {
                    textChannel: interaction.channel,
                    voiceChannel: voiceChannel,
                    connection: null,
                    songs: [],
                    volume: 100,
                    playing: true
                };
                queue.set(interaction.guildId, queueConstruct);
                queueConstruct.songs.push(song);

                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: voiceChannel.guild.id,
                    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                });
                queueConstruct.connection = connection;
                play(interaction.guild, queueConstruct.songs[0]);
                interaction.reply(`Joue maintenant : ${song.title}`);
            } else {
                serverQueue.songs.push(song);
                //console.log(serverQueue.songs)
                return interaction.reply(`${song.title} a été ajouté à la file d'attente!`);
                
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des informations de la vidéo :", error);
            return interaction.reply("Une erreur s'est produite lors de la récupération des informations de la vidéo. Veuillez réessayer avec une URL valide.");
        }
    }  else if (interaction.commandName === 'skip') {
        if (!interaction.member.voice.channel) return interaction.reply('Vous devez être dans un canal vocal pour sauter la musique.');
        if (!serverQueue || !serverQueue.songs.length) return interaction.reply('Il n\'y a pas de chanson à sauter.');
        if (serverQueue.player) {
            serverQueue.player.stop();
            interaction.reply("Je joue la piste suivante.");
            console.log('Je joue la piste suivante.');
        } else {
            return interaction.reply('Il n\'y a actuellement aucune musique en cours de lecture.');
        }
    }
    
    
    else if (interaction.commandName === 'stop') {
        if (!interaction.member.voice.channel) return interaction.reply('Vous devez être dans un canal vocal pour arrêter la musique.');
        serverQueue.songs = [];
        if (serverQueue.player) {
            serverQueue.player.stop();
            interaction.reply("j'ai arreté la musique.")
            console.log("J'ai arreté la musique")
        }
    }
     else if (interaction.commandName === 'ban') {
        const user = interaction.options.getUser('utilisateur');
        if (interaction.member.permissions.has('BAN_MEMBERS')) {
            interaction.guild.members.ban(user);
            interaction.reply(`${user.tag} a été banni.`);
        } else {
            interaction.reply('Vous n\'avez pas la permission de bannir des membres.');
        }
    } else if (interaction.commandName === 'kick') {
        const user = interaction.options.getUser('utilisateur');
        if (interaction.member.permissions.has('KICK_MEMBERS')) {
            interaction.guild.members.kick(user);
            interaction.reply(`${user.tag} a été expulsé.`);
        } else {
            interaction.reply('Vous n\'avez pas la permission d\'expulser des membres.');
        }
    } else if (interaction.commandName === 'avertir') {
        const user = interaction.options.getUser('utilisateur');
        const embed = new MessageEmbed()
            .setTitle('Avertissement')
            .setDescription(`Vous avez reçu un avertissement de la part de ${interaction.member.displayName}`)
            .setColor('#ff0000');
        user.send({ embeds: [embed] });
        interaction.reply(`${user.tag} a été averti.`);
    }
    // ... Ajoutez d'autres commandes ici
});


function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    const stream = ytdl(song.url, { filter: 'audioonly', quality: 'highestaudio', format: 'opus' });
    const resource = createAudioResource(stream);

    if (!serverQueue.player) {
        serverQueue.player = createAudioPlayer();
        serverQueue.player.on('stateChange', (oldState, newState) => {
            if (newState.status === 'idle' && oldState.status === 'playing') {
                serverQueue.songs.shift();
                play(guild, serverQueue.songs[0]);                    
            }
        });
        serverQueue.player.on('error', error => {
            console.error('Erreur avec le AudioPlayer:', error);
        });
    }

    serverQueue.player.play(resource);
    serverQueue.connection.subscribe(serverQueue.player);
  


}




client.login(process.env.DISCORD_TOKEN);
