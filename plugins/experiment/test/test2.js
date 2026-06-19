export default {
    command: 'test2',
    category: 'experiment',
    description: 'Testing rich response: Syntax Highlighting Code Block',
    syntax: '.test2',
    async run(context) {
        const { m, naze } = context;
        
        const data = {
            "response_id": "4f8f3219-9958-4890-9c4d-6f78d489f63b",
            "sections": [{
                "view_model": {
                    "primitive": {
                        "language": "javascript",
                        "code_blocks": [
                            { "content": "class", "type": "KEYWORD" },
                            { "content": " Ryuhan {\n\t", "type": "DEFAULT" },
                            { "content": "static", "type": "KEYWORD" },
                            { "content": " ", "type": "DEFAULT" },
                            { "content": "hello", "type": "METHOD" },
                            { "content": "() {\n\t\t", "type": "DEFAULT" },
                            { "content": "return", "type": "KEYWORD" },
                            { "content": " ", "type": "DEFAULT" },
                            { "content": "'Hello World'", "type": "STR" },
                            { "content": ";\n\t}\n}", "type": "DEFAULT" }
                        ],
                        "__typename": "GenAICodeUXPrimitive"
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
                    "messageDisclaimerText": "Code Block Test"
                }
            },
            "botForwardedMessage": {
                "message": {
                    "richResponseMessage": {
                        "messageType": 1,
                        "submessages": [
                            {
                                "messageType": 5,
                                "codeMetadata": {
                                    "codeLanguage": data.sections[0].view_model.primitive.language,
                                    "codeBlocks": data.sections[0].view_model.primitive.code_blocks.map(b => ({
                                        codeContent: b.content,
                                        highlightType: b.type === "KEYWORD" ? 1 : b.type === "METHOD" ? 2 : b.type === "STR" ? 3 : 0
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