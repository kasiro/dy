"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mod_ = /** @class */ (function () {
    function mod_(code, regex_) {
        this.code = code;
        this.regex_ = regex_;
    }
    mod_.prototype.set = function (callback) {
        if (this.regex_.test(this.code)) {
            console.log('matched: ' + this.regex_);
            var match_ = void 0;
            while ((match_ = this.regex_.exec(this.code)) !== null) {
                this.code = callback(match_, this.code);
            }
            return this.code;
        }
        console.log('not found: ' + this.regex_);
        return this.code;
    };
    return mod_;
}());
var mod = function (code, regex_) { return new mod_(code, regex_); };
exports.default = mod;
