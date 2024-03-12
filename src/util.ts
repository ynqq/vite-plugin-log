/**
 * #ynqq.log
 * @param fun 
 * @returns 
 */
export const useLoading = (fun: any) => {
    const data = [1,2,3,4]
    if(data.length){
        const laster = data.pop()
    }
    return fun
}


// #ynqq.log
export function useLoading2 (fun: any) {
    const data = [1,2,3,4]
    if(data.length){
        const laster = data.pop()
    }
    return fun
}