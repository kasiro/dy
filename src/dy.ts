import * as fs from 'fs';
import { join } from 'path';
import { exit, cwd } from 'process';
import { exec } from 'child_process';

// @ts-ignore
const error_handler = (error, stderr) => {
    if (error) {
        console.log(error.message)
        return true
    }
    if (stderr) {
        console.error(`Stderr: ${stderr}`)
        return true
    }
    return false
}
const exec_ = (command: string) => {
    exec(command, (error, stdout, stderr) => {
        if (error_handler(error, stderr) === false) {
            console.log(stdout);
        }
    })
}

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
        const ext = path.substring(path.length - 2)
        if (ext === 'dy') {
            this.path = path;
            this.code = ff(path).get()
        } else {
            console.error('file extension is not .dy has a .' + ext)
            exit()
        }
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

const mat = (from_: string, to_: object) => {
    for (const key in to_) {
        // @ts-ignore
        const val: string = to_[key]
        from_ = from_.replace(key, val)
    }
    return from_
}
const args_: string[] = process.argv.slice(2)
const path_: string = args_[0]
const path_dy = join(cwd(), path_)
let new_code = dy(path_dy).getCode()
new_code = mod(
    new_code,
    /= ((?:\w*?)) => ([^{}\n]*)/
)((regex_: any, code: string) => {
    let match_;
    while ((match_ = regex_.exec(code)) !== null) {
        if (match_[1].length <= 0 || match_[2].length <= 0){
            return code
        }
        code = code.replace(
            regex_,
            '= lambda $1: $2'
        )
    }
    return code
})
new_code = mod(
    new_code,
    /\(\((.*?)\) => ([^{}]*?,)/
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
    /^([^\n\w]*?|)const ([^\n\s\t<>]*?) => {(.*?)\n(\s*|\t*)}/ms
)((regex_: any, code: string) => {
    while (regex_.test(code)) {
        code = code.replace(
            regex_,
            '$1def $2():$3'
        )
    }
    return code
})

new_code = mod(
    new_code,
    // @ts-ignore
    /^([^\n\w]*?|)const ([^\n\s\t<>]*?) = \((.*?)\)(: \w*?)? => {(.*?)\n(\s*|\t*)}/ms
)((regex_: any, code: string) => {
    let match_;
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
    /\(([\w_]*?)\(([^*\.]*?)\)(: \w*?)? => {(.*?)\n}/ms
)((regex_: any, code: string) => {
    let match_;
    while ((match_ = regex_.exec(code)) !== null) {
        const name = match_[1]
        const args = match_[2]
        const body = match_[4]
        let returnType = match_[3]
        if (returnType === undefined){
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
        } else {
            returnType = returnType.substring(
                2, returnType.length
            )
            code = code.replace(
                mat('#def $1', {
                    '$1': name
                }),
                mat('def $1($2) -> $4:$3', {
                    '$1': name,
                    '$2': args,
                    '$3': body,
                    '$4': returnType
                })
            )
        }
        code = code.replace(
            match_[0],
            mat('($1', { '$1': name })
        )
    }
    return code
})


dy(path_dy).put(new_code)

if (args_.length > 1) {
    if (args_.includes('-e')) {
        const path_py = path_dy.substring(0, path_dy.length - 3) + '.py'
        exec_('python ' + path_py)
    }
}

// export default ff;
