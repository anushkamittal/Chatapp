"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var isEmail = exports.isEmail = function isEmail(email) {

    var re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return re.test(email);
};
//# sourceMappingURL=helper.js.map