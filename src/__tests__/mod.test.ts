import {describe, expect, it} from '@jest/globals'
import ff from '../dy'

it('mod', () => {
    const pre = './'
    const from_ = ff(pre+'main.dy').get()
    const to_ = ff(pre+'main.py.cop').get()
    const do_ = from_.replace(
        /^([^\n\w]*?|)([^\n\s\t]*?)<(.*?)> = \((.*?)\) => {(.*?)\n}/ms,
        '$1def $2($4) -> $3:$5'
    )
    ff(pre+'main.py').put(do_)
    expect(do_).toBe(to_);
})


