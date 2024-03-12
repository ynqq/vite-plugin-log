export const config = {
    id: '#ynqq.log',
    log: {
        RETURN: "RETURN---",
        VARS: "VARS---"
    }
}

export const util = {
    prefix: '_ynqq_data_',
    getDataId(type: 'return' | 'var'){
        return `${this.prefix}${type}`
    },
    checkId(str: string){
        return new RegExp(config.id).test(str.trim())
    },
    checkVar(code: string){
        return code.includes(this.prefix)
    },
    logReturn(...args: any[]){
        console.log('RETURN---', ...args)
    },
    logVar(...args: any[]){
        console.log('VARS---', ...args)
    }
}
export const cache = new Set()