<!--
 * @Version    : v1.00
 * @Author     : itchaox
 * @Date       : 2023-12-23 09:34
 * @LastAuthor : itchaox
 * @LastTime   : 2023-12-24 09:28
 * @desc       : 
-->

<script setup lang="ts">
  import { bitable } from '@lark-base-open/js-sdk';
  import { useTheme } from '@/hooks/useTheme';

  useTheme();

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
    // recordTableList.value = [];
    // recordValueList.value = [];

    // 获取已选择的 recordIdList
    let _listRecordId = await bitable.ui.selectRecordIdList(tableIdData, viewIdData);
    loading.value = true;

    if (_listRecordId.length === 0) {
      loading.value = false;
      return;
    }

    // 无勾选, 则保留上次记录
    // if (_listRecord.length > 0) {
    //   recordIdList.value = _listRecord;
    // }

    let _listRecord = [];
    let _listTable = [];

    const records = await table.getRecords({
      pageSize: 5000,
    });
    records.records.forEach((item) => {
      _listRecordId.forEach((recordId) => {
        if (item.recordId === recordId) {
          let recordValue = {
            fields: item.fields,
          };
          let id = recordId;
          _listRecord.push({ ...recordValue, recordId: id });

          if (recordValue.fields[fieldId]) {
            _listTable.push({
              id,
              name: recordValue.fields[fieldId]?.text || recordValue.fields[fieldId][0]?.text,
            });
          } else {
            _listTable.push({
              id,
              name: '【暂无首列数据】',
            });
          }
        }
      });
    });

    // for (const id of _listRecordId) {
    //   const recordValue = await table.getRecordById(id);
    //   // debugger;

    //   // 用于 addRecord
    //   // recordValueList.value.push(recordValue);
    //   _listRecord.push({ ...recordValue, recordId: id });

    //   if (recordValue.fields[fieldId]) {
    //     _listTable.push({
    //       id,
    //       name: recordValue.fields[fieldId]?.text || recordValue.fields[fieldId][0]?.text,
    //     });
    //   } else {
    //     _listTable.push({
    //       id,
    //       name: '【暂无首列数据】',
    //     });
    //   }
    // }

    // 无勾选, 则保留上次记录
    if (_listRecord.length > 0) {
      recordValueList.value = _listRecord;
    }

    // 无勾选, 则保留上次记录
    if (_listTable.length > 0) {
      // 用于表格展示
      // recordTableList.value.push(..._listTable);

      // 覆盖
      recordTableList.value = _listTable;
      ElMessage({
        type: 'success',
        message: '勾选成功',
        duration: 1500,
        showClose: true,
      });
    }

    loading.value = false;
  }

  async function handleDelete(index, id) {
    // 删除表格和记录 list
    recordTableList.value = recordTableList.value.filter((item) => item.id !== id);
    recordValueList.value = recordValueList.value.filter((item) => item.recordId !== id);
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
    if (recordValueList.value.length === 0) {
      ElMessage({
        type: 'warning',
        message: '请勾选数据',
        duration: 1500,
        showClose: true,
      });
      return;
    }

    loading.value = true;

    let _list = [];
    // 复制次数
    for (let i = 0; i < copyNumber.value; i++) {
      await _list.push(...toRaw(recordValueList.value));
      // 新增数据;
    }

    await table.addRecords(_list);

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
      <div class="tip">3. 选择【复制模式】，可设置复制次数（多次模式）</div>
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
      <div class="select">已选：{{ recordTableList.length }} 条数据</div>
      <div class="table">
        <el-table
          :data="recordTableList"
          max-height="55vh"
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
      >
        <el-icon><Aim /></el-icon>
        <span>确认复制</span>
      </el-button>
    </div>
  </div>
</template>

<style scoped>
  .home {
  }

  .tips {
    /* margin-bottom: 10px; */
  }

  .tip {
    font-size: 12px;
    color: #646a73;
    margin-bottom: 5px;
  }

  .select {
    font-size: 14px;
    color: #302333;
    margin-top: 10px;
  }

  .table {
    /* height: 55vh; */
    margin-bottom: 10px;
  }

  .label {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

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

  .no-data img {
    width: 100%;
    height: 100%;
  }

  .no-data span {
    font-size: 16px;
  }
</style>