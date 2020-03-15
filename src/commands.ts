import { Message, ReactionCollector, User, ReactionEmoji, MessageReaction, Client, TextChannel, GuildMember, DiscordAPIError } from "discord.js";
import { Data } from './Data';
import * as configz from './server_config.json';
import fs = require('fs');

export class Commands {
    whichCmd: string;
    message: Message;
    config: any;
    constructor(cmd : string, msg : Message){
        this.config = configz;
        this.whichCmd = cmd;
        this.message = msg;
        this.assigningCommand(msg);        

    }

    // Depending on the content of the command, execute the appropriate function
    assigningCommand(msg : Message){
        if(msg.content.startsWith('!marcel')){
            switch(msg.content.split(' ')[1]){
                case 'help' :
                    this.help();
                    break;
                case 'actu' :
                    this.getActu(msg);
                    break;
                case 'config_init' :
                    this.configBot(msg);
                    break;
                case 'crerVote' : 
                    this.crerVote();
                    break;
                case 'finirVote': 
                    this.finirVote();
                    break;
                default:
                    break;
            }
        }
    }

    // nom provisioire
    crerVote(){
        if (this.message.channel.type === 'dm') return;
        const channel : TextChannel = this.message.channel;
        channel.members.each(guildMember => {if(!guildMember.user.bot)guildMember.roles.add('688471685162074222');});
        this.message.react('✅');
        this.message.react('❌');
        const filter = (reaction:MessageReaction, user:User) => (reaction.emoji.name === '✅'|| reaction.emoji.name === '❌') && !user.bot;
        const collector = this.message.createReactionCollector(filter, {dispose: true});
        collector.on('remove', (r,user) => {
            this.message.guild?.member(user)?.roles.add('688471685162074222');
            this.message.guild?.member(user)?.roles.remove('688471714644230188');
        });
        collector.on('collect', (r,user) => {
            this.message.guild?.member(user)?.roles.add('688471714644230188');
            this.message.guild?.member(user)?.roles.remove('688471685162074222');
        });

    }

    finirVote(){
        if (this.message.channel.type === 'dm') return;
        const channel : TextChannel = this.message.channel;
        channel.members.each(guildMember => guildMember.roles.remove('688471685162074222'));
        channel.members.each(guildMember => guildMember.roles.remove('688471714644230188'));
    }

    // Send a message of the commands with a short explanation
    help(){
        let string = '';
        string += '**!marcel actu :** Donnes les 20 dernières actualités de la guilde. ( Réservé a la gestion. Elles sont également postés tout les jours a minuit )' + '\n\n';
        string += '**!marcel classes :** Donne le nombre total de chaque classe joué par les membres de la guilde. ( Réservé a la gestion. ) ' + '\n\n';
        string += '**!check pseudo_compte :** Donne un lien vers le profil Ankama ' + '\n\n';
        string += '**!catfact :** Donne un Aldafact aléatoire.' + '\n\n';
        string += '**!meme :** Donne un meme aléatoire.' + '\n\n';
        string += '**!pika :** Pika Pikachuuuuuu !!' + '\n\n';
        this.message.channel.send(string);
    }

    // Send a message returning the last news of the concerning guild
    getActu(message : Message){
        let data = new Data();
        if(this.message.guild !== null){
            data.getGuildData(this.config.configs[this.message.guild.id]['url_actu'])
            .then(d => {
                message.channel.send(d);
            })
            
        }
    }

    // Setting up the bot, including guild page url & the id of the management channel
    configBot(message : Message){
        if(message.guild !==null){
            this.config.configs[message.guild.id] = {};
            this.config.configs[message.guild.id]['url_actu'] = message.content.split(' ')[2];
            this.config.configs[message.guild.id]['url_membres'] = message.content.split(' ')[2] + '/membres';
            this.config.configs[message.guild.id]['gestion_channel'] = message.content.split(' ')[3];
            fs.writeFile('./dist/server_config.json', JSON.stringify(this.config) , err => {
                    if(err){
                            console.log('erreur fdp')
                    }
            });
        }

    }

};