"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mat = exports.count_ = exports.ff = void 0;
var fs = require("fs");
var ff_ = /** @class */ (function () {
    function ff_(path) {
        this.path = path;
    }
    ff_.prototype.get = function () {
        return fs.readFileSync(this.path, 'utf-8');
    };
    ff_.prototype.put = function (text) {
        fs.writeFileSync(this.path, text, {
            flag: 'w'
        });
    };
    return ff_;
}());
var ff = function (path) { return new ff_(path); };
exports.ff = ff;
var dy_ = /** @class */ (function () {
    function dy_(path) {
        this.path = path;
        this.code = ff(path).get();
    }
    dy_.prototype.getCode = function () {
        return this.code;
    };
    dy_.prototype.put = function (code) {
        var path = this.path.substring(0, this.path.length - 3);
        ff("".concat(path, ".py")).put(code);
    };
    return dy_;
}());
var dy = function (path) { return new dy_(path); };
var count_ = function (str, searchValue) {
    var _a;
    var count = 0, i = 0;
    while (true) {
        var r = str.indexOf(searchValue, i);
        if (r !== -1)
            _a = [count + 1, r + 1], count = _a[0], i = _a[1];
        else
            return count;
    }
};
exports.count_ = count_;
var mat = function (match_, to_) {
    var c_ = count_(to_, '$');
    for (var i = 1; i <= c_; i++) {
        to_ = to_.replace('$' + i, match_[i]);
    }
    return to_;
};
exports.mat = mat;
var new_code = dy('../../main.dy').getCode();
// new_code = mod(
//     dy('../main.dy').getCode(),
//     /= ([^()]*?) => ([^{}\n]*)/
// ).set((match_: any, code: any) => {
//     code = code.replace(
//         match_[0],
//         mat(match_, '= lambda $1: $2')
//     )
//     return code
// })
// new_code = mod(
//     new_code,
//     /\(\((.*?)\) => ([^{}()]*?,)/
// ).set((match_: any, code: any) => {
//     code = code.replace(
//         match_[0],
//         mat(match_, '(lambda $1: $2')
//     )
//     return code
// })
// new_code = mod(
//     new_code,
//     /, ([^()]*?) => ([^{}()]*)/
// ).set((match_: any, code: any) => {
//     code = code.replace(
//         match_[0],
//         mat(match_, ', lambda $1: $2')
//     )
//     return code
// })
// new_code = mod(
//     new_code,
//     // @ts-ignore
//     /^([^\n\w]*?|)([^\n\s\t<>]*?)<(.*?)> = \((.*?)\) => {(.*?)\n(\t*|\s*|)}/ms
// ).set((match_: any, code: any) => {
//     code = code.replace(
//         match_[0],
//         mat(match_, '$1def $2($4) -> $3:$5')
//     )
//     return code
// })
// new_code = mod(
//     new_code,
//     // @ts-ignore
//     /^([^\n\w]*?|)([^\n\s\t]*?) = \((.*?)\) => {(.*?)\n(\t*|\s*)}/ms
// ).set((match_: any, code: any) => {
//     code = code.replace(
//         match_[0],
//         mat(match_, '$1def $2($3):$4')
//     )
//     // console.log(code)
//     return code
// })
// new_code = mod(
//     new_code,
//     // @ts-ignore
//     /, ([\w_]*?)\(([^*\.]*?)\) => {(.*?)\n}/ms
// ).set((match_: any, code: any) => {
//     code = code.replace(
//         mat(match_, '#def $1'),
//         mat(match_, 'def $1($2):$3')
//     )
//     code = code.replace(
//         match_[0],
//         mat(match_, ', $1')
//     )
//     // console.log(code)
//     return code
// })
//
// new_code = mod(
//     new_code,
//     // @ts-ignore
//     /\(([\w_]*?)\(([^*\.]*?)\) => {(.*?)\n}/ms
// ).set((match_: any, code: any) => {
//     code = code.replace(
//         mat(match_, '#def $1'),
//         mat(match_, 'def $1($2):$3')
//     )
//     code = code.replace(
//         match_[0],
//         mat(match_, '($1')
//     )
//     // console.log(match_)
//     // console.log(match_.length)
//     // console.log(match_.length - 2)
//     // console.log(code)
//     return code
// })
// console.log(new_code)
dy('../../main.dy').put(new_code);
