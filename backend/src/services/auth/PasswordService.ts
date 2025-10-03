const bcrypt = require("bcrypt");

module.exports = {
  hash: async (password) => bcrypt.hash(password, 10),
  compare: async (candidate, hash) => bcrypt.compare(candidate, hash),
};

