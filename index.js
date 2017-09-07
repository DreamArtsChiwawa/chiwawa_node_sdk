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
    /** リクエストから企業IDを取得
     * @param req リクエストオブジェクト
     * @return リクエストにセットされた企業IDを取得する。取得できない場合は""を返す。
     */
    getCompanyId: function(req) {
        if (req && req.body) {
            return req.body.companyId || "";
        } else {
            return "";
        }
    },
    /** リクエストからグループIDを取得
     * @param req リクエストオブジェクト
     * @return リクエストにセットされたグループIDを取得する。取得できない場合は""を返す。
     */
    getGroupId: function(req) {
        if (req && req.body && req.body.message) {
            return req.body.message.groupId || "";
        } else {
            return "";
        }
    },
    /** リクエストからメッセージの本文を取得
     * @param req リクエストオブジェクト
     * @return リクエストにセットされたメッセージの本文を取得する。取得できない場合は""を返す。
     */
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
    /** 送信用のメッセージデータを組み立てるユーティリティ */
    MessageDataBuilder: {
        /** テキストメッセージのオブジェクトを作成
         * @param messageText メッセージ本文
         * @return テキストメッセージのオブジェクト
         */
        newMessageDataWithText: function(messageText) {
            return {
                text: messageText || "",
            }
        },
        /** テキストメッセージとテキストアタッチメントのオブジェクトを作成
         * @param messageText　メッセージ本文
         * @param attachmentTitle　テキストアタッチメントのタイトル
         * @param attachmentText　テキストアタッチメントの本文
         * @param textType　テキストアタッチメントの本文の形式。none: プレーンテキスト、hmtl: HTML形式、md：Markdown形式
         * @return テキストメッセージとテキストアタッチメントのオブジェクト
         */
        newMessageDataWithTextAttachment: function(messageText, attachmentTitle, attachmentText, textType) {
            const textAttachment = ChiwawaService.MessageDataBuilder.newTextAttachment(attachmentTitle, attachmentText, textType);
            return {
                text: messageText || "",
                attachments: [textAttachment]
            };
        },
        /** テキストメッセージと複数のテキストアタッチメントのオブジェクトを作成
         * @param messageText　メッセージ本文
         * @param attachments　アタッチメントオブジェクトを配列で指定
         * @return テキストメッセージと複数のテキストアタッチメントのオブジェクト
         */
        newMessageDataWithAttachments: function(messageText, attachments) {
            return {
                text: messageText || "",
                attachments: attachments
            };
        },
        /** テキストアタッチメントのオブジェクトを作成
         * @param attachmentTitle　タイトル
         * @param attachmentText　本文
         * @param textType　本文の形式。none: プレーンテキスト、hmtl: HTML形式、md：Markdown形式
         * @param color　左下に表示するラベルの色。cssの色指定と同様16進数の文字列を指定する。例：「#ff0000」
         * @param tagIcons　タグアイコンの名称を配列で指定。複数指定可。アイコン名称はAPIドキュメント参照
         * @param displaysCommentField　コメント欄を表示するか否か。yes: コメント入力欄を表示する。no: コメント入力欄を表示しない。
         * @param actions　アクションオブジェクトを配列で指定。
         * @return テキストアタッチメントのオブジェクト
         */
        newTextAttachment: function(attachmentTitle, attachmentText, textType, color, tagIcons, displaysCommentField, actions) {
            return {
                attachmentId: "id" + new Date().getTime(),
                viewType: "text",
                title: attachmentTitle || "",
                text: attachmentText || "",
                textType: textType || "none",
                color: color || "",
                tagIcons: tagIcons || [],
                displaysCommentField: displaysCommentField || "no",
                actions: actions || []
            };
        },
        /** テキストアタッチメントにセットするアクションオブジェクトを生成
         * @param buttonTitle　ボタンタイトル
         * @param localizedTitle　言語別のボタンタイトル。{"ISO言語コード": "当該言語のボタン名称"}の形式で指定
         * @param displaysIn　ボタンの表示場所。timeline: タイムラインに表示、detail: 詳細画面に表示、both: 両方（デフォルト）
         * @param actionUrl　ボタンが押された際にリクエストを飛ばす先のURL。placeholderについてはAPIドキュメント参照。
         * @param actionType　ボタンを押下した時の動作種別。detail: 詳細画面を開く、inAppBrowser: アプリ内ブラウザで開く、externalApp: 外部アプリで開く、get: HTTP GETリクエストを送信、post: POSTリクエストを送信
         * @param postBody　actionUrlにpostする内容。
         * @param postBodyContentType　postBodyのコンテントタイプ。json: JSON形式（デフォルト）、form: フォーム形式
         * @return アクションオブジェクト（テキストアタッチメントに表示するボタンとその挙動を指定したもの）
         */
        newTextAttachmentAction: function(buttonTitle, localizedTitle, displaysIn, actionUrl, actionType, postBody, postBodyContentType) {
            return {
                buttonTitle: buttonTitle || "",
                localizedTitle: localizedTitle || {},
                displaysIn: displaysIn || "both",
                actionUrl: actionUrl || "",
                actionType: actionType || "",
                postBody: postBody || {},
                postBodyContentType: postBodyContentType || "json"
            }
        }
    },
    /** 以下はプライベートメソッドのため、直接呼び出さないようにしてください。 */
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