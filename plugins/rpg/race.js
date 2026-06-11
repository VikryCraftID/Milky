import { getRolesData } from '../../lib/rpg.js';

export default {
    command: 'race',
    category: 'user',
    get description() { return L('rpg.race.desc'); },
    syntax: 'race [root_race]',
    aliases: ['ras', 'path'],
    async run(context) {
        const { m, args, reply, prefix, command } = context;
        const rolesData = getRolesData();
        const query = args.join(' ').toLowerCase().trim();

        if (!query) {
            let text = L('rpg.race.originTitle');
            rolesData.roots.forEach((root, i) => {
                text += L('rpg.race.originRow', i + 1, root.name, root.weight);
            });
            text += L('rpg.race.originFooter', prefix + command);
            return reply(text);
        }

        const rootRace = rolesData.roots.find(r => r.name.toLowerCase() === query);
        if (!rootRace) {
            return reply(L('rpg.race.pathNotFound', args.join(' ')));
        }

        let text = L('rpg.race.pathTitle', rootRace.name.toUpperCase());
        
        function buildTree(parentName, depth = 0) {
            const evos = rolesData.evos[parentName] || [];
            let treeText = '';
            const indent = '   '.repeat(depth);
            
            evos.forEach(evo => {
                treeText += L('rpg.race.pathRow', indent, evo.to, evo.tier, evo.prob);
                treeText += buildTree(evo.to, depth + 1);
            });
            return treeText;
        }

        text += L('rpg.race.pathOrigin', rootRace.name);
        const tree = buildTree(rootRace.name);
        text += tree || L('rpg.race.pathEmpty');

        await reply(text);
    }
};
