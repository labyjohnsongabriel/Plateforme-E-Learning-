"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
module.exports = {
    formatDate: (date) => moment(date).format("YYYY-MM-DD HH:mm:ss"),
    isOlderThanDays: (date, days) => moment().diff(moment(date), "days") > days,
};
//# sourceMappingURL=dateUtils.js.map