'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Start_time = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Start_time = exports.Start_time = new Date();

var AppRouter = function () {
    function AppRouter(app) {
        _classCallCheck(this, AppRouter);

        this.app = app;

        this.setupRouter = this.setupRouter.bind(this);

        this.setupRouter();
    }

    _createClass(AppRouter, [{
        key: 'setupRouter',
        value: function setupRouter() {

            var app = this.app;

            console.log('App Router works');

            //endpoint:'/'
            //get request

            app.get('/', function (req, res, next) {
                return res.json({
                    started: (0, _moment2.default)(Start_time).fromNow()
                });
            });

            //endpoint: /api/users
            //post request

            app.post('/api/users', function (req, res, next) {

                var body = req.body;

                app.models.user.create(body).then(function (user) {

                    return res.status(200).json(user);
                }).catch(function (err) {

                    return res.status(503).json({ 'error': err });
                });
            });
        }
    }]);

    return AppRouter;
}();

exports.default = AppRouter;
//# sourceMappingURL=app-router.js.map