export function debounce(func: Function, delay: number): Function {
    let timer: NodeJS.Timeout | null
    return function (...args: any[]) {
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            func(...args)
        }, delay)
    }
}