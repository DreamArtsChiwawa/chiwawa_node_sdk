var assert = require("assert")
const ChiwawaService = require('../index');

const VALIDATION_TOKEN = "TEST_TOKEN";
const API_TOKEN = "YOUR_API_TOKEN";
const TEST_COMPANY_ID = "YOURC|_COMPANY_ID";
const TEST_GROUP_ID = "YOUR_GROUP_ID";

process.env["CHIWAWA_VALIDATION_TOKEN"] = VALIDATION_TOKEN;
process.env["CHIWAWA_API_TOKEN"] = API_TOKEN;

function getRequest() {
  return {
    headers: {'x-chiwawa-webhook-token': VALIDATION_TOKEN},
    body: {
      companyId: TEST_COMPANY_ID,
      type: "message",
      message: {
        groupId: TEST_GROUP_ID,
        text: "TEST_MESSAGE"
      }
    }
  };
}

describe('ChiwawaServiceのテスト', function() {
  describe('isValidRequest', function() {
    it('正しくトークン、bodyが設定されている場合', function() {
      assert.equal(ChiwawaService.isValidRequest(getRequest()), true);
    });  
    it('トークンが不正、bodyが正しく設定されている場合', function() {
      let newReq = getRequest();
      newReq.headers = null;
      assert.equal(ChiwawaService.isValidRequest(newReq), false);
    });  
    it('トークンが正しく、bodyが不正の場合', function() {
      let newReq = getRequest();
      newReq.body = null;
      assert.equal(ChiwawaService.isValidRequest(newReq), false);
    });  
    it('トークン、bodyともに不正の場合', function() {
      let newReq = getRequest();
      assert.equal(ChiwawaService.isValidRequest(getRequest()), true);
      newReq.headers = null;
      newReq.body = null;
      assert.equal(ChiwawaService.isValidRequest(newReq), false);
    });  
  });

  describe('getCompanyId', function() {
    it('正常系', function() {
      assert.equal(ChiwawaService.getCompanyId(getRequest()), TEST_COMPANY_ID);
    });
    it('companyIdがnull', function() {
      let newReq = getRequest();
      newReq.body.companyId = null;
      assert.equal(ChiwawaService.getCompanyId(newReq), "");
    });
    it('bodyがnull', function() {
      let newReq = getRequest();
      newReq.body = null;
      assert.equal(ChiwawaService.getCompanyId(newReq), "");
    });  
    it('requestがnull', function() {
      assert.equal(ChiwawaService.getCompanyId(null), "");
    });    
  });
  describe('getGroupId', function() {
    it('正常系', function() {
      assert.equal(ChiwawaService.getGroupId(getRequest()), TEST_GROUP_ID);
    });
    it('groupIdがnull', function() {
      let newReq = getRequest();
      newReq.body.message.groupId = null;
      assert.equal(ChiwawaService.getGroupId(newReq), "");
    });
    it('messageがnull', function() {
      let newReq = getRequest();
      newReq.body.message = null;
      assert.equal(ChiwawaService.getGroupId(newReq), "");
    });  
    it('bodyがnull', function() {
      let newReq = getRequest();
      newReq.body = null;
      assert.equal(ChiwawaService.getGroupId(newReq), "");
    });  
    it('requestがnull', function() {
      assert.equal(ChiwawaService.getGroupId(null), "");
    });    
  });
  describe('getMessageText', function() {
    it('正常系', function() {
      assert.equal(ChiwawaService.getMessageText(getRequest()), "TEST_MESSAGE");
    });
    it('textがnull', function() {
      let newReq = getRequest();
      newReq.body.message.text = null;
      assert.equal(ChiwawaService.getMessageText(newReq), "");
    });
    it('messageがnull', function() {
      let newReq = getRequest();
      newReq.body.message = null;
      assert.equal(ChiwawaService.getMessageText(newReq), "");
    });  
    it('bodyがnull', function() {
      let newReq = getRequest();
      newReq.body = null;
      assert.equal(ChiwawaService.getMessageText(newReq), "");
    });  
    it('requestがnull', function() {
      assert.equal(ChiwawaService.getMessageText(null), "");
    });    
  });

  describe('sendMessage', function() {
    it('正常系', function(done) {
      ChiwawaService.sendMessage(getRequest(), "SDK単体テスト　sendMessage", function(err, httpResponse, body) {
        if (err) {
          assert.fail(err);
        } else {
          assert.equal(httpResponse.statusCode, 200);
        }
        done();
      });
    });
    it('メッセージが空', function(done) {
      ChiwawaService.sendMessage(getRequest(), null, function(err, httpResponse, body) {
        if (err) {
          assert.fail(err);
        } else {
          assert.equal(httpResponse.statusCode, 200);
        }
        done();
      });
    });
    it('APIトークンが間違い', function(done) {
      process.env["CHIWAWA_API_TOKEN"] = "invalid_token";
      ChiwawaService.sendMessage(getRequest(), "SDK単体テスト　sendMessage　トークン間違い", function(err, httpResponse, body) {
        assert.equal(httpResponse.statusCode, 401);
        process.env["CHIWAWA_API_TOKEN"] = API_TOKEN;
        done();
      });
    });
  });
  describe('sendMessageRawData', function() {
    it('正常系　テキスト送信', function(done) {
      const content = ChiwawaService.MessageDataBuilder.newMessageDataWithText("SDK単体テスト　sendMessageRawData");
      ChiwawaService.sendMessageRawData(getRequest(), content, function(err, httpResponse, body) {
        if (err) {
          assert.fail(err);
        } else {
          assert.equal(httpResponse.statusCode, 200);
        }
        done();
      });
    });
    it('正常系　テキストアタッチメントを送信', function(done) {
      const content = ChiwawaService.MessageDataBuilder.newMessageDataWithTextAttachment("SDK単体テスト　sendMessageRawData　テキストアタッチメントを送信（プレーンテキスト）", "アタッチメントタイトル", "アタッチメントの本文。\n本文2行目。");
      ChiwawaService.sendMessageRawData(getRequest(), content, function(err, httpResponse, body) {
        if (err) {
          assert.fail(err);
        } else {
          assert.equal(httpResponse.statusCode, 200);
        }
        done();
      });
    });
    it('正常系　テキストアタッチメントを送信（HTML）', function(done) {
      const content = ChiwawaService.MessageDataBuilder.newMessageDataWithTextAttachment("SDK単体テスト　sendMessageRawData　テキストアタッチメントを送信（HTML）", "アタッチメントタイトル", "アタッチメントの本文。<BR>本文2行目。<BR><a href='https://www.chiwawa.one'>リンク</a>", "html");
      ChiwawaService.sendMessageRawData(getRequest(), content, function(err, httpResponse, body) {
        if (err) {
          assert.fail(err);
        } else {
          assert.equal(httpResponse.statusCode, 200);
        }
        done();
      });
    });
    it('正常系　テキストアタッチメントを送信（MD）', function(done) {
      const content = ChiwawaService.MessageDataBuilder.newMessageDataWithTextAttachment("SDK単体テスト　sendMessageRawData　テキストアタッチメントを送信（MD）", "アタッチメントタイトル", "# 見出し1\n## 見出し2\n### 見出し3\n- 箇条書き1\n- 箇条書き2\n- 箇条書き3\n\n|タイトル1|タイトル2|\n|---|---|\n|中身1|中身2|", "md");
      ChiwawaService.sendMessageRawData(getRequest(), content, function(err, httpResponse, body) {
        if (err) {
          assert.fail(err);
        } else {
          assert.equal(httpResponse.statusCode, 200);
        }
        done();
      });
    });

    it('正常系　テキストアタッチメントを送信（色、タグ、コメント欄の指定）', function(done) {
      const attachment = ChiwawaService.MessageDataBuilder.newTextAttachment("アタッチメントタイトル", "# 見出し1\n## 見出し2\n### 見出し3\n- 箇条書き1\n- 箇条書き2\n- 箇条書き3\n\n|タイトル1|タイトル2|\n|---|---|\n|中身1|中身2|", "md", "#ff0000", ["lock", "check"], "yes");
      const content = ChiwawaService.MessageDataBuilder.newMessageDataWithAttachments("SDK単体テスト　sendMessageRawData　テキストアタッチメントを送信（色、タグ、コメント欄の指定）", [attachment]);
      ChiwawaService.sendMessageRawData(getRequest(), content, function(err, httpResponse, body) {
        if (err) {
          assert.fail(err);
        } else {
          assert.equal(httpResponse.statusCode, 200);
        }
        done();
      });
    });

    it('正常系　テキストアタッチメントを複数送信（アクションの指定）', function(done) {
      const getAction = ChiwawaService.MessageDataBuilder.newTextAttachmentAction("GETボタン", null, null, "https://www.chiwawa.one", "get");
      const attachment1 = ChiwawaService.MessageDataBuilder.newTextAttachment("アタッチメントタイトル", "# 見出し1\n## 見出し2\n### 見出し3\n- 箇条書き1\n- 箇条書き2\n- 箇条書き3\n\n|タイトル1|タイトル2|\n|---|---|\n|中身1|中身2|", "md", "#ff0000", ["lock", "check"], "yes", [getAction]);
      const postAction = ChiwawaService.MessageDataBuilder.newTextAttachmentAction("POSTボタン", null, "detail", "https://www.chiwawa.one", "post", {}, "json");
      const attachment2 = ChiwawaService.MessageDataBuilder.newTextAttachment("アタッチメントタイトル", "# 見出し1\n## 見出し2\n### 見出し3\n- 箇条書き1\n- 箇条書き2\n- 箇条書き3\n\n|タイトル1|タイトル2|\n|---|---|\n|中身1|中身2|", "md", "#ff0000", ["lock", "check"], "yes", [postAction]);
      const content = ChiwawaService.MessageDataBuilder.newMessageDataWithAttachments("SDK単体テスト　sendMessageRawData　テキストアタッチメントを複数送信（アクションの指定）", [attachment1, attachment2]);
      ChiwawaService.sendMessageRawData(getRequest(), content, function(err, httpResponse, body) {
        if (err) {
          assert.fail(err);
        } else {
          assert.equal(httpResponse.statusCode, 200);
        }
        done();
      });
    });

  });

});

