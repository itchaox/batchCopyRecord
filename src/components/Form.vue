<!--
 * @Version    : v1.00
 * @Author     : itchaox
 * @Date       : 2023-12-23 09:34
 * @LastAuthor : itchaox
 * @LastTime   : 2023-12-23 22:48
 * @desc       : 
-->

<script setup lang="ts">
  import { bitable } from '@lark-base-open/js-sdk';

  const base = bitable.base;

  const recordIdList = ref([]);

  // 临时的记录 id
  const templateRecordIdList = ref([]);

  const recordTableList = ref([]);

  const fieldName = ref();

  // 记录的数组
  const recordValueList = ref([]);

  let table;
  let tableIdData;
  let viewIdData;
  let fieldId;

  const loading = ref(false);

  onMounted(async () => {
    const { tableId, viewId } = await bitable.base.getSelection();
    tableIdData = tableId;
    viewIdData = viewId;

    table = await bitable.base.getActiveTable();
    const view = await table.getViewById(viewId);

    const fieldMetaList = await view.getFieldMetaList();
    fieldId = fieldMetaList[0].id;
    fieldName.value = fieldMetaList[0].name;
  });

  async function goCheck() {
    loading.value = true;
    recordTableList.value = [];
    recordValueList.value = [];

    // 获取已选择的 recordIdList
    recordIdList.value = await bitable.ui.selectRecordIdList(tableIdData, viewIdData);

    let _list = [];
    for (const id of recordIdList.value) {
      const recordValue = await table.getRecordById(id);
      // 用于 addRecord
      recordValueList.value.push(recordValue);

      _list.push({
        id,
        name: recordValue.fields[fieldId].text || recordValue.fields[fieldId][0]?.text,
      });
    }

    // 用于表格展示
    recordTableList.value.push(..._list);

    loading.value = false;
    ElMessage({
      type: 'success',
      message: '勾选成功',
      duration: 1500,
      showClose: true,
    });
  }

  async function handleDelete(index, id) {
    // 删除表格和记录 list
    recordTableList.value = recordTableList.value.filter((item) => item.id !== id);
    recordValueList.value = recordValueList.value.filter((item) => item.fields[fieldId][0].id !== id);
  }

  const copyType = ref(1);

  // 确保单次数量
  watch(copyType, (newValue, oldValue) => {
    if (newValue === 1) {
      copyNumber.value = 1;
    }
  });

  const copyNumber = ref(1);

  async function confirm() {
    loading.value = true;

    // 复制次数
    for (let i = 0; i < copyNumber.value; i++) {
      // 新增数据;
      await table.addRecords(toRaw(recordValueList.value));
    }

    loading.value = false;

    ElMessage({
      type: 'success',
      message: '复制成功',
      duration: 1500,
      showClose: true,
    });
  }
</script>

<template>
  <div class="home">
    <div class="tips">
      <div class="tip">操作步骤:</div>
      <div class="tip">1. 点击【勾选记录】按钮，弹出窗口进行记录选择</div>
      <div class="tip">2. 在下方表格中确认需要复制的记录无误</div>
      <div class="tip">3. 选择【复制模式】，可设置复制次数（多选模式）</div>
      <div class="tip">4. 点击【确认复制】按钮，完成复制操作</div>
    </div>
    <div
      v-loading="loading"
      element-loading-text="加载中..."
    >
      <el-button
        type="primary"
        @click="goCheck"
      >
        <el-icon><CircleCheck /></el-icon>
        <span>勾选记录</span>
      </el-button>
      <div class="tip">已选：{{ recordIdList.length }} 条数据</div>
      <div class="table">
        <el-table
          ref="tableRef"
          :data="recordTableList"
          height="100%"
          empty-text="暂无数据"
        >
          <el-table-column
            type="index"
            label="序号"
            width="55"
          />

          <el-table-column
            :label="fieldName ? fieldName : '首列名字'"
            style="width: 100%"
          >
            <template #default="scope">
              <span
                :title="scope.row.name"
                class="fieldName"
              >
                {{ scope.row.name }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            property="name"
            label="操作"
            width="55"
          >
            <template #default="scope">
              <el-button
                size="small"
                type="danger"
                link
                @click="handleDelete(scope.$index, scope.row.id)"
                ><el-icon size="16"><Delete /></el-icon
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="label">
        <div class="text">复制模式：</div>
        <el-radio-group v-model="copyType">
          <el-radio-button :label="1">单次</el-radio-button>
          <el-radio-button :label="2">多次</el-radio-button>
        </el-radio-group>
      </div>
      <div
        class="label"
        v-if="copyType === 2"
      >
        <div class="text">复制次数：</div>
        <el-input-number
          v-model="copyNumber"
          :min="1"
          :max="1000"
        />
      </div>

      <el-button
        type="primary"
        @click="confirm"
        >确认复制</el-button
      >
    </div>
  </div>
</template>

<style scoped>
  .home {
  }

  .tips {
    margin-bottom: 10px;
  }

  .tip {
    font-size: 12px;
    color: #646a73;
    margin-top: 5px;
  }

  .table {
    margin-bottom: 14px;
  }

  .label {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    .text {
      width: 70px;
      margin-right: 10px;
      white-space: nowrap;
      font-size: 14px;
    }
  }

  .fieldName {
    white-space: nowrap;
  }
</style>
