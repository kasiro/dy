
class mod_ {
    public regex_: any;
    public code: any;
    
    constructor(code: any, regex_: any) {
        this.code = code
        this.regex_ = regex_
    }

    public set(callback: any){
        if (this.regex_.test(this.code)) {
            console.log('matched: ' + this.regex_)
            let match_;
            while ((match_ = this.regex_.exec(this.code)) !== null) {
                this.code = callback(match_, this.code)
            }
            return this.code
        }
        console.log('not found: ' + this.regex_)
        return this.code
    }

}

const mod = (code: any, regex_: any) => new mod_(code, regex_)

export default mod
