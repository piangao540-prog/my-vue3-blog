export function debounce(func: Function, delay: number): Function {
    let timer: ReturnType<typeof setTimeout> | null
    return function (...args: any[]) {
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            func(...args)
        }, delay)
    }
}