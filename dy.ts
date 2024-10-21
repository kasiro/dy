import mod from './mod';
import { readFileSync } from 'fs';

class ff_ {
    path: string;

    public constructor(path: string){
        this.path = path
    }

    public get(){
        return readFileSync(this.path, 'utf-8')
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

    public get(code: any) {
        this.code = code
    }

}

const dy = (path: string) => new dy_(path)

const mat = (match_: any, to_: string) => {
    const c_ = match_.length - 2
    for (let i = 1; i <= c_; i++){
        to_ = to_.replace(
            '$' + i,
            match_[i]
        )
    }
    return to_
}

let new_code = mod(
    dy('../main.dy').getCode(),
    /= ([^()]*?) => ([^{}\n]*)/
).set((match_: any, code: any) => {
    code = code.replace(
        match_[0],
        mat(match_, '= lambda $1: $2')
    )
    return code
})
new_code = mod(
    new_code,
    /, ([^()]*?) => ([^{}()]*)/
).set((match_: any, code: any) => {
    code = code.replace(
        match_[0],
        mat(match_, ', lambda $1: $2')
    )
    return code
})
new_code = mod(
    new_code,
    // @ts-ignore
    /^([^\n\w]*?|)([^\n\s\t<>]*?)<(.*?)> = \((.*?)\) => {(.*?)\n(\t*|\s*)}/ms
).set((match_: any, code: any) => {
    code = code.replace(
        match_[0],
        mat(match_, '$1def $2($4) -> $3:$5')
    )
    return code
})
new_code = mod(
    new_code,
    // @ts-ignore
    /^([^\n\w]*?|)([^\n\s\t]*?) = \((.*?)\) => {(.*?)\n(\t*|\s*)}/ms
).set((match_: any, code: any) => {
    code = code.replace(
        match_[0],
        mat(match_, '$1def $2($3):$4')
    )
    // console.log(code)
    return code
})
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

// TODO: Отдебажить: неправильно захватывает
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

dy('../main.dy').get(new_code)
