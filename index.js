/** 知話輪関連の処理 */
var request = require('request');
const ChiwawaService = {
    /** リクエストの内容をチェック。
     * @param req リクエストオブジェクト
     * @param context（任意） Azure functionsの場合は、contextをセットすると、問題があった際にエラーレスポンスを返し、contextを処理済みにする。
     * @return 問題がある場合はfalseを返す。。 
     */
    isValidRequest: function(req, context) {
        // headerをチェック
        if (!ChiwawaService.privateMethods.isAuthorized(req)) {
            if (context) {
                context.res = {
                    status: 401,
                    body: "Unauthorized request."
                };
                context.log("401: Unauthorized request.");
                context.done();
            }
            return false;
        }
        
        // bodyをチェック
        if (!ChiwawaService.privateMethods.isBodyValid(req)) {
            if (context) {
                context.res = {
                    status: 400,
                    body: "Request body is not valid. Please set a message in the request body."
                };
                context.log("400: Bad request.");
                context.done();
            }
            return false;
        }
        return true;
    },
    /** リクエストから企業IDを取得 */
    getCompanyId: function(req) {
        return req.body.companyId;
    },
    /** リクエストからグループIDを取得 */
    getGroupId: function(req) {
        return req.body.message.groupId;
    },
    /** リクエストからメッセージを取得 */
    getMessage: function(req) {
        return req.body.message.text;
    },
    /** 知話輪にメッセージを送信 */
    sendMessage: function(companyId, groupId, messageText, callback) {
        const baseUrl = `https://${companyId}.chiwawa.one/api/public/v1/groups/${groupId}/messages`;
        const content = {
            'text': messageText
        };
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
    },
    privateMethods: {
        isAuthorized: function(req) {
            return req.headers['x-chiwawa-webhook-token'] === process.env["CHIWAWA_VALIDATION_TOKEN"];
        },
        isBodyValid: function(req) {
            return req.body && req.body.type && req.body.message;
        },
    }
};

module.exports = ChiwawaService;