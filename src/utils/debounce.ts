export function debounce<TArgs extends unknown[]>(func: (...args: TArgs) => void, delay: number) {
  let timer: ReturnType<typeof setTimeout> | null
  return function (...args: TArgs) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func(...args)
    }, delay)
  }
}
