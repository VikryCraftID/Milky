import { jidNormalizedUser } from 'baileys';

if (!global.setupSession) global.setupSession = {};

// Helper: Get list of groups where user is admin/owner
async function getAdminGroups(naze, sender, store) {
    const participating = await naze.groupFetchAllParticipating();
    const adminGroups = [];
    
    for (const jid in participating) {
        const metadata = participating[jid];
        const groupData = global.db.groups[jid] || {};
        const isRegisteredOwner = groupData.groupOwner === sender;
        const isAdmin = metadata.participants.some(p => jidNormalizedUser(p.id) === jidNormalizedUser(sender) && (p.admin === 'admin' || p.admin === 'superadmin'));
        
        if (groupData.whitelist && (isRegisteredOwner || isAdmin)) {
            adminGroups.push({
                jid,
                subject: metadata.subject,
                setupDone: groupData.setupDone
            });
        }
    }
    return adminGroups;
}

export default {
    command: 'setup',
    category: 'group',
    get description() { return L('plugins.setup.desc'); },
    syntax: 'setup',
    aliases: ['setuproom'],

    async run(context) {
        const { m, naze, reply, sender, args, prefix, command, store, isGroup } = context;

        if (isGroup) return reply(global.mess.private);

        let sess = global.setupSession[sender];
        const sub = args[0]?.toLowerCase();

        // --- SUBCOMMAND HANDLING ---
        // 'select_group' boleh menginisialisasi sesi baru jika belum ada
        if (sub === 'select_group') {
            if (!sess) {
                global.setupSession[sender] = { jid: args[1], step: 'select', data: {} };
                sess = global.setupSession[sender];
            }
            return await this.handleSessInput(context, sess, sub, args.slice(1));
        }

        if (sess && sub) {
            return await this.handleSessInput(context, sess, sub, args.slice(1));
        }

        // --- BLOCK START IF SESSION ACTIVE ---
        if (sess && !sub) {
            return reply(L('plugins.setup.sessionActive'));
        }

        // --- START NEW SESSION ---
        const adminGroups = await getAdminGroups(naze, sender, store);
        if (adminGroups.length === 0) {
            return reply(L('plugins.setup.noGroups'));
        }

        if (adminGroups.length === 1) {
            const target = adminGroups[0];
            const gData = global.db.groups[target.jid] || {};
            global.setupSession[sender] = {
                jid: target.jid,
                step: target.setupDone ? 'manage' : 'goal',
                data: JSON.parse(JSON.stringify(gData))
            };
            return await this.sendStepMessage(context, global.setupSession[sender], target.subject);
        } else {
            const rows = adminGroups.map(g => ({
                title: g.subject,
                id: `${prefix}setup select_group ${g.jid}`
            }));
            return naze.sendListMsg(m.chat, {
                text: L('plugins.setup.selectGroup'),
                buttons: [{
                    name: 'single_select',
                    buttonParamsJson: { title: 'Daftar Grup', sections: [{ title: 'Grup Whitelist', rows }] }
                }]
            }, { quoted: m });
        }
    },

    async onMessage(context) {
        const { m, naze, text, sender, prefix, command, reply } = context;
        const sess = global.setupSession[sender];
        if (!sess) return;
        if (m.chat !== sender) return;

        // Skip if it's a command (handled by run)
        if (global.listprefix.some(p => m.body?.startsWith(p))) return;

        const input = text.trim().toLowerCase();
        // Map common button texts to subcommands if they are just text
        const textToSub = {
            'confirm': 'confirm',
            'simpan': 'save_yes',
            'tidak': 'save_no'
        };

        const sub = textToSub[input] || input;
        await this.handleSessInput(context, sess, sub);
    },

    async handleSessInput(context, sess, sub, args = []) {
        const { m, naze, sender, reply, prefix, command } = context;

        // Initialize sub-objects safety
        if (!sess.data) sess.data = {};
        if (!sess.data.modes) sess.data.modes = { security: true, rpg: true };
        if (!sess.data.security) sess.data.security = { antilink: true, antikudeta: true };

        // 1. SELECT GROUP
        if (sub === 'select_group') {
            const jid = args[0];
            const group = global.db.groups[jid];
            if (!group) return;
            sess.jid = jid;
            sess.step = group.setupDone ? 'manage' : 'goal';
            sess.data = JSON.parse(JSON.stringify(group));
            const meta = await naze.groupMetadata(jid).catch(() => ({ subject: 'Grup' }));
            return await this.sendStepMessage(context, sess, meta.subject);
        }

        // 2. GOAL SELECTION
        if (sub === 'goal_sec' || sub === 'goal_fun' || sub === 'goal_both') {
            if (sub === 'goal_sec') {
                sess.data.modes.security = true;
                sess.data.modes.rpg = false;
                sess.step = 'security_config';
            } else if (sub === 'goal_fun') {
                const isFirstTime = !global.db.groups[sess.jid]?.setupDone;
                sess.data.modes.security = false;
                sess.data.modes.rpg = true;
                sess.data.setupDone = true;
                global.db.groups[sess.jid] = sess.data;
                delete global.setupSession[sender];
                await naze.sendMessage(sess.jid, { text: isFirstTime ? L('plugins.setup.interactReady') : L('plugins.setup.adminChanged') });
                return reply(L('plugins.setup.setupDone'));
            } else {
                sess.data.modes.security = true;
                sess.data.modes.rpg = true;
                sess.step = 'security_config';
            }
            return await this.sendStepMessage(context, sess);
        }

        // 3. SECURITY TOGGLE
        if (sub.startsWith('toggle_')) {
            const feature = sub.replace('toggle_', '');
            if (sess.data.security.hasOwnProperty(feature)) {
                sess.data.security[feature] = !sess.data.security[feature];
                return await this.sendStepMessage(context, sess);
            }
        }

        // 4. CONFIRM & SAVE
        if (sub === 'confirm') {
            sess.step = 'save_check';
            return await this.sendStepMessage(context, sess);
        }

        if (sub === 'save_yes') {
            const isFirstTime = !global.db.groups[sess.jid]?.setupDone;
            sess.data.setupDone = true;
            global.db.groups[sess.jid] = sess.data;
            const targetJid = sess.jid;
            delete global.setupSession[sender];
            await naze.sendMessage(targetJid, { text: isFirstTime ? L('plugins.setup.interactReady') : L('plugins.setup.adminChanged') });
            return reply(L('plugins.setup.saved'));
        }

        if (sub === 'save_no') {
            sess.data = JSON.parse(JSON.stringify(global.db.groups[sess.jid]));
            delete global.setupSession[sender];
            return reply(L('plugins.setup.canceled'));
        }

        // 5. MANAGE FLOW (TOGGLES)
        if (sub === 'rpg_toggle') {
            sess.data.modes.rpg = !sess.data.modes.rpg;
            global.db.groups[sess.jid].modes.rpg = sess.data.modes.rpg;
            return reply(L('plugins.setup.rpgToggle', sess.data.modes.rpg ? 'diaktifkan' : 'dimatikan'));
        }
        if (sub === 'sec_toggle') {
            sess.data.modes.security = !sess.data.modes.security;
            global.db.groups[sess.jid].modes.security = sess.data.modes.security;
            return reply(L('plugins.setup.secToggle', sess.data.modes.security ? 'diaktifkan' : 'dimatikan'));
        }
        if (sub === 'sec_manage') {
            sess.step = 'security_config';
            return await this.sendStepMessage(context, sess);
        }
    },

    async sendStepMessage(context, sess, subject) {
        const { naze, m, prefix } = context;
        
        let groupSubject = subject;
        if (!groupSubject && sess.jid) {
            try {
                const meta = await naze.groupMetadata(sess.jid);
                groupSubject = meta.subject;
            } catch (e) {
                groupSubject = 'Grup';
            }
        } else if (!groupSubject) {
            groupSubject = 'Grup';
        }
        
        if (sess.step === 'goal') {
            return naze.sendButtonMsg(m.chat, {
                text: L('plugins.setup.goalTitle', groupSubject),
                buttons: [
                    { buttonId: `${prefix}setup goal_sec`, buttonText: { displayText: L('plugins.setup.goalSec') }, type: 1 },
                    { buttonId: `${prefix}setup goal_fun`, buttonText: { displayText: L('plugins.setup.goalFun') }, type: 1 },
                    { buttonId: `${prefix}setup goal_both`, buttonText: { displayText: L('plugins.setup.goalBoth') }, type: 1 }
                ]
            }, { quoted: m });
        }

        if (sess.step === 'security_config') {
            const rows = [
                { title: L('plugins.setup.antiLinkTitle', sess.data.security.antilink ? 'ON' : 'OFF'), get description() { return L('plugins.setup.antiLinkDesc', sess.data.security.antilink ? L('plugins.setup.toggleOff') : L('plugins.setup.toggleOn')); }, id: `${prefix}setup toggle_antilink` },
                { title: L('plugins.setup.antiKudetaTitle', sess.data.security.antikudeta ? 'ON' : 'OFF'), get description() { return L('plugins.setup.antiKudetaDesc', sess.data.security.antikudeta ? L('plugins.setup.toggleOff') : L('plugins.setup.toggleOn')); }, id: `${prefix}setup toggle_antikudeta` }
            ];
            return naze.sendListMsg(m.chat, {
                text: L('plugins.setup.secTitle'),
                buttons: [{
                    name: 'single_select',
                    buttonParamsJson: { title: 'Fitur Security', sections: [{ title: 'Pilih untuk Toggle', rows }] }
                }]
            }, { quoted: m });
        }

        if (sess.step === 'save_check') {
            return naze.sendButtonMsg(m.chat, {
                text: L('plugins.setup.saveCheck'),
                buttons: [
                    { buttonId: `${prefix}setup save_yes`, buttonText: { displayText: 'Simpan' }, type: 1 },
                    { buttonId: `${prefix}setup save_no`, buttonText: { displayText: 'Tidak' }, type: 1 }
                ]
            }, { quoted: m });
        }

        if (sess.step === 'manage') {
            const rows = [
                { title: L('plugins.setup.antiLinkTitle', sess.data.security.antilink ? 'ON' : 'OFF'), get description() { return L('plugins.setup.antiLinkDesc', sess.data.security.antilink ? L('plugins.setup.toggleOff') : L('plugins.setup.toggleOn')); }, id: `${prefix}setup toggle_antilink` },
                { title: L('plugins.setup.antiKudetaTitle', sess.data.security.antikudeta ? 'ON' : 'OFF'), get description() { return L('plugins.setup.antiKudetaDesc', sess.data.security.antikudeta ? L('plugins.setup.toggleOff') : L('plugins.setup.toggleOn')); }, id: `${prefix}setup toggle_antikudeta` }
            ];
            return naze.sendListMsg(m.chat, {
                text: L('plugins.setup.manageTitle', groupSubject),
                buttons: [
                    {
                        name: 'quick_reply',
                        buttonParamsJson: { display_text: L('plugins.setup.btnRpg'), id: `${prefix}setup rpg_toggle` }
                    },
                    {
                        name: 'quick_reply',
                        buttonParamsJson: { display_text: L('plugins.setup.btnSec'), id: `${prefix}setup sec_toggle` }
                    },
                    {
                        name: 'single_select',
                        buttonParamsJson: { title: L('plugins.setup.btnSecManage'), sections: [{ title: 'Pilih untuk Toggle', rows }] }
                    },
                    {
                        name: 'quick_reply',
                        buttonParamsJson: { display_text: L('plugins.setup.btnSave'), id: `${prefix}setup confirm` }
                    }
                ]
            }, { quoted: m });
        }
    }
};