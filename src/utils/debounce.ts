export function debounce<TArgs extends unknown[]>(func: (...args: TArgs) => void, delay: number) {
  let timer: ReturnType<typeof setTimeout> | null
  const debounced = (...args: TArgs) => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func(...args)
      timer = null
    }, delay)
  }

  debounced.cancel = () => {
    if(timer){
      clearTimeout(timer)
    }
    timer = null
  }

  return debounced
}
