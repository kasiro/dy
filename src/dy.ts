import mod from './mod';
import * as fs from 'fs';

class ff_ {
    path: string;

    public constructor(path: string) {
        this.path = path
    }

    public get() {
        return fs.readFileSync(this.path, 'utf-8')
    }

    public put(text: any) {
        fs.writeFileSync(this.path, text, {
            flag: 'w'
        })
    }
}

const ff = (path: string) => new ff_(path)

class dy_ {
    protected path: string;
    protected code: any;

    public constructor(path: string) {
        this.path = path;
        this.code = ff(path).get()
    }
    
    public getCode(){
        return this.code
    }

    public put(code: any) {
        const path = this.path.substring(0, this.path.length - 3)
        ff(`${path}.py`).put(code)
    }

}

const dy = (path: string) => new dy_(path)

const count_ = (str: string, searchValue: string) => {
    let count = 0, i = 0;
    while (true) {
        const r = str.indexOf(searchValue, i);
        if (r !== -1) [count, i] = [count + 1, r + 1];
        else return count;
    }
};

const mat = (match_: any, to_: string) => {
    const c_ = count_(to_, '$')
    for (let i = 1; i <= c_; i++){
        to_ = to_.replace('$'+i, match_[i])
    }
    return to_
}
let new_code = dy('../../main.dy').getCode()
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

dy('../../main.dy').put(new_code)
export {
    ff,
    count_,
    mat
};
