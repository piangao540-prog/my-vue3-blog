<template>
    <div class="admin-container">
        <el-tab-pane label="已发布文章" name="published">
            <el-table-column :data="publishedArticle" stripe>
                <el-table-column prop="title" label="标题" />
                <el-table-column prop="category" label="分类" width="120" />
                <el-table-column prop="creatAt" label="创建时间" width="120" />
                <el-table-column prop="wordCount" label="字数" width="80" />
                <el-table-column label="操作" width="160">
                    <template #default="{row}">
                        <el-button size="small" @click="editArticle(row.id)">编辑</el-button>
                        <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table-column>
        </el-tab-pane>
            <el-tab-pane label="草稿箱" name="published">
                <el-table-column :data="articleManagerStore.drafts" stripe>
                    <el-table-column prop="title" label="标题" />
                    <el-table-column prop="updatedAt" label="最后修改" width="180" />
                    <el-table-column prop="wordCount" label="字数" width="80" />
                    <el-table-column label="操作" width="160">
                        <template #default="{row}">
                            <el-button size="small" @click="editArticle(row.id)">编辑</el-button>
                            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table-column>
        </el-tab-pane>
    </div>
</template>

<script lang="ts" setup>
import {computed,ref} from 'vue'
import { useArticleManagerStore } from '@/stores/articleManager';
import { useBlogStore } from '@/stores/blog';
import { useRouter } from 'vue-router';


const articleManagerStore = useArticleManagerStore()
const router = useRouter()
const blogStore = useBlogStore()

const publishedArticle = computed(() => {
    blogStore.articles.filter(a => !a.status || a.status === 'published')
})
// 跳转编辑
const editArticle = (id:number) =>{
    router.push(`/editor?id=${id}`)
}

const activeTab = ref('published')
// 删除已发布文章
const handleDelete = (id:number) =>{
    if(confirm('确定要删除这篇文章吗')){
        blogStore.deleteArticle(id)
    }
}

// 删除草稿
const handleDeleteDraft = (id:number) => {
    if(confirm('确定要删除这个草稿')){
        articleManagerStore.deleteDraft(id)
    }
}

</script>

<style scoped>
.admin-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
}
</style>