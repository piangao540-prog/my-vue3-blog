export function debounce(func: Function, delay: number): Function {
    let timer: number | null
    return function (...args: any[]) {
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            func(...args)
        }, delay)
    }
}