const CONSTANTS = require('./config/constants');
const CONFIG = require('./config/config');


const accessRole = require('./config/accessRole');
const initialize = require("./config/initializeServerProperties");
const afk_check = require("./raiding_functions/afk");
const headcount = require("./raiding_functions/hc");
const makevc = require("./raiding_functions/makevc");
const showconfig = require("./config/showconfig");
const instructions = require("./config/instructions");
const find = require("./staff_commands/find");
const accessChannel = require('./config/accessChannel');
const say = require("./staff_commands/say");
const deleteGuildConfig = require("./config/deleteGuildConfig");
const suspend = require("./staff_commands/suspend");
const suspendlist = require("./staff_commands/suspendlist");
const log = require("./raiding_functions/logitem");
const changereqsheet = require("./raiding_functions/changereqsheet");
const lockunlock = require('./raiding_functions/lockunlock');
const getinfo = require("./staff_commands/getinfo");
const stats = require("./member_commands/stats");
const setpoints = require("./config/setpoints");
const leaderboard = require("./staff_commands/leaderboard");
const manualverify = require("./staff_commands/manualverify");
const manualverifyvet = require("./staff_commands/manualverifyvet");
const setrunpoints = require("./config/setrunpoints");
const logrun = require("./staff_commands/logrun");
const staffstats = require("./staff_commands/staffstats");
const quota = require("./raiding_functions/quota");
const verify = require("./member_commands/verify");
const setverification = require("./config/setverification");
const cmd = require("node-cmd");
const parse = require("./staff_commands/parse");
const registerpremiumguild = require("./config/registerpremiumguild");
const RAIDCONSTANTS = require("./raiding_functions/RAIDCONSTANTS");
const pingroles = require("./config/pingroles");
const keyroles = require("./config/registerkeypopperrole");
const postraidlogging = require("./config/postraidlogging");
const keyqueue = require("./config/keyqueue");


const helperOrStaffPermissions = function(msg) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) {
        CONSTANTS.bot.createMessage(msg.channel.id, "The bot has not been configurated in this server yet. Type .instructions to get started.")
        return false;
    }
    return (msg.member.roles.some((role, index) => CONFIG.SystemConfig.servers[msg.guildID].helperroles.includes(role) || CONFIG.SystemConfig.servers[msg.guildID].staffroles.includes(role)));
}
//Custom Server Command Requires



//STD
const STD_fuck = require("./custom_commands/STD/fuck");
const STD_promovote = require("./custom_commands/STD/promovote");
const STD_gamble = require("./custom_commands/STD/gamble");
const STD_editrole = require("./custom_commands/STD/addrole");

//USE
const USE_ban = require("./custom_commands/USE/ban");

require("events").EventEmitter.defaultMaxListeners = 200;

process.setMaxListeners(200);
CONSTANTS.bot.setMaxListeners(200);

const leaveguild = require("./config/leaveguild");
const { CommandClient } = require('eris');
const { constants } = require('buffer');

CONSTANTS.bot.registerCommand("ping", function(msg, args) {
    return {
        embed: {
            title: "Pong!",
            timestamp: new Date().toISOString(),
        }
    }
}, {
    aliases: ["pingy", "online"],
    argsRequired: false,
    description: `Ping Command. Checks if bot is online.`,
})

CONSTANTS.bot.registerCommand("uptime", function(msg, args) {
    let ms = CONSTANTS.bot.uptime;
    let seconds = (ms / 1000).toFixed(1);
    let minutes = (ms / (1000 * 60)).toFixed(1);
    let hours = (ms / (1000 * 60 * 60)).toFixed(1);
    let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
    let uptime;
    if (seconds < 60) uptime = seconds + " Sec";
    else if (minutes < 60) uptime = minutes + " Min";
    else if (hours < 24) uptime = hours + " Hrs";
    else uptime = days + " Days"
    return {
        embed: {
            title: "Uptime",
            description: `Bot has been live for: \`${uptime}\``,
            color: 0xff0066
        }
    }
})

CONSTANTS.bot.registerCommand("instructions", async function(message, args) {
    return `https://github.com/azolyomi/GalaxyRaider#setup-instructions`;
}, {
    aliases: ["setup", "howto"],
    argsRequired: false,
    description: `Detailed instructions for bot setup. [Your average help guide :)]`,
    requirements: {
        permissions: {
            "administrator": true,
        }
    }
})



CONSTANTS.bot.registerCommand("parse", parse.parseImageURL, {
    aliases: ["parseurl", "parseimage"],
    fullDescription: parse.helpCommand,
    requirements: {
        custom: helperOrStaffPermissions
    }
})

CONSTANTS.bot.registerCommand("registerpremiumguild", registerpremiumguild.registerPremiumGuildCommand, {
    requirements: {
        custom: CONSTANTS.permissionTheurulOnly
    },
    permissionMessage: "",
})

CONSTANTS.bot.registerCommand("unregisterpremiumguild", registerpremiumguild.unregisterPremiumGuildCommand, {
    requirements: {
        custom: CONSTANTS.permissionTheurulOnly
    },
    permissionMessage: "",
})

//SEPARATOR: <LEADING>

CONSTANTS.bot.registerCommand("makevc", makevc.execute, {
    aliases: ["mkvc", "makevoice", "makevoicechannel"],
    deleteCommand: true,
    argsRequired: true,
    description: `Make Voice Channel Command. Use this when you are chaining, and don't want to ping for a new AFK.`,
    fullDescription: makevc.COMMAND_MkVcFullDescription
})

CONSTANTS.bot.registerCommand("afk", afk_check.executeRegular, {
    aliases: ["afkcheck", "startafk"],
    deleteCommand: true,
    argsRequired: true,
    description: `AFK Check Command.`,
    fullDescription: afk_check.COMMAND_AFKCheckFullDescription,
})

CONSTANTS.bot.registerCommand("lock", lockunlock.lock, {
    aliases: ["lockvc"],
    caseInsensitive: true,
    argsRequired: false,
    description: `Lock VC Command.`,
    fullDescription: lockunlock.COMMAND_LockFullDescription,
})

CONSTANTS.bot.registerCommand("unlock", lockunlock.unlock, {
    aliases: ["unlockvc"],
    caseInsensitive: true,
    argsRequired: false,
    description: `Unlock VC Command.`,
    fullDescription: lockunlock.COMMAND_UnlockFullDescription,
})

CONSTANTS.bot.registerCommand("vetafk", afk_check.executeVeteran, {
    aliases: ["vafkcheck", "vafk"],
    deleteCommand: true,
    argsRequired: true,
    description: `AFK Check Command.`,
    fullDescription: afk_check.COMMAND_AFKCheckFullDescription,
    permissionMessage: "You need to have a \`Veteran Leader Role\` that is configured with the bot!"
})

CONSTANTS.bot.registerCommand("headcount", headcount.executeRegular, {
    aliases: ["hc"],
    deleteCommand: true,
    argsRequired: true,
    description: `Headcount Command.`,
    fullDescription: headcount.COMMAND_HeadcountFullDescription,
})

CONSTANTS.bot.registerCommand("vetheadcount", headcount.executeVeteran, {
    aliases: ["vhc", "vethc"],
    deleteCommand: true,
    argsRequired: true,
    fullDescription: headcount.COMMAND_BalerHeadcountFullDescription,
    permissionMessage: "You need to have a \`Veteran Leading Role\` configured with the bot!!"
})

//SEPARATOR: <CONFIG>

CONSTANTS.bot.registerCommand("config", initialize.execute, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: "Initial configuration of server."
})

CONSTANTS.bot.registerCommand("reconfig", initialize.reconfig, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: 
    `Reconfiguration of server, only use this for full bot reset.

    Note: DOING THIS WILL DELETE ALL PREVIOUS BOT-CREATED CHANNELS AND ALL ASSIGNED STAFF ROLES.
    To avoid deletion of desired staff roles, first unregister them with \`.removeAccessRole all <@roles>\``
})

const showconfigcommand = CONSTANTS.bot.registerCommand("showconfig", showconfig.showConfigDefault, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: "Print current configuration of server.",
})

showconfigcommand.registerSubcommand("staffroles", showconfig.showConfigStaffRoles, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: "Print current Staff roles configurated in bot server.",
    aliases: ["staff", "sr"],
})

showconfigcommand.registerSubcommand("modroles", showconfig.showConfigModRoles, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: "Print current Moderator roles configurated in bot server.",
    aliases: ["admin", "mod"],
})

showconfigcommand.registerSubcommand("helperroles", showconfig.showConfigHelperRoles, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: "Print current Helper roles configurated in bot server.",
    aliases: ["helper"],
})

showconfigcommand.registerSubcommand("securityroles", showconfig.showConfigSecurityRoles, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: "Print current Security roles configurated in bot server.",
    aliases: ["security"],
})

showconfigcommand.registerSubcommand("memberroles", showconfig.showConfigMemberRoles, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: "Print current Member roles configurated in bot server.",
    aliases: ["member"],
})

showconfigcommand.registerSubcommand("vetroles", showconfig.showConfigVetRoles, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: "Print current Veteran roles configurated in bot server.",
    aliases: ["vet"],
})

showconfigcommand.registerSubcommand("boosterroles", showconfig.showConfigBoosterRoles, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: "Print current Booster roles configurated in bot server.",
    aliases: ["booster"],
})

showconfigcommand.registerSubcommand("quotaenabledroles", showconfig.showConfigQuotaEnabledRoles, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: "Print current Quota-Enabled roles configurated in bot server.",
    aliases: ["quotaenabled"],
})

showconfigcommand.registerSubcommand("quotaoverrideroles", showconfig.showConfigQuotaOverrideRoles, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: "Print current Quota-Override roles configurated in bot server.",
    aliases: ["quotaoverride"],
})

showconfigcommand.registerSubcommand("afkaccess", showconfig.showConfigAFKAccess, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: "Print current AFK Access setup configurated in bot server.",
    aliases: ["aa", "afk", "leaders", "rl"],
})

showconfigcommand.registerSubcommand("channels", showconfig.showConfigChannels, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: "Print current Channels setup configurated in bot server.",
    aliases: ["c", "channel"],
})

showconfigcommand.registerSubcommand("points", showconfig.showConfigLogItemPointValues, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: "Print current Point Values configurated in bot server (for item logging purposes)",
    aliases: ["pts"],
})

showconfigcommand.registerSubcommand("runpoints", showconfig.showConfigRunPointValues, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: "Print current Run Point Values configurated in bot server (for run logging purposes)",
    aliases: ["runpts"],
})

showconfigcommand.registerSubcommand("streamingperms", showconfig.showConfigStreamingRoles, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: "List current Streaming Roles configurated in bot server.",
    aliases: ["stream", "streamingperms"],
})

showconfigcommand.registerSubcommand("pings", showconfig.showConfigPing, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: "List current Ping Role configuration in bot server.",
    aliases: ["ping", "pingroles"],
})

showconfigcommand.registerSubcommand("keyroles", showconfig.showConfigKeyRoles, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: "List current Auto-Key Popper Role configuration in bot server.",
    aliases: ["autokeyroles", "keypopperroles"],
})

CONSTANTS.bot.registerCommand("changereqsheet", changereqsheet.changereqsheet, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: changereqsheet.helpMessage,
    aliases: ["crs", "changereqs"],
    argsRequired: true
})

CONSTANTS.bot.registerCommand("setpoints", setpoints.setPoints, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: setpoints.helpMessage,
    aliases: ["setpts"],
    argsRequired: true
})

CONSTANTS.bot.registerCommand("setrunpoints", setrunpoints.setRunPoints, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: setrunpoints.helpMessage,
    aliases: ["setrunpts", "srp"],
    argsRequired: true
})

CONSTANTS.bot.registerCommand("setquotavalue", quota.setQuotaValue, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: quota.setQuotaHelpCommand,
    aliases: ["setquota"],
    argsRequired: true
})

CONSTANTS.bot.registerCommand("togglequota", quota.toggleQuota, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: `Toggles the quota to either \`enabled\` or \`disabled\`.`,
    aliases: ["quotatoggle"],
    argsRequired: false
})

CONSTANTS.bot.registerCommand("quotarole", quota.editQuotaRole, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: quota.editQuotaRoleHelpCommand,
    aliases: ["qr", "editquota"],
    argsRequired: true
})

CONSTANTS.bot.registerCommand("verify", verify.verify, {
    argsRequired: false,
    caseInsensitive: true,
    deleteCommand: true,
    permissionMessage: "",
    requirements: {
        custom: function(msg) {
            if (!CONFIG.SystemConfig.servers[msg.guildID]) return false;
            else if (!CONFIG.SystemConfig.servers[msg.guildID].verification.enabled) return false;
            else if (msg.member.roles.includes(CONFIG.SystemConfig.servers[msg.guildID].suspendrole)) return false;
            else return (
                    !(CONFIG.SystemConfig.servers[msg.guildID].nonstaff.memberaccess.every(id => 
                        (msg.member.roles.includes(id))))
                );
        }
    }
});

let verifycommand = CONSTANTS.bot.registerCommand("verification", setverification.verification, {
    caseInsensitive: true,
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    fullDescription:
    `Verification Config Command.
    
    Shows the current verification config.`
})

verifycommand.registerSubcommand("enable", setverification.enableVerification, {
    caseInsensitive: true,
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    fullDescription: 
    `Enable Verification Command
    
    Allows non-members to use the '.verify' command.`
});

verifycommand.registerSubcommand("disable", setverification.disableVerification, {
    caseInsensitive: true,
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    fullDescription: 
    `Disable Verification Command
    
    Disables non-members from using the '.verify' command.`
});

verifycommand.registerSubcommand("enableHiddenLoc", setverification.requirehiddenLoc, {
    caseInsensitive: true,
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    fullDescription: 
    `Enable Hidden Location for Verification Command
    
    Requires the verifier to have their realmeye location privated for run security.`
});

verifycommand.registerSubcommand("disableHiddenLoc", setverification.norequirehiddenLoc, {
    caseInsensitive: true,
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    fullDescription: 
    `Disable Hidden Location for Verification Command
    
    Disalbes requirement for the verifier to have their realmeye location privated for run security.`
});

verifycommand.registerSubcommand("requirement", setverification.setMinStars, {
    aliases: ["starRequirement", "ssr"],
    caseInsensitive: true,
    argsRequired: true,
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    fullDescription: 
    `Set Star Requirement for Verification Command
    
    Sets the star requirement for the verifier to an integer >= 0.
    
    **Usage*: \`${CONSTANTS.botPrefix}verification requirement <minStars>\`
    
    **<minStars>**: The minimum number of stars to accept for verification. Minimum 0. No max (Do not exceed current ROTMG White Star Requirement)
    
    _Example_: \`${CONSTANTS.botPrefix}verification requirement 40\` –> Sets the star verification requirement for the server to 40.`
});

CONSTANTS.bot.registerCommand("togglepostraidpanel", postraidlogging.togglePostRaidPanel, {
    aliases: ["toggleautolog"],
    caseInsensitive: true,
    argsRequired: false,
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    fullDescription: postraidlogging.helpMessage
})

// CONSTANTS.bot.registerCommand("removequotarole", quota.removeQuotaRole, {
//     requirements: {
//         permissions: {
//             "administrator": true,
//         }
//     }, 
//     caseInsensitive: true,
//     fullDescription: quota.removeQuotaRoleHelpCommand,
//     aliases: ["rqr"],
//     argsRequired: true
// })

CONSTANTS.bot.registerCommand("executeQuota", quota.executeQuotaFromDiscordCommand, {
    requirements: {
        custom: CONSTANTS.permissionTheurulOnly
    }, 
    caseInsensitive: true,
    //fullDescription: quota.removeQuotaRoleHelpCommand,
    aliases: ["doquota", "dq"]
})




//SEPARATOR: <ACCESS>

const accessRoleCommand = CONSTANTS.bot.registerCommand("accessRole", accessRole.accessStaff, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    aliases: ["roleAccess"],
    fullDescription: accessRole.accessHelp,
    argsRequired: true,
});

const removeAccessRoleCommand = CONSTANTS.bot.registerCommand("removeAccessRole", accessRole.removeAccessStaff, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    aliases: ["removeRoleAccess"],
    fullDescription: accessRole.removeAccessHelp,
    argsRequired: true,
});

accessRoleCommand.registerSubcommand("member", accessRole.accessMember, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    aliases: ["m"],
    fullDescription: accessRole.accessMemberHelp,
    argsRequired: true,
});

removeAccessRoleCommand.registerSubcommand("member", accessRole.removeAccessMember, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    aliases: ["m"],
    fullDescription: accessRole.removeAccessMemberHelp,
    argsRequired: true,
});

accessRoleCommand.registerSubcommand("vet", accessRole.accessVet, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    aliases: ["veteran", "v", "vet"],
    fullDescription: accessRole.accessVeteranHelp,
    argsRequired: true,
});

removeAccessRoleCommand.registerSubcommand("vet", accessRole.removeAccessVet, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    aliases: ["veteran", "v", "vet"],
    fullDescription: accessRole.removeAccessVeteranHelp,
    argsRequired: true
});

accessRoleCommand.registerSubcommand("booster", accessRole.accessBooster, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    aliases: ["b", "booster", "boost"],
    fullDescription: accessRole.accessBoosterHelp,
    argsRequired: true
});

removeAccessRoleCommand.registerSubcommand("booster", accessRole.removeAccessBooster, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    aliases: ["b", "booster", "boost"],
    fullDescription: accessRole.removeAccessBoosterHelp,
    argsRequired: true
});

CONSTANTS.bot.registerCommand("clearafkaccess", accessRole.clearAfkAccess, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    aliases: ["cafkaccess"],
    fullDescription: 
    `Used to clear access from either of \`main\` or \`veteran\` afk access roles.
    
    This should **__never__** happen, but if you need to clear a broken staff role that appears as "undefined" in your config, do this before running the \`.reconfig\` command.
    **Note: Reconfiguration will revert the server configuration (including staff access) and recreate all auto-generated channels/roles. Use this sparingly.**`
})

const clearaccessrolecommand = CONSTANTS.bot.registerCommand("clearaccessrole", function(msg, args) {
    return {
        embed: {
            title: `Clear Access Command`,
            description:
            `Used to clear access from **ALL** \`member, vet,\` or \`booster\` bot access roles.
            
            This should never happen, but if you're searching for a way to clear a broken staff role that appears as "undefined" in your config, either contact the developer (recommended) or run the \`.reconfig\` command.
            **Note: Reconfiguration will revert the server configuration (including staff access) and recreate all auto-generated channels/roles. Use this sparingly.**`,
            color: 3145463
        }
    }
}, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    aliases: ["clearaccess"],
    fullDescription: 
    `Used to clear access from either of \`[member, vet, booster]\` bot access roles.
    
    This should **__never__** happen, but if you need to clear a broken staff role that appears as "undefined" in your config, either contact the developer (recommended) or run the \`.reconfig\` command.
    **Note: Reconfiguration will revert the server configuration (including staff access) and recreate all auto-generated channels/roles. Use this sparingly.**`
})

clearaccessrolecommand.registerSubcommand("member", accessRole.clearAccessMember, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    fullDescription: accessRole.clearAccessMemberHelp,
    argsRequired: false
})

clearaccessrolecommand.registerSubcommand("vet", accessRole.clearAccessVet, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    fullDescription: accessRole.clearAccessVeteranHelp,
    argsRequired: false
})

clearaccessrolecommand.registerSubcommand("booster", accessRole.clearAccessBooster, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    fullDescription: accessRole.clearAccessBoosterHelp,
    argsRequired: false
})

const changeChannelCommand = CONSTANTS.bot.registerCommand("changeChannel", accessChannel.changeChannel, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    aliases: ["cc", "accessChannel"],
    fullDescription: accessChannel.helpMessage,
    argsRequired: true
})

CONSTANTS.bot.registerCommand("streamingperms", accessRole.streamingPerms, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    aliases: ["stream"],
    fullDescription: accessRole.streamingPermsHelpCommand,
    argsRequired: true
})

CONSTANTS.bot.registerCommand("highreqs", accessRole.highreqs, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    aliases: ["edithighreqs"],
    fullDescription: accessRole.highreqsHelpCommand,
    argsRequired: true
})

const pingrolecommand = CONSTANTS.bot.registerCommand("pingrole", function(msg, args) {
    return pingroles.helpCommand;
}, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    fullDescription: pingroles.helpCommand,
    argsRequired: false
});

pingrolecommand.registerSubcommand("add", pingroles.addPingRole, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    aliases: ["enable"],
    fullDescription: pingroles.helpCommand,
    argsRequired: true
})

pingrolecommand.registerSubcommand("remove", pingroles.deletePingRole, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    aliases: ["disable"],
    fullDescription: pingroles.helpCommand,
    argsRequired: true
})

CONSTANTS.bot.registerCommand("setuppingmessage", pingroles.setupPingMessage, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    fullDescription: pingroles.setupPingMessageHelpCommand,
    argsRequired: false
});

CONSTANTS.bot.registerCommand("keyrole", keyroles.registerKeyPopperRole, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    fullDescription: keyroles.helpCommand,
    argsRequired: true
})

CONSTANTS.bot.registerCommand("resetkeyroles", keyroles.resetKeyPopperRoles, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    fullDescription: keyroles.resetHelpCommand,
    argsRequired: false
})



CONSTANTS.bot.registerCommand('setSuspendRole', accessRole.setSuspendRole, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    aliases: ["setsuspend", "setsuspensionrole"],
    fullDescription: 
    `Set Suspend Role Command. 
    This role is used to interface with \`.suspend\` and \`.unsuspend\` commands.
    
    **Usage**: \`.setsuspendrole <@role>\`
    
    **<@role>**: A mention of the role to set as the Suspended role.`,
    argsRequired: true
})

CONSTANTS.bot.registerCommand('setLogChannel', accessChannel.setLogChannel, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    aliases: ["setlog", "setlogs"],
    fullDescription: 
    `Set Log Channel Command. 
    This channel is where all server-related bot logs are sent.
    
    **Usage**: \`.setlogchannel <#channel>\`
    
    **<#channel>**: A mention of the channel to set as the log channel. To mention a channel, type <#channelID>.`,
    argsRequired: true
})

//SEPARATOR: <RESET>

// CONSTANTS.bot.registerCommand("reset", async function(msg, args) {
//     let guildID = msg.guildID;
//     let channels = await CONSTANTS.bot.getRESTGuildChannels(guildID);

//     channels.forEach(function(channel, index) {
//         if (channel.id != 820808926471651348) {
//             CONSTANTS.bot.deleteChannel(channel.id);
//             setTimeout(() => {}, 50);
//         }
//     })

//     setTimeout(() => {
//         CONSTANTS.bot.createChannel(guildID, "test-commands");
//     }, 1000);

//     let roles = await(CONSTANTS.bot.getRESTGuildRoles(guildID));

//     roles.forEach(function(role, index) {
//         if (role.name.includes("Bot") || role.name.includes("Suspended")) CONSTANTS.bot.deleteRole(guildID, role.id);
//     })
// }, {
//     requirements: {
//         permissions: {
//             "administrator": true,
//         }
//     }
// })

CONSTANTS.bot.registerCommand("refresh", function(msg, args) {
    cmd.run('chmod 777 git.sh'); /* :/ Fix no perms after updating */
    cmd.get('./git.sh', (err, data) => {  // Run our script
        if (data) console.log(data);
        if (err) console.log(err);
    });
    cmd.run('refresh');  // Refresh project

    console.log("> [GIT] Updated with origin/master");
    return "> [GIT] Updated with origin/master";
}, {
    requirements: {
        custom: CONSTANTS.developerPermissions
    },
    hidden: true,
    argsRequired: false
})

//SEPARATOR: <MODERATION>

CONSTANTS.bot.registerCommand("find", find.execute, {
    aliases: ["finduser", "getuser", "fetchuser"],
    argsRequired: true,
    description: `Find Command. For more info, do ${CONSTANTS.botPrefix}help find`,
    fullDescription: find.COMMAND_FindFullDescription,
})


const saycommand = CONSTANTS.bot.registerCommand("say", (msg, args) => {
    if (args.length === 0) return "Specify a message";
    const text = args.join(" ");
    return text;
}, {
    description: "Make the bot say something!",
    fullDescription: "The bot will say whatever the user puts after the command label",
    usage: "<text>",
    deleteCommand: true,
    caseInsensitive: true,
    argsRequired: true,
    requirements: {
        custom: CONSTANTS.permissionModeratorOnly
    }
});

saycommand.registerSubcommand("-e", say.dashe, {
    caseInsensitive: true,
    deleteCommand: true,
    description: "Say some embedded text!",
    fullDescription: 
        `**Usage**: \`${CONSTANTS.botPrefix}say -e <message>\` OR \`${CONSTANTS.botPrefix}say -e ?flags\`.
        **Flags:** usage: \`-<flag>:"<parameter>"\`.
                **title**: specify the title of the embed message. \`-title:"..."\`
                **description**: specify the description of the embed message. \`-description:"..."\`
                **color**: specify the color of the embed message. Accepts hexcode value and some plaintext colors. \`-color:"0xABCDEF"\`
                **image**: provide an image for the embed. Needs to be valid url form. \`-image:...\` (NO QUOTATIONS)
            **You must specify at least a title or description flag.**
            _If you specify flags, you CANNOT specify a message body. If using flags, ONLY use flags._
        _Examples_: 
            \`${CONSTANTS.botPrefix}say -e Hey everybody!\` => _bot says the message "Hey everybody_"
            \`${CONSTANTS.botPrefix}say -e -title:"Weenis"\` => _bot sends an embed with the title "weenis"_.
            \`${CONSTANTS.botPrefix}say -e -title:"Weenis" -description:"I have a large one" -color:"magenta"\` => 
                _bot sends an embed with the title "weenis", description "I have a large one" and color "magenta"._`,
    argsRequired: true,
})

saycommand.registerSubcommand("-verifyembed", function(msg, args) {
    return {
        embed: {
            title: `Verification Instructions`,
            description:
            `Welcome to \`${msg.guild.name}\`! In order to access the server, you will have to first link your ROTMG and Discord accounts.

In order to be verified, you must meet the following requirements:
\`\`\`diff
+ Public RealmEye profile
+ Public RealmEye name history
+ Discord direct messages set so anyone can message you
+ Any other requirements that the bot DMs you.
\`\`\`
            
            Type \`${CONSTANTS.botPrefix}verify\` in a channel to get started.
            
            _Verification, if completed successfully, will assign you all member roles configured in the server. 
            If you don't receive a message from the bot after trying to verify, **you were probably suspended and tried to reverify!**_
            
            __**Have fun, and happy raiding!**__`,
            footer: {
                text: `Server Verification | Courtesy of d.gg/STD`,
                icon_url: msg.guild.iconURL
            },
            color: 0x5b1c80
        }
    }
}, {
    argsRequired: false
})

CONSTANTS.bot.registerCommand("suspend", suspend.suspend, {
    caseInsensitive: true,
    fullDescription: suspend.suspendHelp,
    aliases: ["s", "sus"],
    argsRequired: true
});
CONSTANTS.bot.registerCommand("unsuspend", suspend.unsuspend, {
    caseInsensitive: true,
    fullDescription: suspend.unsuspendHelp,
    aliases: ["us", "unsus"],
    argsRequired: true
});

CONSTANTS.bot.registerCommand("suspendlist", suspendlist.suspendList, {
    caseInsensitive: true,
    fullDescription: suspendlist.helpMessage,
    aliases: ["sl", "suspendl"],
    argsRequired: false
});

CONSTANTS.bot.registerCommand("log", log.logitem, {
    caseInsensitive: true,
    fullDescription: log.helpMessage,
    aliases: ["l", "logitem"],
    argsRequired: true,
    requirements: {
        custom: helperOrStaffPermissions
    }
});

CONSTANTS.bot.registerCommand("resetitems", log.resetitems, {
    caseInsensitive: true,
    fullDescription: log.resetItemsHelpCommand,
    aliases: ["resetmember"],
    argsRequired: true,
    requirements: {
        permissions: {
            "administrator": true
        }
    }
});

CONSTANTS.bot.registerCommand("logrun", logrun.logrun, {
    caseInsensitive: true,
    fullDescription: logrun.helpMessage,
    aliases: ["lr"],
    argsRequired: true
});

CONSTANTS.bot.registerCommand("resetruns", logrun.resetruns, {
    caseInsensitive: true,
    fullDescription: logrun.resetRunsHelpCommand,
    aliases: ["resetstaff"],
    argsRequired: true,
    requirements: {
        permissions: {
            "administrator": true
        }
    }
});


CONSTANTS.bot.registerCommand("staffstats", staffstats.fetchStaffStats, {
    caseInsensitive: true,
    fullDescription: "Fetch staff stats for either yourself or a mentioned user.",
    aliases: ["ss"],
    argsRequired: false
});


CONSTANTS.bot.registerCommand("getinfo", getinfo.getInfo, {
    caseInsensitive: true,
    fullDescription: getinfo.helpMessage,
    aliases: ["gi", "get"],
    argsRequired: true
})

CONSTANTS.bot.registerCommand("stats", stats.fetchStats, {
    caseInsensitive: true,
    fullDescription: stats.helpMessage,
    aliases: ["points", "mystats", "fetchstats"],
    argsRequired: false,
    requirements: {
        custom: function(msg) {
            if (!msg.guildID) return false;
            else if (!CONFIG.SystemConfig.servers[msg.guildID]) return false;
            else if (!(CONFIG.SystemConfig.servers[msg.guildID].nonstaff.memberaccess.some(id => msg.member.roles.includes(id)))) return false;
            else return true;
        }
    }
})

CONSTANTS.bot.registerCommand("leaderboard", leaderboard.leaderboard, {
    caseInsensitive: true,
    fullDescription: 
    `Leaderboard Command
    Used to get the top 10 people from the item log database, organized by type.
    
    **Usage**: \`.leaderboard <type>\`
    
    **<type>**: One of \`[keys, vials, runes]\`. Default organizes by points.
    
    **Example**: \`.leaderboard runes\` -> Prints out the top 10 users, in decreasing order of number of runes logged.`,
    aliases: ["lb", "top"],
    argsRequired: false
})

CONSTANTS.bot.registerCommand("staffleaderboard", leaderboard.staffleaderboard, {
    caseInsensitive: true,
    fullDescription: 
    `Staff Leaderboard Command
    Used to get the top 10 people from the staff log database, organized by type.
    
    **Usage**: \`.leaderboard <type>\`
    
    **<type>**: One of \`${["void", "cult", "shatters", "nest", "fungal", "oryx3", "misc", "currentCycle"].join(", ")}\`. Default organizes by all-time points.
    
    **Example**: \`.staffleaderboard cult\` -> Prints out the top 10 users, in decreasing order of number of cults logged.`,
    aliases: ["slb", "sttop"],
    argsRequired: false
})

CONSTANTS.bot.registerCommand("mv", manualverify.manualVerify, {
    caseInsensitive: true,
    fullDescription: manualverify.helpMessage,
    aliases: ["manualverify"],
    argsRequired: true
})

CONSTANTS.bot.registerCommand("vetverify", manualverifyvet.manualVerifyVet, {
    caseInsensitive: true,
    fullDescription: manualverifyvet.helpMessage,
    aliases: ["mvvet", "niceballs"],
    argsRequired: true
})

CONSTANTS.bot.registerCommand("confighelp", function(msg, args) {
    return {embed: {
        title: "Configuration Commands",
        description: 
        `**${CONSTANTS.botPrefix}config // ${CONSTANTS.botPrefix}reconfig** – Initial configuration / reconfiguration of server in database. Use reconfiguration carefully.
        
        __**Roles/Channels/Logging**__

        **${CONSTANTS.botPrefix}showconfig** – Show the current server configuration

        **${CONSTANTS.botPrefix}accessrole** – Add bot privileges to roles
        **${CONSTANTS.botPrefix}removeaccessrole** – Remove bot privileges from roles
        **${CONSTANTS.botPrefix}setsuspendrole** – Change the 'suspended' role for bot use
        **${CONSTANTS.botPrefix}pingrole** – Configure pingable roles.
        **${CONSTANTS.botPrefix}setuppingmessage** – Create and register a ping message.

        **${CONSTANTS.botPrefix}changechannel** – Change a default text channel 
        **${CONSTANTS.botPrefix}setlogchannel** – Change the log channel for bot use

        **${CONSTANTS.botPrefix}changereqsheet** – Change the default req sheet posted for a given AFK check
        **${CONSTANTS.botPrefix}setpoints** – Set the point values associated with logging keys/vials/runes
        **${CONSTANTS.botPrefix}setrunpoints** – Set the point values associated with logging runs
        **${CONSTANTS.botPrefix}resetruns** – Reset a user's run database entry (runs/points)
        **${CONSTANTS.botPrefix}resetruns** – Reset a member's item database entry. (keys/vials/runes/points)

        __**Verification**__:

        **${CONSTANTS.botPrefix}verification**: Prints out verification configuration and commands

        ${RAIDCONSTANTS.checkEmoji} __**Premium Commands**__:
        **${CONSTANTS.botPrefix}clearaccessrole** – Remove bot privileges from roles in bulk
        **${CONSTANTS.botPrefix}streamingperms** – Add/remove a role's permissions to stream in raid VCs
        **${CONSTANTS.botPrefix}highreqs** - Edit the highreqs capacities for a staff role.

        **${CONSTANTS.botPrefix}setquota** – Set the weekly quota value
        **${CONSTANTS.botPrefix}quotarole** – Edit quota roles
        **${CONSTANTS.botPrefix}enablequota** - Toggle the weekly quota on or off
        **${CONSTANTS.botPrefix}toggleautolog** – Toggle postraid logging on or off.

        **${CONSTANTS.botPrefix}keyrole** – Configure automatic key popper role addition
        **${CONSTANTS.botPrefix}resetkeyroles** – Reset key roles

        **${CONSTANTS.botPrefix}keyqueue** - Setup a key queue.
        
        Do ${CONSTANTS.botPrefix}help <command> for more information on that command`,
        color: 3145463,
    }
}}, {
    caseInsensitive: true,
    aliases: ["helpconfig"],
    argsRequired: false,
    requirements: {
        permissions: {
            "administrator": true,
        }
    }
})


// SEPARATOR: <CUSTOM>

const keyqueueCommand = CONSTANTS.bot.registerCommand("keyqueue", function(msg, args) {
    return `Type .help keyqueue for more information`;
}, {
    caseInsensitive: true,
    aliases: ["kq"],
    requirements: {
        permissions: {
            "administrator": true
        }
    },
    fullDescription: `
    **Key Queue Command**
    
    Used to configure the key queue.`

})

keyqueueCommand.registerSubcommand("toggle", keyqueue.toggleKeyQueue, {
    caseInsensitive: true,
    fullDescription: keyqueue.toggleKeyQueueHelpMessage,
    description: `Toggles the key queue on/off`
});

keyqueueCommand.registerSubcommand("toggleKeyPing", keyqueue.toggleKeyPing, {
    caseInsensitive: true,
    fullDescription: keyqueue.toggleKeyPingHelpMessage,
    description: `Toggles the key ping on/off`
});

keyqueueCommand.registerSubcommand("setPingChannel", keyqueue.setPingChannel, {
    caseInsensitive: true, 
    fullDescription: keyqueue.setPingChannelHelp,
    description: `Sets the channel to ping in when a key is added to the queue`
})

keyqueueCommand.registerSubcommand("setPingRole", keyqueue.setPingRole, {
    caseInsensitive: true, 
    fullDescription: keyqueue.setPingRoleHelp,
    description: `Sets the role to ping when a key is added to the queue`
})

keyqueueCommand.registerSubcommand("setup", keyqueue.setupKeyQueueMessage, {
    caseInsensitive: true, 
    fullDescription: keyqueue.setupKeyQueueMessageHelpMessage,
    description: `Sets up the key queue message (with reactions).`
});


// // // STD // // // 

CONSTANTS.bot.registerCommand("promovote", STD_promovote.execute, {
    caseInsensitive: true,
    aliases: ["pv", "promo"],
    argsRequired: true,
    fullDescription: STD_promovote.fulldesc,
    requirements: {
        custom: function(msg) {
            if (msg.guildID != CONSTANTS.STDGuildID) return false;
            else if (!CONFIG.SystemConfig.servers[msg.guildID]) return false;
            else return CONFIG.SystemConfig.servers[msg.guildID].modroles.some(modroleID => msg.member.roles.includes(modroleID));
        }
    }
})

CONSTANTS.bot.registerCommand("fuck", STD_fuck.execute);

const STDCreditsCommand = CONSTANTS.bot.registerCommand("credits", STD_gamble.credits, {
    caseInsensitive: true,
    fullDescription: "Print current credit count!",
    aliases: ["creds", "mycredits", "bank", "wallet"],
    argsRequired: false,
    requirements: {
        custom: function(msg) {
            if (!msg.guildID) return false;
            else if (!CONFIG.SystemConfig.servers[msg.guildID]) return false;
            else if (!(CONFIG.SystemConfig.servers[msg.guildID].nonstaff.memberaccess.some(id => msg.member.roles.includes(id)))) return false;
            else return true;
        }
    }
});

CONSTANTS.bot.registerCommand("claim", STD_gamble.claim, {
    caseInsensitive: true,
    fullDescription: "Claim your 10 daily credits!\nClaim every day to get a streak and earn an extra credit per day in your streak (max of 5 extra credits)",
    argsRequired: false,
    requirements: {
        custom: function(msg) {
            if (!msg.guildID) return false;
            else if (!CONFIG.SystemConfig.servers[msg.guildID]) return false;
            else if (!(CONFIG.SystemConfig.servers[msg.guildID].nonstaff.memberaccess.some(id => msg.member.roles.includes(id)))) return false;
            else return true;
        }
    }
});

STDCreditsCommand.registerSubcommand("port", STD_gamble.credits_port, {
    caseInsensitive: true,
    fullDescription: "Port points to credits.!",
    argsRequired: false,
    requirements: {
        custom: function(msg) {
            if (!msg.guildID) return false;
            else if (!CONFIG.SystemConfig.servers[msg.guildID]) return false;
            else if (!(CONFIG.SystemConfig.servers[msg.guildID].nonstaff.memberaccess.some(id => msg.member.roles.includes(id)))) return false;
            else return true;
        }
    }
})

CONSTANTS.bot.registerCommand("givecredits", STD_gamble.give_credits, {
    caseInsensitive: true,
    fullDescription: "Give credits to a user. Usage: \`.givecredits <#credits> <user>\`",
    aliases: ["gc"],
    argsRequired: true,
    requirements: {
        custom: function(msg) {
            if (msg.guildID != CONSTANTS.STDGuildID) return false;
            else if (!CONFIG.SystemConfig.servers[msg.guildID]) return false;
            else return CONFIG.SystemConfig.servers[msg.guildID].modroles.some(modroleID => msg.member.roles.includes(modroleID));
        }
    }
})

CONSTANTS.bot.registerCommand("lbcredits", STD_gamble.lbcredits, {
    caseInsensitive: true,
    aliases: ["lbcreds", "lbc", "leaderboardcredits"],
    fullDescription: "Fetch current credit leaderboard",
    argsRequired: false,
    requirements: {
        custom: function(msg) {
            if (msg.guildID != CONSTANTS.STDGuildID) return false;
            else if (!CONFIG.SystemConfig.servers[msg.guildID]) return false;
            else return CONFIG.SystemConfig.servers[msg.guildID].modroles.some(modroleID => msg.member.roles.includes(modroleID));
        }
    }
})



CONSTANTS.bot.registerCommand("gamble", STD_gamble.gamble, {
    caseInsensitive: true,
    fullDescription: "Create a miniboss gamble.",
    aliases: ["minibossgamble"],
    argsRequired: false,
    requirements: {
        custom: function(msg) {
            if (!msg.guildID) return false;
            else if (!CONFIG.SystemConfig.servers[msg.guildID]) return false;
            else if (!(CONFIG.SystemConfig.servers[msg.guildID].staffroles.some(id => msg.member.roles.includes(id)))) return false;
            else return true;
        }
    }
});

CONSTANTS.bot.registerCommand("addrole", STD_editrole.addrole, {
    caseInsensitive: true,
    fullDescription: STD_editrole.STDrolehelpmessage,
    aliases: ["ar"],
    argsRequired: false,
    requirements: {
        custom: function(msg) {
            if (!msg.guildID) return false;
            else if (!CONFIG.SystemConfig.servers[msg.guildID]) return false;
            else if (!(CONFIG.SystemConfig.servers[msg.guildID].modroles.some(id => msg.member.roles.includes(id)))) return false;
            else return true;
        }
    }
});

CONSTANTS.bot.registerCommand("removerole", STD_editrole.removerole, {
    caseInsensitive: true,
    fullDescription: STD_editrole.STDrolehelpmessage,
    aliases: ["rr"],
    argsRequired: false,
    requirements: {
        custom: function(msg) {
            if (!msg.guildID) return false;
            else if (!CONFIG.SystemConfig.servers[msg.guildID]) return false;
            else if (!(CONFIG.SystemConfig.servers[msg.guildID].modroles.some(id => msg.member.roles.includes(id)))) return false;
            else return true;
        }
    }
});

// // // USE // // //

CONSTANTS.bot.registerCommand("ban", USE_ban.execute);


//SEPARATOR: <HELP>



const helpCommand = CONSTANTS.bot.registerCommand("help", function(msg, args) {
    if (args.length > 0) {
        let result = "";
        let cur = CONSTANTS.bot.commands[CONSTANTS.bot.commandAliases[args[0]] || args[0]];
        if(!cur) {
            return "Help Command not found";
        }
        let {label} = cur;
        for(let i = 1; i < args.length; ++i) {
            cur = cur.subcommands[cur.subcommandAliases[args[i]] || args[i]];
            if(!cur) {
                return "Help Command not found";
            }
            label += ` ${cur.label}`;
        }
        result += `**${msg.prefix}${label}** ${cur.usage}\n${cur.fullDescription}`;
        if(cur.aliases.length > 0) {
            result += `\n\n**Aliases:** ${cur.aliases.join(", ")}`;
        }
        const subcommands = Object.keys(cur.subcommands);
        if(subcommands.length > 0) {
            result += "\n\n**Subcommands:**";
            for(const subLabel of subcommands) {
                if(cur.subcommands.hasOwnProperty(subLabel) && cur.subcommands[subLabel].permissionCheck(msg)) {
                    result += `\n  **${subLabel}** - ${cur.subcommands[subLabel].description}`;
                }
            }
        }
        return {
            embed: {
                description: `${result}`,
                color: 3145463
            }
        }
    }
    else return {
                embed: {
                    title: "Available Commands:",
                    description: 
                    `__**Setup Commands:**__ (Administrator Only)
                    **${CONSTANTS.botPrefix}instructions** – Detailed instructions for bot setup
                    **${CONSTANTS.botPrefix}confighelp** – Shows all config-related commands.

                    __**System Commands:**__
                    **${CONSTANTS.botPrefix}ping** – Check if the bot is online
                    **${CONSTANTS.botPrefix}say** – Make the bot speak
                    **${CONSTANTS.botPrefix}lb** – Get leaderboard
                    **${CONSTANTS.botPrefix}slb** – Get staff leaderboard
        
                    __**Moderation Commands:**__
                    **${CONSTANTS.botPrefix}find** – Find a user from name or ID
                    **${CONSTANTS.botPrefix}suspend** – Suspend a user
                    **${CONSTANTS.botPrefix}unsuspend** – Unsuspend a user
                    **${CONSTANTS.botPrefix}suspendlist** – Get a list of currently suspended users
                    **${CONSTANTS.botPrefix}mv** – Manually verify a user.
                    **${CONSTANTS.botPrefix}vetverify** – Verify a user as a veteran raider.
        
                    __**Raid Leader Commands:**__
                    **${CONSTANTS.botPrefix}hc** – Start a headcount
                    **${CONSTANTS.botPrefix}afk** – Start an AFK check
                    **${CONSTANTS.botPrefix}makevc** – Create a voice channel
                    **${CONSTANTS.botPrefix}log** – Log a key/vial/rune for a user
                    **${CONSTANTS.botPrefix}logrun** – Log a run for yourself
                    **${CONSTANTS.botPrefix}staffstats** – Print your stats (runs/points logged)
                    
                    **${CONSTANTS.botPrefix}vethc** – Start a **Veteran** headcount 
                    **${CONSTANTS.botPrefix}vetafk** – Start a **Veteran** AFK check

                    ${RAIDCONSTANTS.checkEmoji} __**Premium Commands:**__
                    **${CONSTANTS.botPrefix}parse** – Parse a /who for players not in your voice channel.
        
                    Do ${CONSTANTS.botPrefix}help <command> for more information on that command.
                    `,
                    color: 3145463
                }
        }    
}, {
    requirements: {
        custom: helperOrStaffPermissions
    }
})

CONSTANTS.bot.registerCommand("patreon", function(msg, args) {
    return {
        embed: {
            author: {
                name: `Robin Hood Patreon`,
                icon_url: `https://cdn.discordapp.com/attachments/826194483992461383/830649754814906378/patreon.jpeg`
            },
            description:
            `**Join the [Patreon](https://patreon.com/Theurul) today!**
            
            Developing and hosting any public bot takes both time and money to do well. That's why I rely on **your** support to keep this project up and running.

            **If you're interested in additional benefits for the bot in __your server__, supporting the Patreon has cool perks like:**
            > - _Access to the bot's **premium** ${RAIDCONSTANTS.checkEmoji} commands, like an official optical character recognition algorithm to parse screenshots of the in-game ROTMG /who command._
            > - _A custom "meme" command for your server, that can say/do whatever you'd like it to! (With certain TOS restrictions)_
            > - _A flex-able premium icon in the server configuration!_

            **If you're a part of the [Space Travel Dungeons](https://discord.gg/STD) community, supporting the Patreon has cool perks like:**
            > - _Access to early location in STD for runs!_
            > - _Ability to unmute in VC!_
            
            Help me keep the **Robin Hood** bot alive, and join the crew as a **Rogue Vigilante** supporter, a **Merry Man**, or **Robin Hood** himself!

            **[Click here to join the crew!](https://patreon.com/Theurul)**
            `,
            footer: {
                text: `See you there! | ${new Date().toDateString()}`,
                icon_url: msg.guild.iconURL
            },
            color: 0xff6f00
        }
    }
}, {
    requirements: {
        custom: function(msg) {
            return true;
        }
    },
    caseInsensitive: true,
    aliases: ["support", "donate", "info"]
})


CONSTANTS.bot.registerCommand("leaveguild", leaveguild.leaveGuild, {
    requirements: {
        custom: CONSTANTS.permissionTheurulOnly
    },
    argsRequired: true,
    hidden: true,
    permissionMessage: false,
})

CONSTANTS.bot.registerCommand("fetchguilds", function(msg, args) {
    let numGuilds = 0, numMembers = 0; 
    CONSTANTS.bot.guilds.forEach(guild => {
        numGuilds++; 
        numMembers += guild.memberCount;
    })
    msg.channel.createMessage({embed: {
        title: `Guilds as of ${new Date().toUTCString()}`,
        description: `Total Guilds: \`${numGuilds}\`. Total Members: \`${numMembers}\`.`,
        color: 3145463
    }});

    return {embed: {
        title: `Guilds as of ${new Date().toUTCString()}`,
        description: `${CONSTANTS.bot.guilds.map(guild => `[NAME: ${guild.name}, ID: ${guild.id}, #: ${guild.memberCount}]`).join("\n")}`,
        color: 3145463
    }}
}, {
    caseInsensitive: true,
    requirements: {
        custom: CONSTANTS.developerPermissions
    }
})

CONSTANTS.bot.registerCommand('checkduplicates', verify.check, {
    caseInsensitive: true,
    requirements: {
        custom: CONSTANTS.developerPermissions
    }
});

CONSTANTS.bot.registerCommand('fetchmembers', async function (msg, args) {
    msg.channel.createMessage(`Working...`);
    const currentGuild = CONSTANTS.bot.guilds.find(guild => guild.id === msg.guildID);
    if (!currentGuild || currentGuild === undefined) return `Sorry, guild not found.`;
    try {
        exports.guildCache[currentGuild.id] = await currentGuild.fetchMembers();
        return `Successfully cached members.`;
    }
    catch (e) {
        console.log("fetchmembers error: ", e);
        return `${e.name.substr(0, 100)}: ${e.message.substr(0, 1900)}`;
    }
}, {
    caseInsensitive: true,
    aliases: ['findfetch', 'findrestart', 'findbroke'],
    requirements: {
        custom: CONSTANTS.permissionModeratorOnly,
    }
})

exports.guildCache = {};

CONSTANTS.bot.on("error", console.log);
CONSTANTS.bot.on("disconnect", console.log);
CONSTANTS.bot.on("guildRoleDelete", function(guild, role) {
    if (role.id) CONFIG.deleteGuildRole(guild, role);
})
CONSTANTS.bot.on("channelDelete", function(channel) {
    if (channel.id) CONFIG.deleteChannel(channel);
})
// CONSTANTS.bot.on("guildDelete", function(guild) {
//     deleteGuildConfig.deleteGuildConfig(guild.id);
// })

CONSTANTS.bot.on("guildMemberAdd", function(guild, member) {
    suspend.rolePersist(guild, member);
})

CONSTANTS.bot.on("messageReactionAdd", function(message, emoji, reactor) {
    if (!message.guildID) return;
    else if (!reactor.guild) return;
    else if (reactor.bot) return;
    else if (!CONFIG.SystemConfig.servers[message.guildID]) return;
    else if (!CONFIG.SystemConfig.servers[message.guildID].pings.pingmessageid && !CONFIG.SystemConfig.servers[message.guildID].keyqueue.messageid) return;

    if (CONFIG.SystemConfig.servers[message.guildID].pings.pingmessageid && message.id == CONFIG.SystemConfig.servers[message.guildID].pings.pingmessageid) {
        pingroles.pingReacted(message, reactor, emoji, true);
        return;
    }

    if (CONFIG.SystemConfig.servers[message.guildID].keyqueue.enabled &&
        CONFIG.SystemConfig.servers[message.guildID].keyqueue.messageid && 
        CONFIG.SystemConfig.servers[message.guildID].keyqueue.channelid &&
        message.id == CONFIG.SystemConfig.servers[message.guildID].keyqueue.messageid &&
        message.channel.id == CONFIG.SystemConfig.servers[message.guildID].keyqueue.channelid) {
        keyqueue.keyqueueReacted(message, emoji, reactor);
        return;
    }
})

CONSTANTS.bot.on("messageReactionRemove", function(message, emoji, userid) {
    if (!message.guildID) return;
    else if (!CONFIG.SystemConfig.servers[message.guildID]) return;
    else if (!CONFIG.SystemConfig.servers[message.guildID].pings.pingmessageid) return;

    if (message.id == CONFIG.SystemConfig.servers[message.guildID].pings.pingmessageid) {
        pingroles.pingReacted(message, userid, emoji, false);
    }
})

CONSTANTS.bot.on("messageDelete", async function(message) {
    if (!CONFIG.SystemConfig.servers[message.guildID]) return;
    else if (!CONFIG.SystemConfig.servers[message.guildID].pings.pingmessageid) return;
    else if (!message.guildID) {
        message = await CONSTANTS.bot.getMessage(message.channel.id, message.id);
    }
    
    if (message.id == CONFIG.SystemConfig.servers[message.guildID].pings.pingmessageid) {
        pingroles.pingmessagedeleted(message);
    }
})

CONSTANTS.bot.on("guildMemberUpdate", async function(guild, member, oldMember) {
    if (guild.id != CONSTANTS.STDGuildID) return;
    if (oldMember.premiumSince == member.premiumSince) return;
    if (!oldMember.premiumSince) {
        try {
            return member.edit({
                nick: `${CONSTANTS.STDNitroPrefix}${oldMember.nick}`
            })
        }
        catch(e) {}
    }
    if (!member.premiumSince) {
        try {
            if (oldMember.nick.startsWith(CONSTANTS.STDNitroPrefix)) return member.edit({
                nick: `${oldMember.nick.substring(CONSTANTS.STDNitroPrefix.length)}`
            })
        }
        catch(e) {}
    }
})

CONSTANTS.bot.on("ready", () => {
    console.log(`> [READY] Discord Bot Ready > ${new Date().toUTCString()}`);
    console.log(`> [GUILDS as of ${new Date().toUTCString()}]: \n${CONSTANTS.bot.guilds.map(guild => `[NAME: ${guild.name}, ID: ${guild.id}, #: ${guild.memberCount}]`).join("\n")}`);
    console.error(`> [READY] Discord Bot Ready > ${new Date().toUTCString()}`)
    CONSTANTS.botID = CONSTANTS.bot.user.id;
    CONSTANTS.bot.editStatus("online", {
        name: ".patreon | .instructions"
    });
})

process.on('uncaughtException', (err) => {
    console.error('\n\n\n[UNCAUGHT EXCEPTION]\n\n\n', err)
    if (err.name == "MongoNetworkError") {
        CONSTANTS.bot.getDMChannel("235241036388106241").then(dmChannel => CONSTANTS.bot.createMessage(dmChannel.id, `\n\n\n[UNCAUGHT EXCEPTION PROCESS TERMINATED]\n\n\n` + err)).catch(() => {});
        CONSTANTS.bot.getDMChannel("211959423847890945").then(dmChannel => CONSTANTS.bot.createMessage(dmChannel.id, `\n\n\n[UNCAUGHT EXCEPTION PROCESS TERMINATED]\n\n\n` + err)).catch(() => {});
        CONSTANTS.bot.getDMChannel("184471481026084864").then(dmChannel => CONSTANTS.bot.createMessage(dmChannel.id, `\n\n\n[UNCAUGHT EXCEPTION PROCESS TERMINATED]\n\n\n` + err)).catch(() => {});
        CONSTANTS.bot.getDMChannel("942320785287184464").then(dmChannel => CONSTANTS.bot.createMessage(dmChannel.id, `\n\n\n[UNCAUGHT EXCEPTION PROCESS TERMINATED]\n\n\n` + err)).catch(() => {});
    }
})

process.on('exit', (code) => {
    console.log('[Process exit event with code:] ', code);
});













CONSTANTS.bot.connect();

setInterval(() => {
    CONSTANTS.bot.guilds.forEach(async guild => {
        exports.guildCache[guild.id] = await guild.fetchMembers()
    })
}, 1800000);



