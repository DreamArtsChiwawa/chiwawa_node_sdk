const ChiwawaService = require('../index');

var req = {
  body: {
    companyId: "abc"
  }
};

console.log(ChiwawaService.getCompanyId(req));