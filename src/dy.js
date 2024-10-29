"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
var mod = function (code, regex_) {
    return function (callback) {
        return callback(regex_, code);
    };
};
var new_code = dy('../../main.dy').getCode();
new_code = mod(new_code, /= ([^()]*?) => ([^{}\n]*)/)(function (regex_, code) {
    while (regex_.test(code)) {
        code = code.replace(regex_, '= lambda $1: $2');
    }
    return code;
});
new_code = mod(new_code, /\(\((.*?)\) => ([^{}()]*?,)/)(function (regex_, code) {
    while (regex_.test(code)) {
        code = code.replace(regex_, '(lambda $1: $2');
    }
    return code;
});
new_code = mod(new_code, /, ([^()]*?) => ([^{}()]*)/)(function (regex_, code) {
    while (regex_.test(code)) {
        code = code.replace(regex_, ', lambda $1: $2');
    }
    return code;
});
new_code = mod(new_code, 
// @ts-ignore
/^([^\n\w]*?|)([^\n\s\t<>]*?) = \((.*?)\)(: \w*?)? => {(.*?)\n(\s*|\t*)}/ms)(function (regex_, code) {
    var match_;
    var mat = function (from_, to_) {
        for (var key in to_) {
            // @ts-ignore
            var val = to_[key];
            from_ = from_.replace(key, val);
        }
        return from_;
    };
    while ((match_ = regex_.exec(code)) !== null) {
        if (match_[4] === undefined) {
            code = code.replace(regex_, '$1def $2($3):$5');
        }
        else {
            match_[4] = match_[4].substring(2, match_[4].length);
            code = code.replace(regex_, mat('$1def $2($3) -> $4:$5', {
                '$4': match_[4]
            }));
        }
    }
    return code;
});
new_code = mod(new_code, 
// @ts-ignore
/, ([\w_]*?)\(([^*\.]*?)\) => {(.*?)\n}/ms)(function (regex_, code) {
    var match_;
    var mat = function (from_, to_) {
        for (var key in to_) {
            // @ts-ignore
            var val = to_[key];
            from_ = from_.replace(key, val);
        }
        return from_;
    };
    while ((match_ = regex_.exec(code)) !== null) {
        var name_1 = match_[1];
        var args = match_[2];
        var body = match_[3];
        code = code.replace(mat('#def $1', {
            '$1': name_1
        }), mat('def $1($2):$3', {
            '$1': name_1,
            '$2': args,
            '$3': body
        }));
        code = code.replace(match_[0], mat(', $1', {
            '$1': name_1
        }));
    }
    return code;
});
new_code = mod(new_code, 
// @ts-ignore
/\(([\w_]*?)\(([^*\.]*?)\) => {(.*?)\n}/ms)(function (regex_, code) {
    var match_;
    var mat = function (from_, to_) {
        for (var key in to_) {
            // @ts-ignore
            var val = to_[key];
            from_ = from_.replace(key, val);
        }
        return from_;
    };
    while ((match_ = regex_.exec(code)) !== null) {
        var name_2 = match_[1];
        var args = match_[2];
        var body = match_[3];
        code = code.replace(mat('#def $1', {
            '$1': name_2
        }), mat('def $1($2):$3', {
            '$1': name_2,
            '$2': args,
            '$3': body
        }));
        code = code.replace(match_[0], mat('($1', { '$1': name_2 }));
    }
    return code;
});
// console.log(new_code)
dy('../../main.dy').put(new_code);
exports.default = ff;
