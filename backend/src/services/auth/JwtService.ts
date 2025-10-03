const config = require("../../config/auth");

module.exports = {
  sign: (payload) => config.sign(payload),
  verify: (token) => config.verify(token),
};
