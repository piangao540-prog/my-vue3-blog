<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { User, Message, MapLocation } from '@element-plus/icons-vue'
import portrait from '@/assets/images/portrait.png'
import { getTechStack, getContactInfo } from '@/api/index'

const techStack = ref<{ name: string }[]>([])
const contactInfo = ref<{ icon: string; text: string; link: string }[]>([])

const iconMap: Record<string, unknown> = {
  User,
  Message,
  MapLocation,
}

onMounted(async () => {
  try {
    techStack.value = await getTechStack()
    contactInfo.value = await getContactInfo()
  } catch (error) {
    console.error('Failed to load data:', error)
  }
})
</script>

<template>
  <footer class="blog-footer">
    <div class="footer-content">
      <div class="footer-section about-section">
        <div class="avatar-wrapper">
          <el-avatar :size="60" :src="portrait"></el-avatar>
        </div>
        <h3>PianGao</h3>
        <p class="bio">前端开发者 | 技术爱好者</p>
        <div class="contact-links">
          <a v-for="contact in contactInfo" :key="contact.text" :href="contact.link" class="contact-link"
            target="_blank" rel="noopener noreferrer">
            <el-icon :size="18">
              <component :is="iconMap[contact.icon]" />
            </el-icon>
            <span>{{ contact.text }}</span>
          </a>
        </div>
      </div>

      <div class="footer-section tech-section">
        <h4>技术栈</h4>
        <div class="tech-tags">
          <el-tag v-for="tech in techStack" :key="tech.name" type="info" effect="plain" class="tech-tag">
            {{ tech.name }}
            <!-- <span class="tech-level">{{ tech.level }}</span> -->
          </el-tag>
        </div>
      </div>

      <div class="footer-section links-section">
        <h4>快速链接</h4>
        <ul class="quick-links">
          <li>
            <RouterLink to="/">首页</RouterLink>
          </li>
          <li>
            <RouterLink to="/articles">文章列表</RouterLink>
          </li>
          <li>
            <RouterLink to="/archive">归档</RouterLink>
          </li>
          <li>
            <RouterLink to="/about">关于我</RouterLink>
          </li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p>© 2026 PianGao. All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
.blog-footer {
  background-color: #1f2937;
  color: #9ca3af;
  padding: 40px 20px;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  justify-content: center;
}

.footer-section {
  flex: 1;
  min-width: 200px;
  max-width: 300px;
}

.about-section {
  text-align: center;
}

.avatar-wrapper {
  margin-bottom: 12px;
}

.about-section h3 {
  color: #fff;
  margin: 0 0 8px 0;
  font-size: 18px;
}

.bio {
  margin: 0 0 16px 0;
  font-size: 14px;
}

.contact-links {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.contact-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #9ca3af;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.contact-link:hover {
  color: #3b82f6;
}

.tech-section h4,
.links-section h4 {
  color: #fff;
  margin: 0 0 16px 0;
  font-size: 16px;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-tag {
  font-size: 13px;
  padding: 4px 10px;
}

/* .tech-level {
  margin-left: 6px;
  opacity: 0.7;
} */

.quick-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.quick-links li {
  margin-bottom: 8px;
}

.quick-links a {
  color: #9ca3af;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.quick-links a:hover {
  color: #3b82f6;
}

.footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 20px;
  border-top: 1px solid #374151;
  text-align: center;
  font-size: 13px;
}
</style>