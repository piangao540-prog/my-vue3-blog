export function throttle<TArgs extends unknown[], TReturn>(
    fn: (...args: TArgs) => TReturn,
    delay: number,
) {
    let lastTimer: number | null = null
    return function (this: unknown, ...args: TArgs) {
        const now = Date.now()
        if (lastTimer === null || now - lastTimer > delay) {
            lastTimer = now
            return fn.apply(this, args)
        }
    }
}
