export default {
    command: 'test4',
    category: 'experiment',
    description: 'Testing rich response: Grid Image Metadata',
    syntax: '.test4',
    async run(context) {
        const { m, naze } = context;
        
        const data = {
            "response_id": "4f8f3219-9958-4890-9c4d-6f78d489f63b",
            "sections": [
                {
                    "view_model": {
                        "primitive": {
                            "media": {
                                "url": "https://i.ibb.co.com/NdGFm6B2/925a56c6fbaa7622b62be9868296b4e3.jpg",
                                "mime_type": "image/jpeg"
                            },
                            "imagine_type": 3,
                            "status": { "status": "READY" },
                            "__typename": "GenAIImaginePrimitive"
                        },
                        "__typename": "GenAISingleLayoutViewModel"
                    }
                },
                {
                    "view_model": {
                        "primitive": {
                            "media": {
                                "url": "https://i.ibb.co.com/mFd5RS0f/6181da7219295616207cf0f9b18e3d69.jpg",
                                "mime_type": "image/jpeg"
                            },
                            "imagine_type": 3,
                            "status": { "status": "READY" },
                            "__typename": "GenAIImaginePrimitive"
                        },
                        "__typename": "GenAISingleLayoutViewModel"
                    }
                }
            ]
        };

        const unifiedResponse = Buffer.from(JSON.stringify(data)).toString('base64');

        await naze.relayMessage(m.chat, {
            "messageContextInfo": {
                "deviceListMetadata": {},
                "deviceListMetadataVersion": 2,
                "botMetadata": {
                    "messageDisclaimerText": "Grid Image Test"
                }
            },
            "botForwardedMessage": {
                "message": {
                    "richResponseMessage": {
                        "messageType": 1,
                        "submessages": [
                            {
                                "messageType": 1,
                                "gridImageMetadata": {
                                    "gridImageUrl": {
                                        "imagePreviewUrl": data.sections[0].view_model.primitive.media.url
                                    },
                                    "imageUrls": data.sections.map(s => ({
                                        imagePreviewUrl: s.view_model.primitive.media.url,
                                        imageHighResUrl: s.view_model.primitive.media.url,
                                        sourceUrl: "https://google.com"
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