export default {
    command: 'test5',
    category: 'experiment',
    description: 'Testing rich response: Content Items (Reels/Scroll Layout)',
    syntax: '.test5',
    async run(context) {
        const { m, naze } = context;
        
        const data = {
            "response_id": "4f8f3219-9958-4890-9c4d-6f78d489f63b",
            "sections": [{
                "view_model": {
                    "primitives": [
                        {
                            "reels_url": "https://demo-rimuruflix.vercel.app",
                            "thumbnail_url": "https://i.ibb.co.com/2wLvTgX/Proyek-Baru-34-6899824.png",
                            "creator": "Ryuhan Video 1",
                            "avatar_url": "https://i.ibb.co.com/wNgcJFKt/2b0f9ba7a6a2c3dc06d967fd0039c8ac.jpg",
                            "reels_title": "Demo Reel 1",
                            "likes_count": 12000,
                            "shares_count": 500,
                            "view_count": 999999,
                            "reel_source": "IG",
                            "is_verified": true,
                            "__typename": "GenAIReelPrimitive"
                        },
                        {
                            "reels_url": "https://demo-rimuruflix.vercel.app",
                            "thumbnail_url": "https://i.ibb.co.com/NdGFm6B2/925a56c6fbaa7622b62be9868296b4e3.jpg",
                            "creator": "Ryuhan Video 2",
                            "avatar_url": "https://i.ibb.co.com/wNgcJFKt/2b0f9ba7a6a2c3dc06d967fd0039c8ac.jpg",
                            "reels_title": "Demo Reel 2",
                            "likes_count": 8000,
                            "shares_count": 200,
                            "view_count": 500000,
                            "reel_source": "IG",
                            "is_verified": true,
                            "__typename": "GenAIReelPrimitive"
                        }
                    ],
                    "__typename": "GenAIHScrollLayoutViewModel"
                }
            }]
        };

        const unifiedResponse = Buffer.from(JSON.stringify(data)).toString('base64');

        await naze.relayMessage(m.chat, {
            "messageContextInfo": {
                "deviceListMetadata": {},
                "deviceListMetadataVersion": 2,
                "botMetadata": {
                    "messageDisclaimerText": "Reels Scroll Test"
                }
            },
            "botForwardedMessage": {
                "message": {
                    "richResponseMessage": {
                        "messageType": 1,
                        "submessages": [
                            {
                                "messageType": 9,
                                "contentItemsMetadata": {
                                    "contentType": 1,
                                    "itemsMetadata": data.sections[0].view_model.primitives.map(p => ({
                                        reelItem: {
                                            title: p.reels_title,
                                            profileIconUrl: p.avatar_url,
                                            thumbnailUrl: p.thumbnail_url,
                                            videoUrl: p.reels_url
                                        }
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