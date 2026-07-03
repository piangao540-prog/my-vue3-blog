export function throttle(fn: Function, delay: number) {
    let lastTimer: number | null = null
    return function (this: any, ...args: any[]) {
        const now = Date.now()
        if (lastTimer === null || now - lastTimer > delay) {
            lastTimer = now
            return fn.apply(this, args)
        }
    }
}