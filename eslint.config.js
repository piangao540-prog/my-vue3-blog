import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },
  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/coverage/**', 'server/**', 'api/**'],
  },
  js.configs.recommended,
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  {
    // 视图由路由加载，不会作为标签写进模板，多词组件名规则在这里不适用
    name: 'app/views-allow-single-word-names',
    files: ['src/views/**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    // any 的修复成本远高于收益，降级为 warning，不阻塞 CI
    name: 'app/rule-tweaks',
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  skipFormatting,
)
