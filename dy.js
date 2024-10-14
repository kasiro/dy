"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mod_1 = require("./mod");
var fs_1 = require("fs");
var ff_ = /** @class */ (function () {
    function ff_(path) {
        this.path = path;
    }
    ff_.prototype.get = function () {
        return (0, fs_1.readFileSync)(this.path, 'utf-8');
    };
    return ff_;
}());
var ff = function (path) { return new ff_(path); };
var dy_ = /** @class */ (function () {
    function dy_(path) {
        this.path = path;
        this.code = ff(path).get();
    }
    dy_.prototype.getCode = function () {
        return this.code;
    };
    dy_.prototype.get = function (code) {
        this.code = code;
    };
    return dy_;
}());
var dy = function (path) { return new dy_(path); };
var mat = function (match_, to_) {
    var c_ = match_.length - 2;
    for (var i = 1; i <= c_; i++) {
        to_ = to_.replace('$' + i, match_[i]);
    }
    return to_;
};
var new_code = (0, mod_1.default)(dy('../main.dy').getCode(), /= ([^()]*?) => ([^{}\n]*)/).set(function (match_, code) {
    code = code.replace(match_[0], mat(match_, '= lambda $1: $2'));
    return code;
});
new_code = (0, mod_1.default)(new_code, /, ([^()]*?) => ([^{}()]*)/).set(function (match_, code) {
    code = code.replace(match_[0], mat(match_, ', lambda $1: $2'));
    return code;
});
new_code = (0, mod_1.default)(new_code, 
// @ts-ignore
/^([^\n\w]*?|)([^\n\s\t<>]*?)<(.*?)> = \((.*?)\) => {(.*?)\n(\t*|\s*)}/ms).set(function (match_, code) {
    code = code.replace(match_[0], mat(match_, '$1def $2($4) -> $3:$5'));
    return code;
});
new_code = (0, mod_1.default)(new_code, 
// @ts-ignore
/^([^\n\w]*?|)([^\n\s\t]*?) = \((.*?)\) => {(.*?)\n(\t*|\s*)}/ms).set(function (match_, code) {
    code = code.replace(match_[0], mat(match_, '$1def $2($3):$4'));
    return code;
});
// new_code = mod(
//     new_code,
//     // @ts-ignore
//     /, ([\w_]*?)\((.*?)\) => {(.*?)\n}/gms
// ).set((match_: any, code: any) => {
//     code = code.replace(
//         mat(match_, '#def $1'),
//         mat(match_, 'def $1($2):$3')
//     )
//     code = code.replace(
//         match_[0],
//         mat(match_, ', $1')
//     )
//     console.log(code)
//     return code
// })
// TODO: Отдебажить
// new_code = mod(
//     new_code,
//     // @ts-ignore
//     /\(([\w_]*?)\((.*?)\) => {(.*?)\n}/ms
// ).set((match_: any, code: any) => {
//     code = code.replace(
//         mat(match_, '#def $1'),
//         mat(match_, 'def $1($2):$3')
//     )
//     code = code.replace(
//         match_[0],
//         mat(match_, '($1')
//     )
//     // console.log(match_[3])
//     console.log(code)
//     return code
// })
dy('../main.dy').get(new_code);
