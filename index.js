/** 知話輪関連の処理 */
const request = require('request');

const ChiwawaService = {
    /** リクエストの内容をチェック。
     * @param req リクエストオブジェクト
     * @param azureContext Azure functionsの場合は、contextをセットすると、問題があった際にエラーレスポンスを返し、contextを処理済みにする。
     * @return 問題がある場合はfalseを返す。。 
     */
    isValidRequest: function(req, azureContext) {
        // headerをチェック
        if (!ChiwawaService.privateMethods.isAuthorized(req)) {
            if (azureContext) {
                azureContext.res = {
                    status: 401,
                    body: "Unauthorized request."
                };
                azureContext.log("401: Unauthorized request.");
                azureContext.done();
            }
            return false;
        }
        
        // bodyをチェック
        if (!ChiwawaService.privateMethods.isBodyValid(req)) {
            if (azureContext) {
                azureContext.res = {
                    status: 400,
                    body: "Request body is not valid. Please set a message in the request body."
                };
                azureContext.log("400: Bad request.");
                azureContext.done();
            }
            return false;
        }
        return true;
    },
    /** リクエストから企業IDを取得 */
    getCompanyId: function(req) {
        if (req && req.body) {
            return req.body.companyId || "";
        } else {
            return "";
        }
    },
    /** リクエストからグループIDを取得 */
    getGroupId: function(req) {
        if (req && req.body && req.body.message) {
            return req.body.message.groupId || "";
        } else {
            return "";
        }
    },
    /** リクエストからメッセージの本文を取得 */
    getMessageText: function(req) {
        if (req && req.body && req.body.message) {
            return req.body.message.text || "";
        } else {
            return "";
        }
    },
    /** 知話輪にテキストメッセージを送信 */
    sendMessage: function(req, messageText, callback, azureContext) {
        const content = ChiwawaService.MessageDataBuilder.newMessageDataWithText(messageText);
        ChiwawaService.privateMethods.sendMessage(ChiwawaService.getCompanyId(req), ChiwawaService.getGroupId(req), content, callback, azureContext);
    },            
    /** 知話輪に指定したメッセージデータをそのまま送信（複雑なメッセージデータを送る場合） */
    sendMessageRawData: function(req, messageData, callback, azureContext) {
        ChiwawaService.privateMethods.sendMessage(ChiwawaService.getCompanyId(req), ChiwawaService.getGroupId(req), messageData, callback, azureContext);
    },
    MessageDataBuilder: {
        newMessageDataWithText: function(messageText) {
            return {
                text: messageText || "",
            }
        },
        newMessageDataWithTextAttachment: function(messageText, attachmentTitle, attachmentText, textType) {
            const textAttachment = ChiwawaService.MessageDataBuilder.newTextAttachment(attachmentTitle, attachmentText, textType);
            return {
                text: messageText || "",
                attachments: [textAttachment]
            };
        },
        newMessageDataWithAttachments: function(messageText, attachments) {
            return {
                text: messageText || "",
                attachments: attachments
            };
        },
        newTextAttachment: function(attachmentTitle, attachmentText, textType, color, tagIcons, displaysCommentField, actions) {
            return {
                viewType: "text",
                title: attachmentTitle || "",
                text: attachmentText || "",
                textType: textType || "none",
                color: color || "",
                tagIcons: tagIcons || [],
                displaysCommentField: displaysCommentField || "no",
                actions: actions || []
            };
        }
    },
    privateMethods: {
        isAuthorized: function(req) {
            if (req && req.headers) {
                return req.headers['x-chiwawa-webhook-token'] === process.env["CHIWAWA_VALIDATION_TOKEN"];                
            } else {
                return false;
            }
        },
        isBodyValid: function(req) {
            return req.body && req.body.type && req.body.message;
        },
        /** 知話輪にメッセージを送信 */
        sendMessage: function(companyId, groupId, content, callback, azureContext) {
            const baseUrl = `https://${companyId}.chiwawa.one/api/public/v1/groups/${groupId}/messages`;
            const headers = {
                'Content-Type': 'application/json',
                'X-Chiwawa-API-Token': process.env["CHIWAWA_API_TOKEN"]
            };
            const options = {
                url: baseUrl,
                headers: headers,
                json: content
            }
            request.post(options, function(err, httpResponse, body){
                if (callback) callback(err, httpResponse, body);
            });
            if (azureContext) {
                azureContext.res = {
                    status: 200,
                    body: "OK."
                };
                azureContext.done();    
            }
        },
    }
};

module.exports = ChiwawaService;