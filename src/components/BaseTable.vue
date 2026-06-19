<script lang="ts" setup>
interface Columns{
    prop?: string
    label:  string
    width?: number
    slot?: string
}

const props = defineProps<{columns:Columns[],data:any[]}>()


</script>

<template>
    <el-table :data="data" stripe>
        <el-table-column v-for="col in columns" :key="col.label" 
        :prop="col.prop" :width="col.width" :label="col.label">
            <template #default="{row}" v-if="col.slot">
                <slot :name="col.slot" :row="row"></slot>
            </template>
        </el-table-column>
    </el-table>
</template>

<style scoped></style>