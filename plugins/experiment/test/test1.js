export default {
    command: 'test1',
    category: 'experiment',
    description: 'Testing rich response: Verified Markdown Styles',
    syntax: '.test1',
    async run(context) {
        const { m, naze } = context;
        
        const data = {
            "response_id": "verified-styles-" + Date.now(),
            "sections": [{
                "view_model": {
                    "primitive": {
                        "text": "\n# 🖋 Verified Text Styles\n## Meta GenAI Markdown\n\n---\n\n1. **Bold Text Style**\n2. _{ Italic Text Style }_\n3. ++{ Underline Text Style }++\n4. =={ Yellow Highlight Style }==\n\n---\n\n### Interactive Elements\n\nIni hyperlink:\n{{IE_0}}Google Search{{/IE_0}}\n\nIni auto citation:\n{{IE_1}}Ryuhan Citation{{/IE_1}}\n\t",
                        "inline_entities": [
                            {
                                "key": "IE_0",
                                "metadata": {
                                    "display_name": "Google",
                                    "is_trusted": true,
                                    "url": "https://google.com",
                                    "__typename": "GenAIInlineLinkItem"
                                }
                            },
                            {
                                "key": "IE_1",
                                "metadata": {
                                    "reference_id": 1,
                                    "reference_url": "https://demo-rimuruflix.vercel.app",
                                    "reference_title": "Ryuhan Source",
                                    "reference_display_name": "Ryuhan",
                                    "sources": [],
                                    "__typename": "GenAISearchCitationItem"
                                }
                            }
                        ],
                        "__typename": "GenAIMarkdownTextUXPrimitive"
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
                    "messageDisclaimerText": "Verified Styles Test",
                    "richResponseSourcesMetadata": {
                        "sources": [
                            {
                                "provider": "UNKNOWN",
                                "thumbnailCDNURL": "https://i.ibb.co.com/2wLvTgX/Proyek-Baru-34-6899824.png",
                                "sourceProviderURL": "https://demo-rimuruflix.vercel.app",
                                "sourceQuery": "",
                                "faviconCDNURL": "https://i.ibb.co.com/wNgcJFKt/2b0f9ba7a6a2c3dc06d967fd0039c8ac.jpg",
                                "citationNumber": 1,
                                "sourceTitle": "Ryuhan"
                            }
                        ]
                    }
                }
            },
            "botForwardedMessage": {
                "message": {
                    "richResponseMessage": {
                        "messageType": 1,
                        "submessages": [
                            {
                                "messageType": 2,
                                "messageText": data.sections[0].view_model.primitive.text
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