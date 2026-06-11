export default {
    // Global Messages
    mess: {
        key: "Limit reached. Tell the owner.",
        owner: "Sorry, you don't have permission to run this command.",
        admin: "Sorry, this command is restricted to group admins.",
        botAdmin: "Sorry, Milky needs to be an admin to run this command.",
        onWa: "That number doesn't seem to be registered on WhatsApp.",
        group: "Sorry, this command can only be used in groups.",
        private: "Sorry, this command can only be used in private chats.",
        quoted: "Please reply to the target message.",
        limit: "Limit reached. Tell the owner.",
        fail: "An error occurred, process failed.",
        error: "An error occurred, please tell the owner.",
        done: "Command executed."
    },

    // System Messages
    system: {
        invalidUrl: "Invalid link!",
        onlySupport: "Only supports video/audio/image/text",
        invalidApikey: "Invalid Apikey!",
        userNotFound: "User not found in database!",
        ownerNotFound: "Owner not found in list!",
        groupNotRegistered: "This group is not registered. Use *.register* to register this group.",
        setupNotDone: "This group is registered, but the bot cannot be used yet because the group owner has not finished setup.",
        usagePublic: "*Successfully changed to public usage*",
        usageSelf: "*Successfully changed to private usage*",
        rpgDisabled: "❌ RPG Mode is currently disabled in this group.",
        wait: "Wait a minute...",
        levelUp: "Congratulations *${args[0]}*, you leveled up *${args[1]}* → *${args[2]}*!",
        achievement: "Congratulations @${args[0]}, you got an achievement: *${args[1]}*!",
        reincarnateMin: "Minimum level 10 to reincarnate.",
        usage: "Invalid parameters, run the command *${args[0]}help ${args[1]}* for help.",
        cmd: {
            maintenance: "This command is currently under maintenance.",
            disabled: "Command *${args[0]}* is currently disabled. Reason: ${args[1]}",
            banned: "You are prohibited from using *${args[0]}* for ${args[1]}. Reason: ${args[2]}",
            lowTrust: "Trust Factor is too low to run this command.",
            cooldown: "Wait! Please wait ${args[0]} seconds (>~< \")",
            noYen: "Insufficient Yen.",
            error: "An error occurred: ${args[0]}"
        }
    },

    // Group Action Messages
    groupActions: {
        revoke: "reset the group link!",
        subject: "changed the Group Subject to:\n*${args[0]}*",
        icon: "has changed the group icon.",
        description: "changed the group description.\n\n${args[0]}",
        editInfo: "has set that *${args[0] == 'on' ? 'only admins' : 'all participants'}* can edit group info.",
        closeGroup: "has *${args[0] == 'on' ? 'closed' : 'opened'}* the group!\nNow ${args[0] == 'on' ? 'only admins' : 'all participants'} can send messages.",
        promote: "has made @${args[0]} an admin.",
        demote: "has removed @${args[0]} from admin.",
        ephemeral: "changed the ephemeral message duration to *@${args[0]}*",
        ephemeralOff: "disabled ephemeral messages.",
        joinRequest: "@${args[0]} requested to join",
        whitelistJoin: "This group is new to me, registration is required.",
        welcome: "Welcome to ${args[0]}\n@",
        leave: "@\nLeaving From ${args[0]}",
        promoteAction: "@\nPromote From ${args[0]}\nBy @admin",
        demoteAction: "@\nDemote From ${args[0]}\nBy @admin"
    },

    // Plugins Messages
    plugins: {
        whitelist: {
            desc: "Activate the bot in a specific group.",
            success: "Group successfully registered.\n\n- *ID:* ${args[0]}\n- *Owner:* @${args[1]}",
            already: "This group is already registered.",
            notified: "Group *${args[0]}* has been registered, but Milky is not yet interactive. Run the *.setup* command to continue.",
            invalidSyntax: "Invalid parameters. Syntax mismatch.",
            failUrl: "Failed to fetch group info from URL. Ensure the link is valid.",
            invalidId: "Invalid Group ID.",
            removed: "Group removed from whitelist.",
            notifyOwner: "Hello @${args[0]}, your group *${args[1]}* has been registered by the Bot Owner.\n\nPlease finish the setup by typing *.setup* here."
        },
        add: {
            desc: "Add or invite members to the group.",
            usage: "Invalid parameters, run *.help add* for help.",
            success: "Successfully added @${args[0]} to the group.",
            blocked: "They blocked Milky, so I cannot add them.",
            alreadyIn: "They are already in this group.",
            full: "Group is full, so I cannot add them.",
            leftRecently: "@${args[0]} cannot be invited because they recently left the group.\nAn invitation has been sent via Private Chat.",
            inviteMsg: "@${args[0]}\n invited you to join this group.",
            privateSent: "@${args[0]} cannot be added due to their privacy settings.\nAn invitation has been sent via Private Chat.",
            failed: "Failed to add user.\nStatus : ${args[0]}",
            inviteFail: "Failed to send invitation."
        },
        setup: {
            desc: "Configure Milky for your group.",
            sessionActive: "You are in a setup session. Complete it or type *.cancel* to abort.",
            noGroups: "You don't have any registered groups or you are not an admin in them.",
            selectGroup: "Select the group you want to setup:",
            interactReady: "Milky is now ready for interaction.",
            adminChanged: "Admin has made changes to Milky for this group.",
            setupDone: "Setup complete. Milky is now active in your group.",
            saved: "Changes saved. If you want to configure your group again, run the *.setup* command.",
            canceled: "Changes canceled. If you want to configure your group again, run the *.setup* command.",
            rpgToggle: "RPG Mode ${args[0]} for that group.",
            secToggle: "Security Mode ${args[0]} for that group.",
            goalTitle: "*# Group Setup: ${args[0]}*\n\nWhat is your goal for adding Milky to your group?",
            goalSec: "I want to protect my group.",
            goalFun: "I want to have fun.",
            goalBoth: "I choose both.",
            secTitle: "# Setup Security Mode\n\nAdjust some features you want to customize, when finished, run the command *\".setup confirm\"*",
            antiLinkTitle: "Anti Link: ${args[0]}",
            antiLinkDesc: "Detects all links sent by members and deletes them.\n${args[1]}",
            antiKudetaTitle: "Anti Coup: ${args[0]}",
            antiKudetaDesc: "Prevents the group from being taken over by irresponsible new admins.\n${args[1]}",
            toggleOff: "Select to turn off this feature.",
            toggleOn: "Select to turn on this feature.",
            saveCheck: "Save changes?",
            manageTitle: "# Group Management\n\n- Selected Group: *${args[0]}*\nWhat do you want to adjust?",
            btnRpg: "Toggle RPG mode",
            btnSec: "Toggle Security mode",
            btnSecManage: "Security Features",
            btnSave: "Save Changes"
        },
        gt: {
            desc: "Guardian Tales card collection.",
            error: "An error occurred.",
            noYen: "Insufficient Yen, ${args[0]}¥ is required to do this.",
            win: "",
            winBulk: "# Multi-Pull GT\n> Spent: ${args[1]}¥\n> Value: ${args[2]}¥\n> Profit: ${args[3]}\n\n${args[0]}",
            invTitle: "*# ${args[0]}'s GT Inventory*\n> page ${args[1]}/${args[2]}",
            invTotal: "\nTotal: ${args[0]} cards\nPity: ${args[1]}/${args[2]}",
            sellSuccess: "${args[0]} sold #${args[1]} - ${args[2]} (${args[3]}★) and received ${args[4]}¥",
            sellSuccessBulk: "${args[0]} sold ${args[1]} cards and received ${args[2]}¥",
            pityTitle: "Your pity: ${args[0]}/${args[1]}",
            rateTitle: "*# GT Rate*\n- 3★: ${args[0]}%\n- 2★: ${args[1]}%\n- 1★: ${args[2]}%",
            evolveReq: "You need 3 identical cards to evolve this card.",
            evolveSuccess: "*# GT Card Evolve*\nYour card ${args[0]} (${args[1]}★) evolved into ${args[2]} (${args[3]}★).",
            evolveMin: "this card cannot be evolved.",
            invalidIdx: "Invalid parameter, that card is not in your inventory.",
            notFound: "Invalid parameter, that card does not exist.",
            commands: "Invalid parameter, run *.help gt* for help.",
            calculating: "calculating..."
        },
        group: {
            deleteDesc: "Delete a replied message.",
            demoteDesc: "Demote an admin to member.",
            hidetagDesc: "Tag everyone invisibly with a message.",
            kickDesc: "Remove someone from the group.",
            kickBot: "You want me to leave? Alright... Goodbye!",
            linkgroupDesc: "Get and send group link.",
            pinDesc: "Pin a replied message.",
            promoteDesc: "Promote a member to admin.",
            revokeDesc: "Reset group link.",
            revokeSuccess: "Group link has been reset.",
            setdescDesc: "Change group description.",
            setngcDesc: "Change group name.",
            setppgcDesc: "Set group profile picture with a replied photo.",
            setppgcReply: "Reply to a photo to be used as group profile picture.",
            tagallDesc: "Tag everyone one by one with a message.",
            tagallTitle: "*Tagall*\n\n*Message:* ${args[0]}\n\n",
            unpinDesc: "Unpin a pinned message.",
            unwarnDesc: "Remove member warnings.",
            unwarnSuccess: "Warnings removed.",
            unwarnEmpty: "That user has no warnings.",
            warnDesc: "Give warning to member, if warnings exceed 3, they will be kicked.",
            warnProgress: "Warning ${args[0]}/3, if warnings exceed 3, you will be removed from this group.",
            warnKick: "User has been kicked because they were warned more than 3 times."
        }
    },

    // Game Messages
    game: {
        wordle: {
            desc: "Wordle game, guess a 5-letter word.",
            how: "*# How to Play Wordle*\n\n> Start\n- You have 6 attempts to guess a 5-letter word, and you are given 5 minutes to guess.\n- Each time you guess a word, the boxes will light up with specific colors as hints.\n\n> Color Meaning\n- 🟩 Green means the letter is in the correct spot.\n- 🟨 Yellow means the letter is in the word but in the wrong spot.\n- ⬛ Black means the letter is not in the word.\n\n> Quick Example\n- Suppose the secret word is *SMILE*\n- And you guess *SMALL*\n- Result: 🟩🟩🟨⬛⬛\n- This means *S* and *M* are in the correct spot;\n- *I* is in the word but wrong spot; and \n- *A* and *L* are not in the word.",
            start: "Game *Wordle ${args[0]}* started! Check your private chat to play.",
            win: "You completed *Wordle ${args[0]}* in ${args[1]} tries within ${args[2]}. You earned ${args[3]}¥ and ${args[4]} exp.",
            winGc: "*${args[0]}* completed *Wordle ${args[1]}* in ${args[2]} tries within ${args[3]}. *${args[0]}* earned ${args[4]}¥ and ${args[5]} exp.",
            timeout: "Time's up! The correct word was: *${args[0]}*. You earned 0¥ and 0 exp.",
            timeoutGc: "*${args[0]}* ran out of time while playing *Wordle ${args[1]}*. *${args[0]}* earned 0¥ and 0 exp.",
            lose: "Out of tries. Word: *${args[0]}*. You earned 0¥ and 0 exp.",
            loseGc: "*${args[0]}* lost in *Wordle ${args[1]}*. *${args[0]}* earned 0¥ and 0 exp.",
            canceled: "Wordle session has been canceled.",
            wrongLength: "Your guess exceeds the required length.",
            notFound: "Word not found in dictionary.",
            groupOnly: "Game can only be started in a group.",
            alreadyPlaying: "You are already playing Wordle. Type *.cancel* to stop.",
            cooldown: "Wait ${args[0]} seconds before starting Wordle again.",
            stats: "*# Wordle Stats ${args[0]}*\n\n- Played: ${args[1]}x\n- Won: ${args[2]}x\n- Winrate: ${args[3]}%\n- Best Score: ${args[4]}\n- Earned: ${args[5]}¥, ${args[6]} exp",
            boardStatus: "*# Wordle ${args[0]}*\n\n- Tries: ${args[1]}/6\n- Time: ${args[2]}\n${args[3]}"
        },
        afk: {
            tag: "Don't tag them!\nThey are currently AFK ${args[0]}\nFor ${args[1]}",
            reason: "with reason ${args[0]}",
            noReason: "without reason",
            stop: "@${args[0]} stopped AFK${args[1]}\nFor ${args[2]}"
        }
    },

    // Tools & Responses
    tools: {
        play: {
            desc: "Search and play a song from YouTube.",
            invalid: "Invalid parameter. Please provide a valid YouTube title or link.",
            failedUrl: "Video not found",
            failedInfo: "Failed to fetch video info.",
            failedServer: "Interaction with the server failed, please report this to the owner.",
            btnDownload: "Download Link"
        },
        sticker: {
            desc: "Create a sticker from a replied or sent image.",
            invalid: "Invalid parameter. Send or reply to a media with caption *${args[0]}${args[1]}*",
            viewOnce: "This command cannot be run on view-once media.",
            failed: "Invalid media parameter.",
            packname: "Sticker by ${args[0]}\n\nCreated on: Milky Interactive\n+62 822-4836-8488\n",
            author: "———————————— •\nMilky Interactive by CrystalDev"
        },
        mdl: {
            desc: "Download media from certain platforms with MP3 or MP4 options. Supported platforms: YouTube, Facebook, Instagram, TikTok.",
            invalidUrl: "Invalid url parameter. Please provide a valid link.",
            notSupported: "Sorry, this platform is not supported.",
            title: "*# ${args[0]} Downloader*\n\nSelect the format you want to download:",
            failYt: "All YouTube servers failed.",
            failFb: "Failed to fetch Facebook data.",
            failFormat: "Format ${args[0]} is not available.",
            failIg: "Failed to find Instagram media.",
            failTiktok: "Media not found.",
            failTiktokDl: "Failed to get TikTok download link.",
            successYt: "Media downloaded successfully from YouTube!",
            successFb: "Media downloaded successfully from Facebook!",
            successIg: "Media downloaded successfully from Instagram!",
            successTiktok: "Media downloaded successfully from TikTok!",
            btnMp3: "Audio (MP3)",
            btnMp4: "Video (MP4)"
        },
        bypass: {
            desc: "Bypass certain URL/Link shorteners and give the results directly.",
            failedToken: "*# Milky Bypass\n\nError: FAILED_CLOUDFLARE_TOKEN\nPlease report this to the owner.",
            failedBypass: "*# Milky Bypass\n\nBypass failed, link might not be supported.",
            error: "*# Milky Bypass*\n\nAn error occurred while processing bypass.",
            title: "*# Milky${args[0]} Bypass*",
            btnDownload: "Download",
            btnCopy: "Copy",
            labels: {
                info: "> File Information:",
                from: "From:",
                size: "Size:",
                result: "Result:"
            }
        },
        cipher: {
            desc: "Encrypt UTF-8 text or decrypt text to UTF-8.",
            invalidMode: "Invalid mode. Use 'encode' or 'decode'.",
            invalidType: "Invalid type. Use 'base64', 'base32', 'hex', or 'binary'.",
            noText: "Please provide the text you want to process.",
            failDecode: "Failed to decrypt text. Ensure the input format is correct.",
            result: "*# Cipher Result (${args[0]} - ${args[1]})*\n\n${args[2]}"
        },
        lyrics: {
            desc: "Search for song lyrics.",
            usage: "Please provide the song title you want to search for.",
            notFound: "Lyrics not found.",
            error: "Failed to fetch lyrics, please try again later.",
            title: "*# Lyrics ${args[0]}*"
        }
    },

    // RPG Messages
    rpg: {
        ach: {
            desc: "View achievement list or set the displayed achievement.",
            title: "🏆 *Achievement List* 🏆",
            has: "_Already obtained_",
            notHas: "_Not yet obtained_",
            usage: "📌 *How to set display:* ${args[0]}${args[1]} <id>\nExample: ${args[0]}${args[1]} 1",
            nan: "❌ Achievement ID must be a number.",
            notFound: "❌ Achievement with ID ${args[0]} not found.",
            notEarned: "❌ You haven't earned the achievement *${args[0]}*.",
            success: "✅ Successfully set *${args[0]}* as the displayed achievement."
        },
        cheat: {
            desc: "Add a custom amount to a specified field.\nField: yen, xp, level, msg, cmd, warn, gacha, reinc, tf",
            invalidMode: "Invalid mode parameter.",
            invalidAmount: "Invalid amount parameter.",
            invalidAmountNeg: "Invalid amount parameter. You tried to use a negative number in set mode.",
            invalidField: "Invalid field parameter.",
            userNotFound: "User not found.",
            success: "*# Cheat Activated*\n\nSuccessfully ${args[0]} value *${args[1]}* to *${args[2]}* #${args[3]}${args[4]} ${args[5]}.",
            modes: {
                set: "setting",
                add: "adding"
            },
            labels: {
                to: "to",
                by: "by"
            },
            give: "*# Cheat Activated*\n\nCard ${args[0]} (${args[1]}★) successfully added to the inventory of ${args[2]} (#${args[3]})."
        },
        daily: {
            desc: "Claim daily reward.",
            alreadyClaimed: "You already claimed *${args[0]}* today. Come back tomorrow!",
            sessionActive: "You are already in a Daily Reward session. Type *.cancel* to cancel.",
            groupNotify: "*# Daily Reward*\n\nCheck your private chat to choose a reward.",
            chooseTitle: "*# Daily Reward*\n\nChoose a reward!",
            rewardSuccess: "*${args[0]}* claimed *${args[1]}* from Daily Reward.",
            rewardNotify: "*${args[0]}*, you claimed *${args[1]}* from Daily Reward.",
            canceled: "Daily Reward session canceled.",
            btnYen: "Yen (+2¥)",
            btnExp: "Exp (+1200 exp)",
            btnTf: "TF (+2.5%)"
        },
        evo: {
            desc: "Evolve race to the next level.",
            minLevel: "You need at least 2.5¥ and level 6 to evolve.",
            noAttempts: "You have run out of evolution attempts.",
            noPath: "Role ${args[0]} has no further evolution paths.",
            failed: "*Evolution Failed*\n\n${args[0]}",
            canceled: "Evolution session canceled.",
            success: "*${args[0]}* successfully evolved into *${args[1]}*.",
            failReward: "*${args[0]}* failed to evolve and received 1.5¥ back.",
            confirmTitle: "*# Race Evolution*\n\nYou are about to evolve. Doing this will reset your Level, if you fail, you will get 1.5¥ back.\n\n",
            confirmPaths: "- Available evolution paths:\n",
            confirmPathRow: "> *${args[0]}* (Tier ${args[1]}) - Chance: ${args[2]}%\n",
            confirmFailProb: "\nYou have a ${args[0]}% chance to fail the evolution.",
            footer: "Evolution attempts: ${args[0]}/5",
            btnConfirm: "Confirm",
            btnCancel: "Cancel"
        },
        leaderboard: {
            desc: "View the list of top users by Yen or Level.",
            invalid: "Invalid leaderboard type. Use *${args[0]} yen* or *level*.",
            title: "╭──❍「 *LEADERBOARD ${args[0]}* 」❍\n",
            row: "│• ${args[0]}. @${args[1]}\n│  ${args[2]} : ${args[3]}\n│\n",
            footer: "╰──────❍\n\n_Type *${args[0]}level* to view top level._"
        },
        pay: {
            desc: "Transfer your yen to another user with a 15.5% tax. Minimum transfer 1¥.",
            minAmount: "Minimum transfer amount is 1¥.",
            targetNotFound: "Destination user not found.",
            selfTransfer: "You cannot transfer to yourself.",
            insufficient: "You don't have enough yen for the transfer.",
            success: "You transferred *${args[0]}¥* to *${args[1]}* with a 15.5% tax.",
            notify: "You received *${args[0]}¥* from *${args[1]}*."
        },
        race: {
            desc: "Display list of races or evolution path for a specific race.",
            originTitle: "# *Origin Race*\n\n",
            originRow: "${args[0]}. *${args[1]}*: ${args[2]}%\n",
            originFooter: "\nView evolution path with command: ${args[0]} <role>",
            pathNotFound: "Invalid argument. *\"${args[0]}\"* not found.",
            pathTitle: "🛤️ *EVOLUTION PATH: ${args[0]}* 🛤️\n\n",
            pathOrigin: "🟢 *${args[0]}* (Origin)\n",
            pathRow: "${args[0]}╰── *${args[1]}* (T${args[2]})\n${args[0]}    Chance: ${args[3]}%\n",
            pathEmpty: "_No further evolution paths._"
        },
        rein: {
            desc: "Reincarnate into a new random role.",
            minLevel: "You need at least 3¥ and level 8 to reincarnate.",
            failed: "Reincarnation failed..?\n\n${args[0]}",
            canceled: "Reincarnation canceled.",
            success: "*${args[0]}* reincarnated and was reborn as *${args[1]}*.",
            confirmTitle: "*# Race Reincarnation*\n\nPerform reincarnation? This will reset your Level.",
            confirmFooter: "Select an option below to continue.",
            btnConfirm: "Confirm",
            btnCancel: "Cancel"
        },
        status: {
            desc: "View your identity card.",
            profileTitle: "🎮 *RPG Profile* 🎮",
            profileBody: "👤 Name: ${args[0]}\n🧬 Role: ${args[1]}\n🆔 ID: ${args[2]}\n⭐ Level: ${args[3]}\n📊 Exp: ${args[4]}/${args[5]}\n💰 Yen: ${args[6]}¥\n🛡️ Trust: ${args[7]}%\n💬 Messages: ${args[8]}\n⚙️ Command: ${args[9]}\n⚠️ Warns: ${args[10]}\n🎲 Gacha: ${args[11]}\n✨ Reinc: ${args[12]}\n🏆 Achieve: ${args[13]}${args[14]}${args[15]}"
        },
        whois: {
            desc: "View another user's identity card.",
            notRegistered: "❌ The user you ${args[0]} is not yet registered in the RPG database.",
            notFound: "❌ User with ID/vanity \"${args[0]}\" not found.",
            usage: "📌 *How to use:* ${args[0]}whois <id/vanity/reply/tag>\nExample:\n${args[0]}whois 2\n${args[0]}whois crystal\nOr reply/tag a user's message.",
            profileTitle: "🔍 *Profile ${args[0]}* 🔍"
        }
    },

    // Owner Messages
    owner: {
        addplugin: {
            desc: "Add a plugin from a replied message.",
            usage: "Syntax: .addplugin <path> [--force]\n(run command while reply a code.)",
            invalidPath: "Invalid path parameter.",
            noCode: "Run the command while replying to code, or use --force to create an empty file.",
            exists: "Plugin ${args[0]} already exists. Use --force to overwrite.",
            success: "Plugin ${args[0]} successfully ${args[1]}.",
            failed: "Failed to write file: ${args[0]}"
        },
        cmd: {
            desc: "Manage a command.",
            noLoader: "Plugin loader is not ready.",
            notFound: "Command \"${args[0]}\" not found.",
            usageBan: "Syntax: .cmd ban <command> <target> <duration> <reason>",
            targetNotFound: "Target not found.",
            invalidDuration: "Invalid duration parameter.",
            banSuccess: "User *${args[0]}* is prohibited from using command *${args[1]}* for *${args[2]}* with reason: ${args[3]}.",
            usageUnban: "Syntax: .cmd unban <command> <target>",
            unbanSuccess: "User access to use command *${args[0]}* has been reactivated.",
            notBanned: "This user is not prohibited.",
            usageMaint: "Syntax: .cmd maintenance <command> <on/off> <reason>",
            maintOn: "Command ${args[0]} entered maintenance mode.",
            maintOff: "Command ${args[0]} has been activated for everyone.",
            manageSuccess: "Command *${args[0]}* configured:\n- Cooldown ${args[1]} seconds\n- Yen required: ${args[2]}¥\n- TF required: ${args[3]}%",
            disableSuccess: "Command *${args[0]}* disabled temporarily with reason: ${args[1]}.",
            enableSuccess: "Command *${args[0]}* reactivated.",
            listTitle: "*# CMD Settings*\n${args[0]}"
        },
        delplugin: {
            desc: "Delete a plugin from the target path.",
            invalidPath: "Invalid path.",
            notFound: "File not found.",
            success: "Plugin ${args[0]} deleted.",
            failed: "Failed: ${args[0]}"
        },
        getplugin: {
            desc: "Copy and paste a plugin from the target path",
            notFound: "Plugin not found."
        }
    },

    // Misc Messages
    misc: {
        cancel: {
            desc: "Cancel the active session.",
            success: "Session canceled.",
            noSession: "You don't have any active session."
        },
        help: {
            desc: "Provide command details and a command list.",
            title: "*# ${args[0]}*",
            usage: "\nUse *${args[0]}help <command>* for command details.",
            catNotFound: "Category \"${args[0]}\" not found or empty.",
            detailTitle: "*# Command Help*",
            noDesc: "No description available.",
            categories: {
                group: "- Group",
                user: "- User",
                economy: "- Economy",
                minigame: "- Games",
                gacha: "- Gacha",
                owner: "- Owner",
                misc: "- Misc",
                tools: "- Tools",
                ai: "- AI",
                search: "- Search",
                download: "- Download",
                stalker: "- Stalker",
                anime: "- Anime"
            },
            labels: {
                command: "Command",
                usage: "How to use",
                subcommand: "Subcommand",
                cooldown: "Cooldown",
                trust: "Trust Factor",
                cost: "Yen Cost",
                disabled: "This command is currently disabled.",
                maintenance: "This command is under maintenance.",
                seconds: "seconds",
                allCommands: "Command List",
                categoryMenu: "${args[0]} Menu"
            }
        },
        ping: {
            desc: "Milky response test.",
            infoTitle: "- Milky Information:\n",
            runtime: "> Runtime : ${args[0]}\n",
            latency: "> Latency : ${args[0]} ms\n",
            time: "> Time : ${args[0]}\n\n",
            memoryTitle: "- Memory\n",
            rss: "> RSS : ${args[0]} MB\n",
            heap: "> Heap : ${args[0]} / ${args[1]} MB\n\n",
            systemTitle: "- System\n",
            cpu: "> CPU : ${args[0]} (${args[1]} cores)\n",
            platform: "> Platform : ${args[0]}\n",
            node: "> Node : ${args[0]}"
        },
        report: {
            desc: "Report a bug from the bot or another user who broke the rules to the owner.",
            activeSession: "You still have an unfinished report session.",
            chooseTitle: "*# Milky Report*\n\nWhat do you want to report?",
            chooseFooter: "Select an option below to continue.",
            btnBug: "Report Bug",
            btnUser: "Report User",
            btnCancel: "Cancel",
            cancel: "Report session has been canceled.",
            bugDesc: "*# Report Bug*\n\nExplain what happened and what problem you experienced.",
            userDesc: "Who do you want to report? Send the user's ID number.",
            tooShort: "Your description is too short to be reported to the owner!",
            noOwner: "Owner is not set.",
            success: "Report sent successfully, if your report is confirmed, you will get a reward, thank you!",
            userIdInvalid: "Invalid parameter. Incorrect ID number.",
            userNotFound: "Invalid parameter. User with ID number ${args[0]} not found.",
            userReason: "*# Report User*\n\nYou will report:\n- ID: #${args[0]}\n- Username: ${args[1]}\n- Vanity: ${args[2]}\n- Bio: ${args[3]}\n\nGive a clear reason why you are reporting this user.",
            ownerReviewConfirm: "Please provide feedback for the reporter:",
            ownerReviewReject: "Please provide a reason for rejection for the reporter:",
            ownerRewardSyntax: "Feedback recorded successfully, give them a reward.\nSyntax: yen|exp|tf",
            ownerRejectSuccess: "This report was successfully rejected and the message was sent.",
            ownerInvalidSyntax: "Syntax: yen|exp|tf",
            ownerAcceptSuccess: "Report successfully confirmed and reward sent.",
            notifyReject: "*# Report Notification*\n\nYour report was *rejected* by the owner.\n> Message: ${args[0]}",
            notifyAccept: "*# Report Notification*\n\nYour report was *accepted* by the owner.\n> Message: ${args[0]}${args[1]}",
            labels: {
                headerBug: "*# Bug Report*",
                headerUser: "*# User Report*",
                footerReview: "Milky Review System",
                btnConfirm: "Confirm Report",
                btnReject: "Reject Report"
            }
        },
        meow: {
            desc: "Milky response test.",
            fail: "Failed to render dummy achievement."
        }
    },

    // User Messages
    user: {
        setav: {
            desc: "Set user profile picture. Reply to an image then type \".setav\" and send, or send an image with caption \".setav\".",
            success: "Your avatar was successfully changed.",
            failed: "Avatar parameter failed. Make sure the image format is supported and the size is not too large."
        },
        setb: {
            desc: "Set profile bio.",
            invalid: "Invalid parameter, bio has symbols that are not allowed. And bio must be at least 3 to 32 characters.",
            success: "Your bio was successfully changed."
        },
        setbg: {
            desc: "Set profile cover photo. Reply to an image then type \".setbg\" and send, or send an image with caption \".setbg\".",
            success: "Your background was successfully changed.",
            failed: "Invalid background parameter. Make sure the image format is supported and the size is not too large."
        },
        setf: {
            desc: "Set profile flag with flag ID. If you are confused with the flag ID, you can Google with the keyword \"flag ID <country>\", flag ID is usually 2 letters or 2 letters but separated like this (id-id).",
            success: "Your flag was successfully changed to *${args[0]}*."
        },
        setn: {
            desc: "Set username.",
            invalid: "Invalid parameter, name has symbols that are not allowed. And name must be at least 3 to 16 characters.",
            success: "Your name was successfully changed."
        },
        setv: {
            desc: "Set user vanity tag.",
            invalid: "Invalid parameter, vanity has symbols that are not allowed. And vanity must be at least 3 to 12 characters.",
            used: "Vanity *@${args[0]}* is unavailable or already in use.",
            success: "Your vanity was successfully changed."
        },
        lang: {
            desc: "Change Milky's primary language.",
            success: "Language successfully changed to *${args[0]}*."
        }
    }
};