const CONSTANTS = require("../../config/constants");
const CONFIG = require("../../config/config");
const RAIDCONSTANTS = require("../../raiding_functions/RAIDCONSTANTS");
const find = require('../../staff_commands/find');
require("dotenv").config();

const ReactionHandler = require('eris-reactions');
const isImageURL = require('valid-image-url');
const Eris = require("eris");

var MongoClient = require('mongodb').MongoClient;


exports.gamble = function(msg, args) {
    return minibossGamble(msg, args);
}

const gambletimeoutMS = 1800000;

async function minibossGamble(msg, args) {
    if (msg.guildID != CONSTANTS.STDGuildID) return;
    let gambleMessage = await CONSTANTS.bot.createMessage(msg.channel.id, {
        embed: {
            title: `Miniboss Gamble`,
            description:
            `${msg.member.mention} has initited a **Miniboss Gamble**
            
            **Instructions:**
            1. Pick a miniboss to bet on!
            2. The bot will DM you asking for a number of credits to gamble. Answer the bot in DM's!
            To check your current credits, type \`${CONSTANTS.botPrefix}credits\``,
            footer: {
                icon_url: `${msg.guild.iconURL}`,
                text: `${new Date().toUTCString()} | This gamble will end in 15 minutes.`
            },
            color: 0xff0066
        }
    });
    gambleMessage.addReaction(RAIDCONSTANTS.gemsbokReaction);
    gambleMessage.addReaction(RAIDCONSTANTS.beisaReaction);
    gambleMessage.addReaction(RAIDCONSTANTS.leucoryxReaction);
    gambleMessage.addReaction(RAIDCONSTANTS.dammahReaction);
    gambleMessage.addReaction(RAIDCONSTANTS.redXReaction);
    gambleMessage.addReaction(RAIDCONSTANTS.trashCan);

    let gambleEnded = false;

    let allReactedUsers = [];

    let gambleReactionListener = new ReactionHandler.continuousReactionStream(
        gambleMessage, 
        (userID) => (!userID.bot), 
        false, 
        { maxMatches: 200, time: gambletimeoutMS}
    );

    gambleReactionListener.on('reacted', async function(event) {
        if (allReactedUsers.includes(event.userID.id) && event.emoji.name != "redX" && event.emoji.name != RAIDCONSTANTS.pencil && event.emoji.name != RAIDCONSTANTS.trashCan) {
            gambleMessage.removeReaction(event.emoji.id?(event.emoji.name + `:` + event.emoji.id):event.emoji.name, event.userID.id);
        }
        else if (["Gemsbok", "Beisa", "Leucoryx", "Dammah"].includes(event.emoji.name)) {
            allReactedUsers.push(event.userID.id);
            minibossBet(event.emoji.name, event.userID.id, msg.guildID, gambleMessage, event, allReactedUsers);
        }
        else if (event.emoji.name == "redX" && event.userID.id == msg.author.id) {
            gambleMessage.edit({
                embed: {
                    title: `Miniboss Gamble`,
                    description:
                    `${msg.member.mention} is rolling this **Miniboss Gamble**
                    
                    **Good luck!**`,
                    footer: {
                        icon_url: `${msg.guild.iconURL}`,
                        text: `${new Date().toUTCString()}`
                    },
                    color: 0xff0066
                }
            })
            await gambleMessage.removeReactions();
            await gambleMessage.addReaction(RAIDCONSTANTS.pencil);
            await gambleMessage.addReaction(RAIDCONSTANTS.trashCan);
        }
        else if (event.emoji.name == RAIDCONSTANTS.pencil && event.userID.id == msg.author.id) {
            //deciding the bet now

            //get miniboss:
            let minibossCollector = new Eris.MessageCollector(gambleMessage.channel, {
                timeout: 60000,
                count: 1,
                filter: function(message) {
                    if (message.author.id != msg.author.id) return false;
                    else if (!(["Gemsbok", "Beisa", "Leucoryx", "Dammah"].includes(message.content))) {
                        gambleMessage.channel.createMessage(`Must be one of \`${["Gemsbok", "Beisa", "Leucoryx", "Dammah"].join(", ")}\``).catch(() => {});
                        return false;
                    }
                    else return (true);
                }
            })

            let whichMessage = await gambleMessage.channel.createMessage({
                embed: {
                    title: `Which Miniboss Won?`,
                    color: 0xff0066,
                }
            })

            minibossCollector.run(); 
            
            minibossCollector.on('collect', async (minibossMsg) => {
                gambleEnded = true;
                let winningMiniboss = minibossMsg.content;

                whichMessage.delete().catch(() => {});
                minibossMsg.delete().catch(() => {});

                endMinibossBet(gambleMessage.id, msg.guildID, winningMiniboss);
                gambleMessage.edit({
                    embed: {
                        title: `Miniboss Gamble`,
                        description:
                        `${msg.member.mention} has ended this **Miniboss Gamble**
                        
                        **The miniboss was: \`${winningMiniboss}\`!!!**`,
                        footer: {
                            icon_url: `${msg.guild.iconURL}`,
                            text: `${new Date().toUTCString()}`
                        },
                        color: 0xff0066
                    }
                })
                gambleMessage.removeReactions();
                gambleReactionListener.removeAllListeners('reacted');
            })

            setTimeout(() => {
                if (!gambleEnded) gambleMessage.channel.createMessage(`Miniboss selection timed out. Re-react with the ${RAIDCONSTANTS.pencil}`);
            }, 60000)
        }
        else if (event.emoji.name == RAIDCONSTANTS.trashCan && event.userID.id == msg.author.id) {
            undoGamble(false);
        }
    })

    setTimeout(() => {
        undoGamble(true);
    }, gambletimeoutMS)

    const undoGamble = function(timedOut) {
        if (!gambleEnded) {
            MongoClient.connect(process.env.DBURL,  {useUnifiedTopology: true, useNewUrlParser: true}, async function(err, db) {
                if (err) throw (err);
                var dbo = db.db("GalaxyRaiderDB");
                let betObjectArray = await dbo.collection("GalaxyGambling.ActiveGambles").find({msgID: gambleMessage.id, guildID: msg.guildID}).toArray();

                betObjectArray.forEach(async betObject => {
                    await dbo.collection("GalaxyGambling.UserData").updateOne({guildID: msg.guildID, userID: betObject.userID}, {$inc: {credits: betObject.bet}});
                })

                gambleMessage.edit({
                    embed: {
                        title: `Miniboss Gamble`,
                        description:
                        `This gamble has ${timedOut?"timed out. Start a new one!":"been forcibly terminated."} `,
                        footer: {
                            icon_url: `${msg.guild.iconURL}`,
                            text: `${new Date().toUTCString()}`
                        },
                        color: 0xff0066
                    }
                })

                gambleMessage.removeReactions();
                gambleReactionListener.removeAllListeners('reacted');
                await dbo.collection("GalaxyGambling.ActiveGambles").deleteMany({msgID: gambleMessage.id, guildID: msg.guildID});
                db.close();
            })
        }
    }
}

async function minibossBet(miniboss, userID, guildID, msg, event, reactedUsersArray) {
    MongoClient.connect(process.env.DBURL,  {useUnifiedTopology: true, useNewUrlParser: true}, async function(err, db) {
        if (err) throw (err);
        var dbo = db.db("GalaxyRaiderDB");
        let foundEntry = await dbo.collection("GalaxyGambling.UserData").findOne({guildID: guildID, userID: userID});
        if (!foundEntry) {
            foundEntry = {
                guildID: guildID, 
                userID: userID,
                credits: CONSTANTS.defaultCredits,
                ported: false,
                wins: 0,
                losses: 0,
                winstreak: 0
            }
            await dbo.collection("GalaxyGambling.UserData").insertOne(foundEntry);
        }
        let hasConfirmed = false;


        let dmChannel = await CONSTANTS.bot.getDMChannel(userID).catch(console.log);
        let dmCollector = new Eris.MessageCollector(dmChannel, {
            timeout: 60000,
            count: 1,
            filter: function(message) {
                if (message.author.bot) return false;
                else if (foundEntry.credits <= 0) {
                    dmChannel.createMessage(`You don't have enough credits to make a bet. Popping a key/vial/rune will get you more credits!`).catch(() => {});
                    return false;
                }
                let number = parseInt(message.content);
                if (isNaN(number) || number <= 0 || number > foundEntry.credits) {
                    dmChannel.createMessage(`Must be an integer less than or equal to \`${foundEntry.credits}\` and greater than \`0\``).catch(() => {});
                    return false;
                }
                else return (!message.author.bot);
            }
        })

        
        dmCollector.run();
        
        dmCollector.on('collect', async (dmMsg) => { 
            hasConfirmed = true;
            // say how much they're going to bet
            let bet = parseInt(dmMsg.content);

            //update user (decrement credits by bet)   
            dbo.collection("GalaxyGambling.UserData").updateOne({userID: userID, guildID: guildID}, {$inc: {credits: -(bet)}});

            //add user bet to the pool
            let betObject = {
                userID: userID,
                msgID: msg.id,
                guildID: guildID,
                miniboss: miniboss,
                bet: bet,
            }
            await dbo.collection("GalaxyGambling.ActiveGambles").insertOne(betObject);

            dmChannel.createMessage({
                embed: {
                    title: `Bet Placed`,
                    description: `Successfully placed \`${bet}\` credits on \`${event.emoji.name}\``,
                    color: 0xff0066
                }
            }).catch(() => {});

            db.close();
        })

        try {
            await dmChannel.createMessage({
                embed: {
                    title: `Miniboss Gamble`,
                    description: 
                    `Please enter the **number of credits you wish to bet on \`${event.emoji.name}\`**
                    Make sure this is a number. The bot will not respond to any other input.
                    
                    You have: ${foundEntry?foundEntry.credits:50} available credits.`,
                    color: 0xff0066
                }
            })

        }
        catch(e) {
            await msg.removeReaction(`${event.emoji.id?(event.emoji.name + `:` + event.emoji.id):event.emoji.name}`, userID);
            dmCollector.stop();
            dmCollector.removeAllListeners();
            db.close();
        }

        setTimeout(() => {
            if (!hasConfirmed) {
                dmChannel.createMessage(`Timed out!`).catch(() => {});
                db.close();
                msg.removeReaction(event.emoji.id?(event.emoji.name + `:` + event.emoji.id):event.emoji.name, userID).catch(() => {});
                reactedUsersArray.splice(reactedUsersArray.indexOf(event.userID.id), 1);
            }
        }, 60000)

    })
}

async function endMinibossBet(msgID, guildID, winningMiniboss) {
    MongoClient.connect(process.env.DBURL,  {useUnifiedTopology: true, useNewUrlParser: true}, async function(err, db) {
        if (err) throw (err);
        var dbo = db.db("GalaxyRaiderDB");
        let betObjectArray = await dbo.collection("GalaxyGambling.ActiveGambles").find({msgID: msgID, guildID: guildID}).toArray();

        let poolMinusWinnerContributions = 0;
        let winnerContributions = 0;
        let winnerArray = [];
        let nonWinnerArray = [];

        betObjectArray.forEach(betObject => {
            if (betObject.miniboss == winningMiniboss) {
                winnerArray.push(betObject);
                winnerContributions += betObject.bet;
            }
            else {
                nonWinnerArray.push(betObject);
                poolMinusWinnerContributions += betObject.bet;
            }
        })

        let odds = Math.floor(poolMinusWinnerContributions / winnerContributions);

        winnerArray.forEach(async betObject => {
            let winnings = betObject.bet + (betObject.bet * odds);
            await dbo.collection("GalaxyGambling.UserData").updateOne({guildID: guildID, userID: betObject.userID}, {$inc: {credits: winnings, winstreak: 1, wins: 1}});
        })

        nonWinnerArray.forEach(async betObject => {
            await dbo.collection("GalaxyGambling.UserData").updateOne({guildID: guildID, userID: betObject.userID}, {$set: {winstreak: 0}, $inc: {losses: 1}});
        })

        await dbo.collection("GalaxyGambling.ActiveGambles").deleteMany({msgID: msgID, guildID: guildID});
        db.close();
    })
}


exports.credits = function(msg, args) {
    if (msg.guildID != CONSTANTS.STDGuildID) return;
    MongoClient.connect(process.env.DBURL,  {useUnifiedTopology: true, useNewUrlParser: true}, async function(err, db) {
        if (err) throw (err);
        var dbo = db.db("GalaxyRaiderDB");
        let foundEntry = await dbo.collection("GalaxyGambling.UserData").findOne({userID: msg.author.id, guildID: msg.guildID});
        let object;
        if (!foundEntry) {
            object = {
                guildID: msg.guildID, 
                userID: msg.author.id,
                credits: CONSTANTS.defaultCredits,
                ported: false,
                wins: 0,
                losses: 0,
                winstreak: 0
            }
            await dbo.collection("GalaxyGambling.UserData").insertOne(object);

            msg.channel.createMessage({
                embed: {
                    title: `Casino Status`,
                    description:
                    `**Credits**: ${object.credits}
                    **Wins**: ${object.wins}
                    **Losses**: ${object.losses}
                    **Win Streak**: ${object.winstreak}
                    **Claim Streak**: 0`,
                    color: 3145463
                }
            })

            db.close();
        }
        else {
            object = foundEntry;
            msg.channel.createMessage({
                embed: {
                    title: `Casino Status`,
                    description:
                    `**Credits**: ${object.credits}
                    **Wins**: ${object.wins}
                    **Losses**: ${object.losses}
                    **Win Streak**: ${object.winstreak}
                    **Claim Streak**: ${object.hasOwnProperty('claimStreak') ? object.claimStreak : '0'}`,
                    color: 3145463
                }
            })

            db.close();
        }
    })
}

exports.claim = async function(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "You first have to configurate the server. Type \`.instructions\` for help.";
    if (msg.guildID != CONSTANTS.STDGuildID) return;
    
    try {
        MongoClient.connect(process.env.DBURL, {useUnifiedTopology: true, useNewUrlParser: true}, async function(err, db) {
            if (err) throw (err);
            var dbo = db.db("GalaxyRaiderDB");
            let foundEntry = await dbo.collection("GalaxyGambling.UserData").findOne({userID: msg.author.id, guildID: msg.guildID});
            let object;
            if (!foundEntry) {
                object = {
                    guildID: msg.guildID, 
                    userID: msg.author.id,
                    credits: CONSTANTS.defaultCredits + 10,
                    ported: false,
                    wins: 0,
                    losses: 0,
                    winstreak: 0,
                    lastClaim: new Date(),
                    claimStreak: 0,
                }

                await dbo.collection("GalaxyGambling.UserData").insertOne(object);

                msg.channel.createMessage({embed: {description: `Successfully claimed 10 (+0 from your streak) daily credits for ${msg.author.mention}`}});
            } else {
                if (foundEntry.hasOwnProperty('lastClaim')) {
                    let currDate = new Date();

                    if (foundEntry.lastClaim.getUTCDate() == currDate.getUTCDate() && foundEntry.lastClaim.getUTCMonth() == currDate.getUTCMonth() && foundEntry.lastClaim.getUTCFullYear() == currDate.getUTCFullYear()) {
                        msg.channel.createMessage({embed: {description: `You already claimed your credits for today`}});
                    } else {
                        let streak = 0;

                        if (foundEntry.hasOwnProperty('claimStreak')) {
                            streak = foundEntry.claimStreak;

                            // Check if the last claim was 'yesterday' to update the streak
                            let yesterday = new Date();
                            yesterday.setDate(yesterday.getDate() - 1);

                            if (foundEntry.lastClaim.getUTCDate() == yesterday.getUTCDate() && foundEntry.lastClaim.getUTCMonth() == yesterday.getUTCMonth() && foundEntry.lastClaim.getUTCFullYear() == yesterday.getUTCFullYear()) {
                                streak += 1;
                            } else {
                                streak = 0;
                            }
                        }
                        
                        // Add the streak to the base amount, up to +5 for 5 days
                        let toAdd = streak <= 5 ? 10 + streak : 15;

                        // this needs to be two seperate update calls because it didn't work in the one and i don't know why
                        await dbo.collection("GalaxyGambling.UserData").updateOne({userID: msg.author.id, guildID: msg.guildID}, {$inc: {credits: toAdd}});
                        await dbo.collection("GalaxyGambling.UserData").updateOne({userID: msg.author.id, guildID: msg.guildID}, {$set: {lastClaim: new Date(), claimStreak: streak}});

                        msg.channel.createMessage({embed: {description: `Successfully claimed ${toAdd} (+${toAdd - 10} from your streak) daily credits for ${msg.author.mention}`}});
                    }
                } else {
                    await dbo.collection("GalaxyGambling.UserData").updateOne({userID: msg.author.id, guildID: msg.guildID}, {$inc: {credits: 10}});
                    await dbo.collection("GalaxyGambling.UserData").updateOne({userID: msg.author.id, guildID: msg.guildID}, {$set: {lastClaim: new Date(), claimStreak: 0}});

                    msg.channel.createMessage({embed: {description: `Successfully claimed 10 (+0 from your streak) daily credits for ${msg.author.mention}`}});
                }
            }

            db.close();
        })
    } catch (err) {
        try {
            await msg.channel.createMessage('Failed to claim your daily credits.')
        } catch (err) {
            console.log("[ERROR] ERROR WITH CLAIM COMMAND")
        }
    }
}

exports.credits_port = function(msg, args) {
    if (msg.guildID != CONSTANTS.STDGuildID) return;
    MongoClient.connect(process.env.DBURL,  {useUnifiedTopology: true, useNewUrlParser: true}, async function(err, db) {
        if (err) throw (err);
        var dbo = db.db("GalaxyRaiderDB");
        let pointsEntry = await dbo.collection("GalaxyItemLogs").findOne({UID: msg.author.id, guildID: msg.guildID});
        if (!pointsEntry) {
            msg.channel.createMessage(`You don't have any points to port over.`);
            db.close();
            return;
        }
        let gamblingUserDataEntry = await dbo.collection("GalaxyGambling.UserData").findOne({userID: msg.author.id, guildID: msg.guildID});
        if (!gamblingUserDataEntry) {
            let object = {
                guildID: msg.guildID, 
                userID: msg.author.id,
                credits: CONSTANTS.defaultCredits + pointsEntry.points,
                ported: true,
                wins: 0,
                losses: 0,
                winstreak: 0
            }
            await dbo.collection("GalaxyGambling.UserData").insertOne(object);

            msg.channel.createMessage(`Successfully ported over points to credits.`);
            db.close();
        }
        else {
            if (gamblingUserDataEntry.ported) {
                msg.channel.createMessage(`Error: You've already ported your points over to credits!`);
                db.close();
            }
            else {
                await dbo.collection("GalaxyGambling.UserData").updateOne({userID: msg.author.id, guildID: msg.guildID}, {$set: {credits: pointsEntry.points, ported: true}});
                msg.channel.createMessage(`Successfully ported over points to credits.`);
                db.close();
            }
        }
    })
}

exports.give_credits = async function(msg, args) {
    if (msg.guildID != CONSTANTS.STDGuildID) return;
    if (!msg.member.roles.some(id => CONFIG.SystemConfig.servers[msg.guildID].modroles.includes(id))) return "Must have a moderator role in the bot.";

    let numCredits = parseInt(args.shift());
    if (isNaN(numCredits) || Math.abs(numCredits) > 1000) return "Please enter a valid integer number of credits between -1000 and 1000.";

    let found = await find.find(msg, args);
    if (!found) return;
    if (found.length != 1) {
        let allMemberMentionsString;
        for (const member of found) {
            if (!allMemberMentionsString) allMemberMentionsString = member.mention;
            else allMemberMentionsString += ", " + member.mention; 
        }
        return {
            embed: {
                title: "User Not Found, But Similar Members Include:",
                description: allMemberMentionsString,
            }
        }
    }
    const userID = found[0].id;

    MongoClient.connect(process.env.DBURL,  {useUnifiedTopology: true, useNewUrlParser: true}, async function(err, db) {
        if (err) throw (err);
        var dbo = db.db("GalaxyRaiderDB");
        let gamblingUserDataEntry = await dbo.collection("GalaxyGambling.UserData").findOne({userID: userID, guildID: msg.guildID});
        if (!gamblingUserDataEntry) {
            let object = {
                guildID: msg.guildID, 
                userID: userID,
                credits: CONSTANTS.defaultCredits + numCredits,
                ported: true,
                wins: 0,
                losses: 0,
                winstreak: 0
            }
            await dbo.collection("GalaxyGambling.UserData").insertOne(object);

            msg.channel.createMessage({embed: {description: `Successfully added ${numCredits} credits to ${found[0].mention}`}});
            db.close();
        }
        else {
            await dbo.collection("GalaxyGambling.UserData").updateOne({userID: userID, guildID: msg.guildID}, {$inc: {credits: numCredits}});
            msg.channel.createMessage({embed: {description: `Successfully added ${numCredits} credits to ${found[0].mention}`}});
            db.close();
        }
    })
}

exports.lbcredits = function(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "You first have to configurate the server. Type \`.instructions\` for help.";
    if (msg.guildID != CONSTANTS.STDGuildID) return;
    if (!msg.member.roles.some(id => CONFIG.SystemConfig.servers[msg.guildID].modroles.includes(id))) return "Must have a moderator role in the bot.";

    let type = "credits";
    MongoClient.connect(process.env.DBURL, {useUnifiedTopology: true, useNewUrlParser: true}, async function(err, db) {
        if (err) throw (err);
        var dbo = db.db("GalaxyRaiderDB");
        let array = await dbo.collection("GalaxyGambling.UserData").find({guildID: msg.guildID}).sort({[type]: -1}).toArray();
        array = array.slice(0, 10);
        
        CONSTANTS.bot.createMessage(msg.channel.id, {
            embed: {
                title: `Leaderboard`,
                description:
                `Top 10, organized by: \`${type}\`
                #1: ${array[0]?`<@${array[0].userID}> (\`${array[0][type]}\` ${type})`:"-"}
                #2: ${array[1]?`<@${array[1].userID}> (\`${array[1][type]}\` ${type})`:"-"}
                #3: ${array[2]?`<@${array[2].userID}> (\`${array[2][type]}\` ${type})`:"-"}
                #4: ${array[3]?`<@${array[3].userID}> (\`${array[3][type]}\` ${type})`:"-"}
                #5: ${array[4]?`<@${array[4].userID}> (\`${array[4][type]}\` ${type})`:"-"}
                #6: ${array[5]?`<@${array[5].userID}> (\`${array[5][type]}\` ${type})`:"-"}
                #7: ${array[6]?`<@${array[6].userID}> (\`${array[6][type]}\` ${type})`:"-"}
                #8: ${array[7]?`<@${array[7].userID}> (\`${array[7][type]}\` ${type})`:"-"}
                #9: ${array[8]?`<@${array[8].userID}> (\`${array[8][type]}\` ${type})`:"-"}
                #10: ${array[9]?`<@${array[9].userID}> (\`${array[9][type]}\` ${type})`:"-"}`,
                color: 3145463
            }
        })

        db.close();
    })
}


