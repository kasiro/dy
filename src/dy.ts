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
    protected code: string;

    public constructor(path: string) {
        this.path = path;
        this.code = ff(path).get()
    }
    
    public getCode(){
        return this.code
    }

    public put(code: string) {
        const path = this.path.substring(0, this.path.length - 3)
        ff(`${path}.py`).put(code)
    }

}

const dy = (path: string) => new dy_(path)

const mod = (code: string, regex_: any) => {
    return (callback: any) => {
        return callback(regex_, code)
    }
}
let new_code = dy('../../main.dy').getCode()
new_code = mod(
    new_code,
    /= ([^()]*?) => ([^{}\n]*)/
)((regex_: any, code: string) => {
    while (regex_.test(code)) {
        code = code.replace(
            regex_,
            '= lambda $1: $2'
        )   
    }
    return code
})
new_code = mod(
    new_code,
    /\(\((.*?)\) => ([^{}()]*?,)/
)((regex_: any, code: string) => {
    while (regex_.test(code)) {
        code = code.replace(
            regex_,
            '(lambda $1: $2'
        )
    }
    return code
})
new_code = mod(
    new_code,
    /, ([^()]*?) => ([^{}()]*)/
)((regex_: any, code: string) => {
    while (regex_.test(code)) {
        code = code.replace(
            regex_,
            ', lambda $1: $2'
        )
    }
    return code
})
new_code = mod(
    new_code,
    // @ts-ignore
    /^([^\n\w]*?|)([^\n\s\t<>]*?) = \((.*?)\)(: \w*?)? => {(.*?)\n(\s*|\t*)}/ms
)((regex_: any, code: string) => {
    let match_;
    const mat = (from_: string, to_: object) => {
        for (const key in to_) {
            // @ts-ignore
            const val: string = to_[key]
            from_ = from_.replace(key, val)
        }
        return from_
    }
    while ((match_ = regex_.exec(code)) !== null) {
        if (match_[4] === undefined) {
            code = code.replace(
                regex_,
                '$1def $2($3):$5'
            )
        } else {
            match_[4] = match_[4].substring(
                2, match_[4].length
            )
            code = code.replace(
                regex_,
                mat('$1def $2($3) -> $4:$5', {
                    '$4': match_[4]
                })
            )
        }
    }
    return code
})
new_code = mod(
    new_code,
    // @ts-ignore
    /, ([\w_]*?)\(([^*\.]*?)\) => {(.*?)\n}/ms
)((regex_: any, code: string) => {
    let match_;
    const mat = (from_: string, to_: object) => {
        for (const key in to_) {
            // @ts-ignore
            const val: string = to_[key]
            from_ = from_.replace(key, val)
        }
        return from_
    }
    while ((match_ = regex_.exec(code)) !== null) {
        const name = match_[1]
        const args = match_[2]
        const body = match_[3]
        code = code.replace(
            mat('#def $1', {
                '$1': name
            }),
            mat('def $1($2):$3', {
                '$1': name,
                '$2': args,
                '$3': body
            })
        )
        code = code.replace(
            match_[0],
            mat(', $1', {
                '$1': name
            })
        )
    }
    return code
})

new_code = mod(
    new_code,
    // @ts-ignore
    /\(([\w_]*?)\(([^*\.]*?)\) => {(.*?)\n}/ms
)((regex_: any, code: string) => {
    let match_;
    const mat = (from_: string, to_: object) => {
        for (const key in to_) {
            // @ts-ignore
            const val: string = to_[key]
            from_ = from_.replace(key, val)
        }
        return from_
    }
    while ((match_ = regex_.exec(code)) !== null) {
        const name = match_[1]
        const args = match_[2]
        const body = match_[3]
        code = code.replace(
            mat('#def $1', {
                '$1': name
            }),
            mat('def $1($2):$3', {
                '$1': name,
                '$2': args,
                '$3': body
            })
        )
        code = code.replace(
            match_[0],
            mat('($1', { '$1': name })
        )
    }
    return code
})

// console.log(new_code)

dy('../../main.dy').put(new_code)
export default ff;
