'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mongodb = require('mongodb');

var _promisePolyfill = require('promise-polyfill');

var _promisePolyfill2 = _interopRequireDefault(_promisePolyfill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//const URL = 'mongodb://anushka3:anushka3@ds137862.mlab.com:37862/chatapp';
var URL = 'mongodb://localhost:27017/chatapp';

var Database = function () {
    function Database() {
        _classCallCheck(this, Database);
    }

    _createClass(Database, [{
        key: 'connect',
        value: function connect() {

            return new _promisePolyfill2.default(function (resolve, reject) {

                _mongodb.MongoClient.connect(URL, { useNewUrlParser: true }, function (err, db) {

                    return err ? reject(err) : resolve(db);
                });
            });
        }
    }]);

    return Database;
}();

exports.default = Database;
//# sourceMappingURL=database.js.map