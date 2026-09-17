export const useStreamText = (onFlush: (text: string) => void) => {
  let pending = ''
  let refid: number | null = null

  const flush = () => {
    if (refid !== null) {
      cancelAnimationFrame(refid)
      refid = null
    }
    onFlush(pending)
  }

  const push = (full: string) => {
    pending = full
    if (refid === null) {
      refid = requestAnimationFrame(() => {
        refid = null
        onFlush(pending)
      })
    }
  }

  const reset = () => {
    if (refid !== null) {
      cancelAnimationFrame(refid)
      refid = null
    }
    pending = ''
  }

  return { push, flush, reset }
}
