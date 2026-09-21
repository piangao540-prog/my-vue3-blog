import { ref, computed } from 'vue'

export interface Track {
  title: string
  artist: string
  src: string
  /** 封面图，以 / 开头指向 public 下的文件；播放面板拿它当背景 */
  cover: string
}

let audio: HTMLAudioElement | null = null

const playlist = ref<Track[]>([])
const currentIndex = ref(0)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.6)

let dragging = false

const currentTrack = computed(() => playlist.value[currentIndex.value] ?? null)

const load = (autoplay = true) => {
  if (!audio) return
  const track = currentTrack.value
  if (!track) return

  audio.src = track.src
  currentTime.value = 0
  duration.value = 0

  if (autoplay) {
    audio.play().then(
      () => {
        isPlaying.value = true
      },
      () => {
        isPlaying.value = false
      },
    )
  }
}

const initAudio = () => {
  if (audio) return audio
  audio = new Audio()
  audio.volume = volume.value

  audio.addEventListener('loadedmetadata', () => {
    duration.value = audio!.duration || 0
  })

  audio.addEventListener('timeupdate', () => {
    if (!dragging) currentTime.value = audio!.currentTime
  })

  audio.addEventListener('ended', () => {
    next()
  })
  return audio
}

const toggle = () => {
  if (!audio) return
  if (isPlaying.value) {
    audio.pause()
    isPlaying.value = false
  } else {
    audio.play().then(
      () => {
        isPlaying.value = true
      },
      () => {
        isPlaying.value = false
      },
    )
  }
}

const next = () => {
  if (!playlist.value.length) return
  currentIndex.value = (currentIndex.value + 1) % playlist.value.length
  load()
}

const prev = () => {
  if (!playlist.value.length) return
  currentIndex.value = (currentIndex.value - 1 + playlist.value.length) % playlist.value.length
  load()
}

const seek = (v: number) => {
  if (!audio) return
  audio.currentTime = v
  currentTime.value = v
}

const setVolume = (v: number) => {
  volume.value = v
  if (audio) audio.volume = v
  localStorage.setItem('music-volume', String(v))
}

export const useAudioPlayer = () => {
  const start = (tracks: Track[]) => {
    if (!playlist.value.length) playlist.value = tracks
    const a = initAudio()
    const saved = Number(localStorage.getItem('music-volume'))
    if (saved > 0 && saved <= 1) {
      volume.value = saved
      a.volume = saved
    }
    if (!a.src) load(false)
  }

  return {
    playlist,
    currentIndex,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    start,
    toggle,
    next,
    prev,
    seek,
    setVolume,
    setDragging: (v: boolean) => {
      dragging = v
    },
  }
}
