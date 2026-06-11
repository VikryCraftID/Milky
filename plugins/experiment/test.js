export default {
    command: 'test',
    category: 'experiment',
    description: 'Testing rich response message (Combined)',
    syntax: '.test',
    async run(context) {
        const { m, naze } = context;
        
        await naze.relayMessage(m.chat, {
            "messageContextInfo": {
                "deviceListMetadata": {},
                "deviceListMetadataVersion": 2,
                "botMetadata": {
                    "messageDisclaimerText": "Ryuhan Desuwa",
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
                            },
                            {
                                "provider": "UNKNOWN",
                                "thumbnailCDNURL": "https://i.ibb.co.com/2wLvTgX/Proyek-Baru-34-6899824.png",
                                "sourceProviderURL": "https://demo-rimuruflix.vercel.app",
                                "sourceQuery": "",
                                "faviconCDNURL": "https://i.ibb.co.com/wNgcJFKt/2b0f9ba7a6a2c3dc06d967fd0039c8ac.jpg",
                                "citationNumber": 2,
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
                                "messageText": "\n# Ngetes doang\n## Ryuhan\n\n---\n\n=={ Yellow Text }==\n\n---\n\nIni hyperlink:\n{{IE_0}}Google{{/IE_0}}\n\nIni auto citation:\n{{IE_1}}Ryuhan{{/IE_1}}\n\t"
                            },
                            {
                                "messageType": 5,
                                "codeMetadata": {
                                    "codeLanguage": "javascript",
                                    "codeBlocks": [
                                        { "codeContent": "class", "highlightType": 1 },
                                        { "codeContent": " Ryuhan {\n\t", "highlightType": 0 },
                                        { "codeContent": "static", "highlightType": 1 },
                                        { "codeContent": " ", "highlightType": 0 },
                                        { "codeContent": "hello", "highlightType": 2 },
                                        { "codeContent": "() {\n\t\t", "highlightType": 0 },
                                        { "codeContent": "return", "highlightType": 1 },
                                        { "codeContent": " ", "highlightType": 0 },
                                        { "codeContent": "'Hello World'", "highlightType": 3 },
                                        { "codeContent": ";\n\t}\n}", "highlightType": 0 }
                                    ]
                                }
                            },
                            {
                                "messageType": 4,
                                "tableMetadata": {
                                    "title": "",
                                    "rows": [
                                        { "items": ["Nama", "Role"], "isHeading": true },
                                        { "items": ["Ryuhab", "Developer"] },
                                        { "items": ["Rimuru", "Assistant"] }
                                    ]
                                }
                            },
                            {
                                "messageType": 1,
                                "gridImageMetadata": {
                                    "gridImageUrl": {
                                        "imagePreviewUrl": "https://i.ibb.co.com/NdGFm6B2/925a56c6fbaa7622b62be9868296b4e3.jpg"
                                    },
                                    "imageUrls": [
                                        {
                                            "imagePreviewUrl": "https://i.ibb.co.com/NdGFm6B2/925a56c6fbaa7622b62be9868296b4e3.jpg",
                                            "imageHighResUrl": "https://i.ibb.co.com/NdGFm6B2/925a56c6fbaa7622b62be9868296b4e3.jpg",
                                            "sourceUrl": "https://google.com"
                                        },
                                        {
                                            "imagePreviewUrl": "https://i.ibb.co.com/mFd5RS0f/6181da7219295616207cf0f9b18e3d69.jpg",
                                            "imageHighResUrl": "https://i.ibb.co.com/mFd5RS0f/6181da7219295616207cf0f9b18e3d69.jpg",
                                            "sourceUrl": "https://google.com"
                                        }
                                    ]
                                }
                            },
                            {
                                "messageType": 9,
                                "contentItemsMetadata": {
                                    "contentType": 1,
                                    "itemsMetadata": [
                                        {
                                            "reelItem": {
                                                "title": "Ryuhan",
                                                "profileIconUrl": "https://i.ibb.co.com/wNgcJFKt/2b0f9ba7a6a2c3dc06d967fd0039c8ac.jpg",
                                                "thumbnailUrl": "https://i.ibb.co.com/mFd5RS0f/6181da7219295616207cf0f9b18e3d69.jpg",
                                                "videoUrl": "https://demo-rimuruflix.vercel.app"
                                            }
                                        },
                                        {
                                            "reelItem": {
                                                "title": "Ryuhan",
                                                "profileIconUrl": "https://i.ibb.co.com/wNgcJFKt/2b0f9ba7a6a2c3dc06d967fd0039c8ac.jpg",
                                                "thumbnailUrl": "https://i.ibb.co.com/NdGFm6B2/925a56c6fbaa7622b62be9868296b4e3.jpg",
                                                "videoUrl": "https://demo-rimuruflix.vercel.app"
                                            }
                                        }
                                    ]
                                }
                            }
                        ],
                        "unifiedResponse": {
                            "data": "eyJyZXNwb25zZV9pZCI6IjRmOGYzMjE5LTk5NTgtNDg5MC05YzRkLTZmNzhkNDg5ZjYzYiIsInNlY3Rpb25zIjpbeyJ2aWV3X21vZGVsIjp7InByaW1pdGl2ZSI6eyJ0ZXh0IjoiXG4jIEhhbG8gRHVuaWFcbiMjIFJ5dWhhblxuXG4tLS1cblxuPT17IFllbGxvdyBUZXh0IH09PVxuXG4tLS1cblxuSW5pIGh5cGVybGluazpcbnt7SUVfMH19R29vZ2xle3svSUVfMH19XG5cbkluaSBhdXRvIGNpdGF0aW9uOlxue3tJRV8xfX1SeXVoYW57ey9JRV8xfX1cblx0IiwiaW5saW5lX2VudGl0aWVzIjpbeyJrZXkiOiJJRV8wIiwibWV0YWRhdGEiOnsiZGlzcGxheV9uYW1lIjoiR29vZ2xlIiwiaXNfdHJ1c3RlZCI6dHJ1ZSwidXJsIjoiaHR0cHM6Ly9nb29nbGUuY29tIiwiX190eXBlbmFtZSI6IkdlbkFJSW5saW5lTGlua0l0ZW0ifX0seyJrZXkiOiJJRV8xIiwibWV0YWRhdGEiOnsicmVmZXJlbmNlX2lkIjoxLCJyZWZlcmVuY2VfdXJsIjoiaHR0cHM6Ly9vcGVuYWkuY29tIiwicmVmZXJlbmNlX3RpdGxlIjoiaHR0cHM6Ly9vcGVuYWkuY29tIiwicmVmZXJlbmNlX2Rpc3BsYXlfbmFtZSI6Imh0dHBzOi8vb3BlbmFpLmNvbSIsInNvdXJjZXMiOltdLCJfX3R5cGVuYW1lIjoiR2VuQUlTZWFyY2hDaXRhdGlvbkl0ZW0ifX1dLCJfX3R5cGVuYW1lIjoiR2VuQUlNYXJrZG93blRleHRVWFByaW1pdGl2ZSJ9LCJfX3R5cGVuYW1lIjoiR2VuQUlTaW5nbGVMYXlvdXRWaWV3TW9kZWwifX0seyJ2aWV3X21vZGVsIjp7InByaW1pdGl2ZSI6eyJsYW5ndWFnZSI6ImphdmFzY3JpcHQiLCJjb2RlX2Jsb2NrcyI6W3siY29udGVudCI6ImNsYXNzIiwidHlwZSI6IktFWVdPUkQifSx7ImNvbnRlbnQiOiIgUnl1aGFuIHtcblx0IiwidHlwZSI6IkRFRkFVTFQifSx7ImNvbnRlbnQiOiJzdGF0aWMiLCJ0eXBlIjoiS0VZV09SRCJ9LHsiY29udGVudCI6IiAiLCJ0eXBlIjoiREVGQVVMVCJ9LHsiY29udGVudCI6ImhlbGxvIiwidHlwZSI6Ik1FVEhPRCJ9LHsiY29udGVudCI6IigpIHtcblx0XHQiLCJ0eXBlIjoiREVGQVVMVCJ9LHsiY29udGVudCI6InJldHVybiIsInR5cGUiOiJLRVlXT1JEIn0seyJjb250ZW50IjoiICIsInR5cGUiOiJERUZBVUxUIn0seyJjb250ZW50IjoiJ0hlbGxvIFdvcmxkJyIsInR5cGUiOiJTVFIifSx7ImNvbnRlbnQiOiI7XG5cdH1cbn0iLCJ0eXBlIjoiREVGQVVMVCJ9XSwiX190eXBlbmFtZSI6IkdlbkFJQ29kZVVYUHJpbWl0aXZlIn0sIl9fdHlwZW5hbWUiOiJHZW5BSVNpbmdsZUxheW91dFZpZXdNb2RlbCJ9fSx7InZpZXdfbW9kZWwiOnsicHJpbWl0aXZlIjp7InJvd3MiOlt7ImlzX2hlYWRlciI6dHJ1ZSwiY2VsbHMiOlsiTmFtYSIsIlJvbGUiXX0seyJpc19oZWFkZXIiOmZhbHNlLCJjZWxscyI6WyJSeXVoYW4iLCJEZXZlbG9wZXIiXX0seyJpc19oZWFkZXIiOmZhbHNlLCJjZWxscyI6WyJSaW11cnUiLCJBc3Npc3RhbnQiXX1dLCJfX3R5cGVuYW1lIjoiR2VuQVRhYmxlVVhQcmltaXRpdmUifSwiX190eXBlbmFtZSI6IkdlbkFJU2luZ2xlTGF5b3V0Vmlld01vZGVsIn19LHsidmlld19tb2RlbCI6eyJwcmltaXRpdmUiOnsic291cmNlcyI6W3sic291cmNlX3R5cGUiOiJUSElSRF9QQVJUWSIsInNvdXJjZV9kaXNwbGF5X25hbWUiOiJHaXRIdWIiLCJzb3VyY2Vfc3VidGl0bGUiOiJBSSIsInNvdXJjZV91cmwiOiJodHRwczovL2dpdGh1Yi5jb20vcnl1aGFuZGV2LyIsImZhdmljb24iOnsidXJsIjoiaHR0cHM6Ly9pLmliYi5jby5jb20vd05nY0pGS3QvMmIwZjliYTdhNmEyYzNkYzA2ZDk2N2ZkMDAzOWM4YWMuanBnIiwibWltZV90eXBlIjoiaW1hZ2UvanBlZyIsIndpZHRoIjoxNiwiaGVpZ2h0IjoxNn19LHsic291cmNlX3R5cGUiOiJUSElSRF9QQVJUWSIsInNvdXJjZV9kaXNwbGF5X25hbWUiOiJSeXVoYW4iLCJzb3VyY2Vfc3VidGl0bGUiOiJBSSIsInNvdXJjZV91cmwiOiJodHRwczovL2RlbW8tcmltdXJ1ZmxpeC52ZXJjZWwuYXBwIiwiZmF2aWNvbiI6eyJ1cmwiOiJodHRwczovL2kuaWJiLmNvLmNvbS93TmdjSkZLdC8yYjBmOWJhN2E2YTJjM2RjMDZkOTY3ZmQwMDM5YzhhYy5qcGciLCJtaW1lX3R5cGUiOiJpbWFnZS9qcGVnIiwid2lkdGgiOjE2LCJoZWlnaHQiOjE2fX1dLCJfX3R5cGVuYW1lIjoiR2VuQUlTZWFyY2hSZXN1bHRQcmltaXRpdmUifSwiX190eXBlbmFtZSI6IkdlbkFJU2luZ2xlTGF5b3V0Vmlld01vZGVsIn19LHsidmlld19tb2RlbCI6eyJwcmltaXRpdmUiOnsibWVkaWEiOnsidXJsIjoiaHR0cHM6Ly9pLmliYi5jby5jb20vTmRHRm02QjIvOTI1YTU2YzZmYmFhNzYyMmI2MmJlOTg2ODI5NmI0ZTMuanBnIiwibWltZV90eXBlIjoiaW1hZ2UvanBlZyJ9LCJpbWFnaW5lX3R5cGUiOjMsInN0YXR1cyI6eyJzdGF0dXMiOiJSRUFEWSJ9LCJfX3R5cGVuYW1lIjoiR2VuQUlJbWFnaW5lUHJpbWl0aXZlIn0sIl9fdHlwZW5hbWUiOiJHZW5BSVNpbmdsZUxheW91dFZpZXdNb2RlbCJ9fSx7InZpZXdfbW9kZWwiOnsicHJpbWl0aXZlIjp7Im1lZGlhIjp7InVybCI6Imh0dHBzOi8vaS5pYmIuY28uY29tL21GZDVSUzBmLzYxODFkYTcyMTkyOTU2MTYyMDdjZjBmOWIxOGUzZDY5LmpwZyIsIm1pbWVfdHlwZSI6ImltYWdlL2pwZWcifSwiaW1hZ2luZV90eXBlIjozLCJzdGF0dXMiOnsic3RhdHVzIjoiUkVBRFkifSwiX190eXBlbmFtZSI6IkdlbkFJSW1hZ2luZVByaW1pdGl2ZSJ9LCJfX3R5cGVuYW1lIjoiR2VuQUlTaW5nbGVMYXlvdXRWaWV3TW9kZWwifX0seyJ2aWV3X21vZGVsIjp7InByaW1pdGl2ZXMiOlt7InJlZWxzX3VybCI6Imh0dHBzOi8vZGVtby1yaW11cnVmbGl4LnZlcmNlbC5hcHAiLCJ0aHVtYm5haWxfdXJsIjoiaHR0cHM6Ly9pLmliYi5jby5jb20vMndMdlRnWC9Qcm95ZWstQmFydS0zNC02ODk5ODI0LnBuZyIsImNyZWF0b3IiOiJSeXVoYW4iLCJhdmF0YXJfdXJsIjoiaHR0cHM6Ly9pLmliYi5jby5jb20vd05nY0pGS3QvMmIwZjliYTdhNmEyYzNkYzA2ZDk2N2ZkMDAzOWM4YWMuanBnIiwicmVlbHNfdGl0bGUiOiJEZW1vIFJlZWwiLCJsaWtlc19jb3VudCI6MTIwMDAsInNoYXJlc19jb3VudCI6NTAwLCJ2aWV3X2NvdW50Ijo5OTk5OTksInJlZWxfc291cmNlIjoiSUciLCJpc192ZXJpZmllZCI6dHJ1ZSwiX190eXBlbmFtZSI6IkdlbkFJUmVlbFByaW1pdGl2ZSJ9LHsicmVlbHNfdXJsIjoiaHR0cHM6Ly9kZW1vLXJpbXVydWZsaXgudmVyY2VsLmFwcCIsInRodW1ibmFpbF91cmwiOiJodHRwczovL2kuaWJiLmNvLmNvbS8yd0x2VGdYL1Byb3llay1CYXJ1LTM0LTY4OTk4ODI0LnBuZyIsImNyZWF0b3IiOiJSeXVoYW4iLCJhdmF0YXJfdXJsIjoiaHR0cHM6Ly9pLmliYi5jby5jb20vd05nY0pGS3QvMmIwZjliYTdhNmEyYzNkYzA2ZDk2N2ZkMDAzOWM4YWMuanBnIiwicmVlbHNfdGl0bGUiOiJEZW1vIFJlZWwiLCJsaWtlc19jb3VudCI6MTIwMDAsInNoYXJlc19jb3VudCI6NTAwLCJ2aWV3X2NvdW50Ijo5OTk5OTksInJlZWxfc291cmNlIjoiSUciLCJpc192ZXJpZmllZCI6dHJ1ZSwiX190eXBlbmFtZSI6IkdlbkFJUmVlbFByaW1pdGl2ZSJ9XX0sIl9fdHlwZW5hbWUiOiJHZW5BSUhTY3JvbGxMYXlvdXRWaWV3TW9kZWwifV19"
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