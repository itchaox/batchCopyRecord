<!--
 * @Version    : v1.00
 * @Author     : itchaox
 * @Date       : 2023-12-23 09:34
 * @LastAuthor : itchaox
 * @LastTime   : 2024-01-14 11:44
 * @desc       : 
-->

<script setup lang="ts">
  import { bitable } from '@lark-base-open/js-sdk';
  import { useTheme } from '@/hooks/useTheme';
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  useTheme();

  const recordTableList = ref([]);

  const fieldName = ref();

  // 记录的数组
  const recordValueList = ref([]);

  let table;
  let fieldId;

  // 特殊字段, 无法直接复制
  // 19 查找引用; 20 公式; 1005 自动编号
  const specialFieldList = ref([]);

  const loading = ref(false);

  // 是否开启邮件直接复制记录
  const copyModel = ref(false);

  onMounted(async () => {
    const { viewId } = await bitable.base.getSelection();

    table = await bitable.base.getActiveTable();
    const view = await table.getViewById(viewId);

    const fieldMetaList = await view.getFieldMetaList();
    specialFieldList.value = fieldMetaList.filter((item) => [19, 20, 1005].includes(item.type)).map((item) => item.id);
    fieldId = fieldMetaList[0].id;
    fieldName.value = fieldMetaList[0].name;

    bitable.base.onSelectionChange(async (event) => {
      let _recordId = event.data.recordId;
      const recordValue = await table.getRecordById(_recordId);
      // 查找引用、公式、自动编号的字段,无法直接复制需先删除
      specialFieldList.value.forEach((fieldId) => {
        // 使用 delete 操作符删除属性
        if (recordValue?.fields.hasOwnProperty(fieldId)) {
          delete recordValue?.fields[fieldId];
        }
      });

      if (copyModel.value) {
        await table.addRecords([recordValue]);
      } else {
        let _index = recordTableList.value.findIndex((i) => i.id === _recordId);
        if (_index !== -1) return;

        recordValueList.value.push({
          recordValue,
          id: _recordId,
        });

        if (recordValue?.fields[fieldId]) {
          recordTableList.value.push({
            id: _recordId,
            name: recordValue.fields[fieldId]?.text || recordValue.fields[fieldId][0]?.text,
          });
        } else {
          recordTableList.value.push({
            id: _recordId,
            name: t('First column not yet available'),
          });
        }
      }
    });
  });

  async function handleDelete(index, id) {
    // 删除表格和记录 list
    recordTableList.value = recordTableList.value.filter((item) => item.id !== id);
    recordValueList.value = recordValueList.value.filter((item) => item.id !== id);

    ElMessage({
      type: 'success',
      message: '删除成功',
      duration: 1500,
      showClose: true,
    });
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
        message: t('Please check the data'),
        duration: 1500,
        showClose: true,
      });
      return;
    }

    loading.value = true;

    let _list = [];
    // 复制次数
    for (let i = 0; i < copyNumber.value; i++) {
      await _list.push(...recordValueList.value.map((item) => toRaw(item.recordValue)));
      // 新增数据;
    }
    await table.addRecords(_list);

    loading.value = false;

    ElMessage({
      type: 'success',
      message: t('Copy Success'),
      duration: 1500,
      showClose: true,
    });
  }

  const selectViewIdList = ref([]);

  const handleSelectionChange = (val) => {
    selectViewIdList.value = val?.map((item) => item.id);
  };

  /**
   * @desc  : 批量删除
   */
  async function batchDelete() {
    if (selectViewIdList.value?.length === 0) {
      ElMessage.warning('请先勾选记录！');
      return;
    }

    // 假设 selectViewIdList.value 包含要删除的 id 列表
    const idsToDelete = new Set(selectViewIdList.value);

    recordTableList.value = recordTableList.value.filter((item) => !idsToDelete.has(item.id));

    recordValueList.value = recordValueList.value.filter((item) => !idsToDelete.has(item.id));

    ElMessage({
      type: 'success',
      message: '批量删除成功',
      duration: 1500,
      showClose: true,
    });
  }
</script>

<template>
  <div class="home">
    <div class="tips">
      <div class="tip">{{ $t('procedure') }}</div>
      <div class="tip">1. 选择【单击单元格】模式</div>
      <div class="tip">2. 勾选记录: 点击记录任一单元格实现勾选至下方表格</div>
      <div class="tip">3. 复制记录: 点击记录任一单元格即可复制</div>
    </div>
    <div
      v-loading="loading"
      :element-loading-text="$t('loading')"
    >
      <div class="label mt">
        <div class="text">单击单元格：</div>
        <el-radio-group v-model="copyModel">
          <el-radio-button :label="false">勾选记录</el-radio-button>
          <el-radio-button :label="true">复制记录</el-radio-button>
        </el-radio-group>
      </div>

      <div v-if="!copyModel">
        <div class="select">{{ $t('total', [recordTableList.length]) }}</div>
        <div class="table">
          <el-table
            :data="recordTableList"
            max-height="55vh"
            @selection-change="handleSelectionChange"
            :empty-text="$t('No data')"
          >
            <el-table-column
              type="selection"
              width="30"
            />

            <el-table-column
              label="序号"
              type="index"
              width="55"
            />

            <el-table-column
              :label="fieldName ? fieldName : ''"
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
              :label="$t('operate')"
              width="75"
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
        <div class="delete-button">
          <el-button
            @click="batchDelete"
            type="danger"
            color="#F54A45"
          >
            <el-icon><Delete /></el-icon>
            <span>批量删除</span>
          </el-button>
        </div>
        <div class="label">
          <div class="text">{{ $t('Copy model') }}</div>
          <el-radio-group v-model="copyType">
            <el-radio-button :label="1">{{ $t('single') }}</el-radio-button>
            <el-radio-button :label="2">{{ $t('multi') }}</el-radio-button>
          </el-radio-group>
        </div>
        <div
          class="label"
          v-if="copyType === 2"
        >
          <div class="text">{{ $t('Number of copy') }}</div>
          <el-input-number
            v-model="copyNumber"
            :min="1"
            :max="1000"
          />
        </div>

        <el-button
          class="confirm"
          type="primary"
          @click="confirm"
        >
          <el-icon><Aim /></el-icon>
          <span>{{ $t('Confirm copy') }}</span>
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
    margin-bottom: 10px;
  }

  .label {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    .text {
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

  .switch {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    .switch-tip {
      margin-right: 5px;
    }
  }

  .mt {
    margin-top: 14px;
  }

  .delete-button {
    margin: 10px 0 14px 0;
  }

  .confirm {
    margin-top: 10px;
  }
</style>
