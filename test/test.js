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
          console.log("OK");
        }
        done();
      });
    });
  });
  describe('sendMessageRawData', function() {
    it('正常系', function(done) {
      const content = ChiwawaService.MessageDataBuilder.newMessageDataWithText("SDK単体テスト　sendMessageRawData");
      ChiwawaService.sendMessageRawData(getRequest(), content, function(err, httpResponse, body) {
        if (err) {
          assert.fail(err);
        } else {
          console.log("OK");
        }
        done();
      });
    });
  });

});

