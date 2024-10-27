import {describe, expect, it} from '@jest/globals'
import { ff, mat } from '../dy'
import mod from '../mod'
// import * as fs from 'fs'

it('mod', () => {
    const pre = './'
    const do_ = ff(pre+'main.dy').get()
    const to_ = ff(pre+'main.py.cop').get()
    const new_code = mod(
        do_,
        /^([^\n\w]*?|)([^\n\s\t<>]*?)<(.*?)> = \((.*?)\) => {(.*?)\n(\t*|\s*)}/ms
    ).set((match_: any, code: any) => {
        code = code.replace(
            match_[0],
            mat(match_, '$1def $2($4) -> $3:') + match_[5]
        )
        console.log(match_[0])
        console.log(match_[5])
        console.log(code)
        return code
    })
    ff(pre+'main.py').put(new_code)
    expect(new_code).toBe(to_);
})


