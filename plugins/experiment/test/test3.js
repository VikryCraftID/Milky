export default {
    command: 'test3',
    category: 'experiment',
    description: 'Testing rich response: Interactive Table',
    syntax: '.test3',
    async run(context) {
        const { m, naze } = context;
        
        const data = {
            "response_id": "4f8f3219-9958-4890-9c4d-6f78d489f63b",
            "sections": [{
                "view_model": {
                    "primitive": {
                        "rows": [
                            { "is_header": true, "cells": ["Member Name", "Assigned Role"] },
                            { "is_header": false, "cells": ["Ryuhan", "Lead Developer"] },
                            { "is_header": false, "cells": ["Rimuru", "AI Assistant"] },
                            { "is_header": false, "cells": ["Crystal", "System Arch"] }
                        ],
                        "__typename": "GenATableUXPrimitive"
                    },
                    "__typename": "GenAISingleLayoutViewModel"
                }
            }]
        };

        const unifiedResponse = Buffer.from(JSON.stringify(data)).toString('base64');

        await naze.relayMessage(m.chat, {
            "messageContextInfo": {
                "deviceListMetadata": {},
                "deviceListMetadataVersion": 2,
                "botMetadata": {
                    "messageDisclaimerText": "Table Test"
                }
            },
            "botForwardedMessage": {
                "message": {
                    "richResponseMessage": {
                        "messageType": 1,
                        "submessages": [
                            {
                                "messageType": 4,
                                "tableMetadata": {
                                    "title": "Development Team",
                                    "rows": data.sections[0].view_model.primitive.rows.map(r => ({
                                        items: r.cells,
                                        isHeading: r.is_header
                                    }))
                                }
                            }
                        ],
                        "unifiedResponse": {
                            "data": unifiedResponse
                        },
                        "contextInfo": {
                            "forwardingScore": 1,
                            "isForwarded": true,
                            "forwardedAiBotMessageInfo": {
                                "botJid": "0@bot"
                            },
                            "forwardOrigin": 4
                        }
                    }
                }
            }
        }, {});
    }
};