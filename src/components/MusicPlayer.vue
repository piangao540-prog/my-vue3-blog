<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { playlist as tracks } from '@/data/playlist'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { Headset, VideoPlay, VideoPause, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

const show = ref(false)
const {
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
  setDragging,
} = useAudioPlayer()

onMounted(() => start(tracks))

const coverUrl = computed(() =>
  currentTrack.value?.cover ? `url('${currentTrack.value.cover}')` : 'none',
)

const fmt = (s: number) => {
  if (!Number.isFinite(s)) return '00:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}
</script>

<template>
  <div class="music-player">
    <el-button
      class="music-trigger"
      :class="{ playing: isPlaying }"
      :icon="Headset"
      circle
      :title="isPlaying ? '正在播放' : '音乐'"
      @click="show = !show"
    />
    <transition name="fade">
      <div v-if="show" class="music-panel" :style="{ '--cover': coverUrl }">
        <div class="track-info">
          <div class="track-title">{{ currentTrack?.title ?? '暂无歌曲' }}</div>
          <div class="track-artist">{{ currentTrack?.artist }}</div>
        </div>

        <div class="progress-row">
          <span class="time">{{ fmt(currentTime) }}</span>
          <el-slider
            :model-value="currentTime"
            :show-tooltip="false"
            :max="duration || 1"
            @input="seek"
            @mousedown="setDragging(true)"
            @mouseup="setDragging(false)"
          />
          <span class="time">{{ fmt(duration) }}</span>
        </div>
        <div class="controls">
          <el-button :icon="ArrowLeft" circle @click="prev" />
          <el-button
            :icon="isPlaying ? VideoPause : VideoPlay"
            circle
            type="primary"
            @click="toggle"
          />
          <el-button :icon="ArrowRight" circle @click="next" />
        </div>
        <div class="volume-row">
          <!-- Element Plus 没有喇叭图标（Mute 画的是带斜杠的麦克风），手写一个 -->
          <svg
            class="volume-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
          <el-slider
            :model-value="volume"
            :max="1"
            :step="0.01"
            :show-tooltip="false"
            @input="setVolume"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.music-trigger {
  margin-left: 12px; /* 和 .theme-toggle 一致，否则两个图标按钮贴一起 */
  font-size: 18px; /* 图标大小跟着 font-size 走，不写就比月亮小一圈 */
}

.music-trigger.playing {
  color: #e86f83; /* 项目主题色，播放中时亮起来 */
}

.track-info {
  margin-bottom: 10px;
}

.track-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.track-artist {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
}

.music-panel {
  position: fixed;
  top: 68px;
  right: 20px;
  width: 300px;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  /* 渐变写在 url() 前面 = 盖在图片上层，拿它当半透明遮罩用。
     不能改 opacity，那会把面板里的文字一起弄透明，只能这样叠一层。 */
  /* 没有封面时的兜底色，否则面板会变成全透明 */
  background-color: #16162a;
  background-image:
    linear-gradient(rgba(18, 18, 32, 0), rgba(18, 18, 32, 0.72)), var(--cover, none);
  background-size: cover;
  background-position: center;
}

.progress-row,
.volume-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.volume-icon {
  width: 16px;
  height: 16px;
  color: rgba(255, 255, 255, 0.65);
  flex-shrink: 0;
}

.time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
  font-variant-numeric: tabular-nums; /* 数字等宽，秒数跳动时不会左右抖 */
  flex-shrink: 0;
}

/* el-slider 内部的 DOM 不带 scoped 属性，必须用 :deep() 才够得着 */
.music-panel :deep(.el-slider__runway) {
  background-color: rgba(255, 255, 255, 0.25);
}

.controls {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 12px 0;
}

html.dark .music-panel {
  /* 暗色下遮罩再压深一点，让面板比页面更沉 */
  background-image: linear-gradient(rgba(8, 8, 16, 0.85), rgba(8, 8, 16, 0.85)), var(--cover, none);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

@media (max-width: 768px) {
  .music-panel {
    top: 60px;
    left: 12px;
    right: 12px;
    width: auto; /* 小屏撑满，不然 300px 会溢出 */
  }
}
</style>
