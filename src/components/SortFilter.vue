<script setup lang="ts">
import { useSort } from '@/composables/useSort'
import { ElButton, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

const { setSortDesc, currentSort, setSort, sortOptions } = useSort()

const handleSortChange = (option: typeof sortOptions[number]) => {
  setSort(option)
}
</script>

<template>
  <div class="sort-container">
    <el-dropdown trigger="click">
      <el-button link class="sort-button">
        <el-icon>
          <ArrowDown />
        </el-icon>
        {{ currentSort.label }}
        <el-icon class="el-icon-right">
          <ArrowDown />
        </el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="option in sortOptions" :key="option.key"
            :class="{ active: currentSort.key === option.key }" @click="handleSortChange(option)">
            {{ option.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-button link size="small" @click="setSortDesc">
      {{ currentSort.desc ? '降序' : '升序' }}
    </el-button>
  </div>
</template>

<style scoped>
.sort-container {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #d9f8ef;
  padding: 4px 12px;
  border: 1px solid #ffbdb1;
  border-radius: 6px;
  margin-top: 3px;
}

.sort-button {
  font-family: 'Noto Serif SC', serif;
  font-size: 12px;
  color: #555;
  letter-spacing: 1px;
  border: none;
  background: none;
  cursor: pointer;
  padding: 2px 8px;
}

.sort-button:hover {
  background: #eee;
  border-radius: 3px;
}

.active {
  color: #e86f83;
  font-weight: 600;
}

.order-badge {
  margin-left: 8px;
  font-size: 12px;
  color: #9ca3af;
}

.order-toggle {
  font-family: 'Noto Serif SC', serif;
  font-size: 11px;
  color: #888;
  letter-spacing: 0.5px;
}
</style>