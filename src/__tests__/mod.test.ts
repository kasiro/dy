import {describe, expect, it} from '@jest/globals'
import { ff, mat } from '../dy'
import mod from '../mod'
// import * as fs from 'fs'

it('mod', () => {
    const pre = './'
    const from_ = ff(pre+'main.dy').get()
    const to_ = ff(pre+'main.py.cop').get()
    const do_ = mod(
        from_,
        // /^([^\n\w]*?|)([^\n\s\t<>]*?)<(.*?)> = \((.*?)\) => {(.*?)\n(\t*|\s*)}/ms
        /^([^\n\w]*?|)([^\n\s\t<>]*?)<(.*?)> = \((.*?)\) => {(.*?)\n}/ms
    ).set((match_: any, code: string) => {
        console.log(match_)
        console.log(code == match_[0])
        code = code.replace(
            match_[0],
            mat(match_, '$1def $2($4) -> $3:') + match_[5]
        )
        console.log(match_[0])
        console.log(match_[5])
        console.log(code)
        return code
    })
    ff(pre+'main.py').put(do_)
    expect(do_).toBe(to_);
})


