const CONFIG = require("../config/config");
const CONSTANTS = require("../config/constants");
const request = require("request");
require("dotenv").config();
const Eris = require("eris");
var MongoClient = require("mongodb").MongoClient;

async function verify(message, args) {
    var msg = message;
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Server is not configurated yet. Reach out to an administrator and tell them to configurate the server first.";
    MongoClient.connect(process.env.DBURL, async function(err, db) {
        if (err) {
            CONSTANTS.bot.createMessage(msg.channel.id, `Error with Database. Contact the bot developer ASAP.`);
            throw err;
        }
        var dbo = db.db("GalaxyRaiderDB");

        let entry = await dbo.collection("GalaxySuspensions").findOne({UID: msg.member.id, guildID: msg.guildID});
        if ((await entry) && (await entry).currentlySuspended) {
            try {
                msg.member.addRole(CONFIG.SystemConfig.servers[msg.guildID].suspendrole);
                return;
            }
            catch (e) {}
        }
        else {
            let dmChannel = await CONSTANTS.bot.getDMChannel(msg.author.id);
            let collector = new Eris.MessageCollector(dmChannel, {
                timeout: 300000,
                count: 1,
                filter: function(filterMsg) {
                    return filterMsg.author.id == msg.author.id;
                }
            })
            collector.run();

            CONSTANTS.bot.createMessage(dmChannel.id, {
                embed: {
                    author: {
                        name: `${msg.guild.name} Verification`,
                        icon_url: msg.guild.iconURL,
                    },
                    description: 
                    `**__Verification Requirements:__**
                    
                    `,
                    fields: [
                        {
                            name: "Stars Required:",
                            value: 
                            "```css\n" + CONFIG.SystemConfig.servers[msg.guildID].verification.minrank + "```",
                            inline: false,
                        },
                        {
                            name: "Hidden Location Required:",
                            value:
                            "```css\n" + CONFIG.SystemConfig.servers[msg.guildID].verification.hiddenloc + "```",
                            inline: false,
                        }
                    ],
                    color: 0x5b1c80,
                }
            });

            let threedigitcode = Math.floor(Math.random()*(900)+100);
            let threelettername = msg.guild.name.substring(0, 3);
            let code = `${threelettername}${threedigitcode}`;


            CONSTANTS.bot.createMessage(dmChannel.id, {
                embed: {
                    author: {
                        name: `${msg.guild.name} Verification`,
                        icon_url: msg.guild.iconURL,
                    },
                    description: 
`**How To Verify**
\`\`\`md
1. Make sure your realmeye matches the above verification requirements.
2. Put the code 

#       ${code}         #

in your realmeye description.
3. Type your ingame name here EXACTLY as it appears in-game (case-sensitive).
\`\`\``,
                    color: 0x5b1c80,
                }
            });

            collector.on("collect", async(dmmsg) => {
                let ign = dmmsg.content;
                CONSTANTS.bot.createMessage(dmChannel.id, {
                    embed: {
                        description: 
                        `Working...`,
                        color: 0x5b1c80,
                    }
                });
                request('https://nightfirec.at/realmeye-api/?player=' + ign + "&filter=desc1+desc2+desc3+player_last_seen+rank", {json: true}, (err, res, body) => {
                    if (err) {
                        CONSTANTS.bot.createMessage(dmChannel.id, `Something went wrong with that operation.`);
                        return console.log(err);
                    }

                    if (body.error) {
                        CONSTANTS.bot.createMessage(dmChannel.id, {
                            embed: {
                                title: "Failure",
                                description: 
                                `Name \`${ign}\` not found with Realmeye API.
                                
                                Please re-verify with a correct ingame name. 
                                
                                If this was the correct name, Realmeye cannot see you -- please head over to your server's Manual Verify section.`,
                                color: 0xff0000
                            }
                        });
                        return;
                    }
                    else if (CONFIG.SystemConfig.servers[msg.guildID].verification.hiddenloc && body.player_last_seen != "hidden") { // check if server config requires hidden loc
                        CONSTANTS.bot.createMessage(dmChannel.id, {
                            embed: {
                                title: "Failure",
                                description: 
                                `Last Location: \`${body.player_last_seen}\`
                                
                                Please set your Realmeye location to private and re-verify.`,
                                color: 0xff0000
                            }
                        });
                        return;
                    }
                    else if (body.rank < CONFIG.SystemConfig.servers[msg.guildID].verification.minrank) {
                        CONSTANTS.bot.createMessage(dmChannel.id, { // check if server config requires rank
                            embed: {
                                title: "Failure",
                                description: 
                                `Stars: \`${body.rank}\`
                                
                                Please make sure you meet the star requirements for this server.
                                
                                Star requirement: \`${CONFIG.SystemConfig.servers[msg.guildID].verification.minrank}\``,
                                color: 0xff0000
                            }
                        });
                        return;
                    }
                    else if (!(body.desc1.includes(code) || body.desc2.includes(code) || body.desc3.includes(code))) {
                        CONSTANTS.bot.createMessage(dmChannel.id, { 
                            embed: {
                                title: "Failure",
                                description: 
                                `Either you didn't put the correct code in your realmeye description, or you accidentally put the wrong in-game name.
                                
                                Please re-verify with the correct code and IGN.`,
                                color: 0xff0000
                            }
                        });
                        return;
                    }

                    try {
                        CONFIG.SystemConfig.servers[msg.guildID].nonstaff.memberaccess.forEach(id => {
                            msg.member.addRole(id);
                        })
                        msg.member.edit({
                            nick: ign
                        })
                        try {
                            CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[msg.guildID].logchannel, {
                                embed: {
                                    title: `Auto-Verification`,
                                    description: 
                                    `**User** ${msg.member.mention} just verified under the IGN \`${ign}\`
                                    **UID**: ${msg.member.id}`,
                                    color: 0x5b1c80,
                                    footer: {
                                        text: `${new Date().toUTCString()}`
                                    }
                                }
                            })
                        }
                        catch(e) {}
                    }
                    catch(e) {
                        CONSTANTS.bot.createMessage(dmChannel.id, { // check if server config requires rank
                            embed: {
                                title: "Partial Failure",
                                description: 
                                `I found you on Realmeye and you meet verification requirements, but you have a role in the server that makes it impossible for me to edit your nickname/roles!`,
                                color: 0xff0000
                            }
                        });
                        return;
                    }

                    CONSTANTS.bot.createMessage(dmChannel.id, {
                        embed: {
                            title: "Success!",
                            description:
                            `Successfully verified under the IGN \`[${ign}]\``,
                            color: 0x00ff00,
                        }
                    });
                })
            })
        }
        
    })
    
}

exports.verify = verify;

//${CONFIG.SystemConfig.servers[msg.guildID].verification.minrank}
//${CONFIG.SystemConfig.servers[msg.guildID].verification.hiddenloc}

// add to server config:
/**
verification: {
    minrank: #,
    hiddenloc: bool,
}
 */