<template>
  <div class="app-container">
    <el-card class="box-card ImpBox">
      <template>
        <div class="typeFld">
          <el-radio v-model="typ" label="INVADJ">Inventory Adjustment</el-radio>
          <el-radio v-model="typ" label="POSEQ">Open PO Sequestration</el-radio>
          <el-button :loading="downloadLoading" type="primary" icon="el-icon-download" size="mini" circle title="Download Template" @click="handleDownload"></el-button>
        </div>
      </template>
      <upload-excel-component :on-success="handleSuccess" :before-upload="beforeUpload" />
    </el-card>
    <el-card v-if="!showSummary" class="box-card">
      <div v-if="showFilter && typ === 'POSEQ'" class="filter">
        <el-input v-model="filter" placeholder="Filter by PO Number" />
      </div>
      <div v-if="tableData.length > 0" class="sbmRqst">
        <el-radio v-model="threadType" label="single">Single Threaded</el-radio>
        <el-radio v-model="threadType" label="multi">Multi Threaded</el-radio>
        <el-button
          size="mini"
          type="primary"
          round
          :disabled="sbmBtnDisabled"
          @click="submitRequest"
        >
          Submit Request
        </el-button>
        <el-button
          size="mini"
          type="warning"
          round
          @click="resetPage"
        >
          Reset
        </el-button>
      </div>
      <el-table
        v-loading="loading"
        :data="resultQuery"
        element-loading-text="Loading..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)"
        border
        highlight-current-row
        style="width: 100%;margin-top:10px;"
        :header-cell-style="headerRowStyle"
      >
        <el-table-column v-for="item of tableHeader" :key="item" :prop="item" :label="item" header-align="center">
          <template slot-scope="scope">
            <span v-if="!scope.row.isEditable">{{ scope.row[item] }}</span>
            <el-input
              v-if="scope.row.isEditable"
              v-model="scope.row[item]"
              size="small"
              style="text-align:center"
              controls-position="right"
            >
            </el-input>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-card v-if="showSummary" class="box-card">
      <download-excel
        v-if="errorCnt > 0"
        :data="errorRecords"
        :fields="resPOColumns"
        worksheet="Errors"
        name="Errors.xls"
      >
        <el-button type="danger" icon="el-icon-download" size="mini" circle title="Download Error Records"></el-button>
      </download-excel>
      <h4>Summary:</h4>
      <ul>
        <li>Number of Records Submitted: {{ recCnt }}</li>
        <li>Number of Records Passed: {{ passCnt }}</li>
        <li>Number of Records Failed: {{ errorCnt }}</li>
      </ul>
      <h4>Next Steps:</h4>
      <ol v-if="errorCnt > 0">
        <li>Download the error records from the link above.</li>
        <li>Fix the data based on the message column from the spreadsheet.</li>
        <li>Upload the data.</li>
        <li>Review the data on the screen and correct if any.</li>
        <li>Click Submit Request button.</li>
      </ol>
      <span v-else>No action required.</span>
    </el-card>
  </div>
</template>
<script>
import '@/styles/bulk-import.scss'
import UploadExcelComponent from '@/components/UploadExcel/index.vue'
import { mapGetters } from 'vuex'
export default {
  name: 'UploadExcel',
  components: { UploadExcelComponent },
  data() {
    return {
      tableData: [],
      tableHeader: [],
      typ: 'POSEQ',
      threadType: 'single',
      downloadLoading: false,
      loading: false,
      recCnt: 0,
      passCnt: 0,
      errorCnt: 0,
      dataToBePosted: [],
      errorRecords: [],
      columns: {},
      resPOColumns: {
        'PO NUMBER': 'poNumber',
        'DC': 'destinationDC',
        'ECONO': 'material',
        'QTY': 'adjustmentQty',
        'Source AGN': 'sourceAGN',
        'Target AGN': 'destinationAGN',
        'Message': 'errorMessage'
      },
      showSummary: false,
      sbmBtnDisabled: false,
      filter: '',
      showFilter: false
    }
  },
  computed: {
    ...mapGetters([
      'uGroup',
      'loggedInUserEid',
      'openPOsResponse'
    ]),
    resultQuery() {
      if (this.filter && this.typ === 'POSEQ') {
        return this.tableData.filter((item) => {
          return item['PO NUMBER'].toString().includes(this.filter)
        })
      } else {
        return this.tableData
      }
    }
  },
  methods: {
    beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 1
      if (isLt1M) {
        return true
      }
      this.$message({
        message: 'Please do not upload files larger than 1m in size.',
        type: 'warning'
      })
      return false
    },
    handleSuccess({ results, header }) {
      results.forEach((item) => {
        // make this true if you want to make the values editable
        item.isEditable = false
      })
      this.tableData = results
      this.tableHeader = header
      this.showSummary = false
      this.sbmBtnDisabled = false
      this.showFilter = true
    },
    submitRequest: function() {
      this.sbmBtnDisabled = true
      this.loading = true
      var adjustment = {}
      var adj = {}
      var chunk_size = 100
      this.dataToBePosted = []
      if (this.typ === 'POSEQ') {
        this.columns = {
          'PO NUMBER': 'poNumber',
          'ECONO': 'materialID',
          'DC': 'destinationDC',
          'Target AGN': 'destinationAGN',
          'QTY': 'adjustmentQty'
        }
        for (var i = 0; i < this.tableData.length; i++) {
          adj = this.tableData[i]
          adjustment = {
            type: this.typ,
            uGroup: this.uGroup,
            eid: this.loggedInUserEid,
            sourceAGN: '***'
          }
          for (const [key, value] of Object.entries(this.columns)) {
            if (adj[key] !== undefined) {
              adjustment[value] = adj[key]
            }
          }
          this.dataToBePosted.push(adjustment)
        }
        this.dataToBePosted = { excel_data: this.dataToBePosted, thread_type: this.threadType, chunk_size: chunk_size }
      } else {
        this.dataToBePosted = { DATA: this.tableData, TYPE: this.typ, UGROUP: this.uGroup, EID: this.loggedInUserEid }
      }
      this.$store
        .dispatch('bulk_import/submitOpenPOs', this.dataToBePosted)
        .then(() => {
          const that = this
          that.recCnt = this.tableData.length
          const noOfChunks = (this.threadType === 'multi') ? Math.ceil(that.recCnt / chunk_size) : 1
          const interval = setInterval(function() {
            if (that.openPOsResponse.length === noOfChunks) {
              that.errorCnt = 0
              that.getErrorCnt(that.openPOsResponse)
              that.passCnt = that.recCnt - that.errorCnt
              that.loading = false
              const h = that.$createElement
              that.$notify({
                title: (that.errorCnt > 0) ? 'Error' : 'Success',
                message: h(
                  'i',
                  { style: 'color: teal' },
                  that.errorCnt + ' records are errored out'
                ),
                type: (that.errorCnt > 0) ? 'error' : 'success',
                offset: 100
              })
              clearInterval(interval)
              that.showSummary = true
            }
          })
        })
    },
    resetPage() {
      this.tableHeader = []
      this.tableData = []
      this.typ = 'POSEQ'
      this.threadType = 'single'
      this.showSummary = false
      this.showFilter = false
      this.filter = ''
    },
    headerRowStyle({ row, rowIndex }) {
      return 'background-color: #0069AA; color:white;padding: 5px 0;'
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        var header = []
        if (this.typ === 'INVADJ') {
          header = ['REQ_KEY', 'ECONO', 'Source DC', 'Source AGN', 'Target DC', 'Target AGN', 'QTY']
        } else {
          header = ['REQ_KEY', 'PO NUMBER', 'DC', 'ECONO', 'QTY',	'Target AGN']
        }
        const data = []
        excel.export_json_to_excel({
          header: header,
          data,
          filename: (this.typ === 'INVADJ') ? 'inv_adj_template' : 'open_po_template',
          autoWidth: true,
          bookType: 'xlsx'
        })
        this.downloadLoading = false
      })
    },
    getErrorCnt(records) {
      this.errorCnt = 0
      this.errorRecords = []
      for (const subSet of records) {
        if (subSet !== undefined) {
          for (const record of subSet) {
            if (record.req_status === 'E') {
              this.errorCnt += 1
              this.errorRecords.push(record)
            }
          }
        }
      }
    }
  }
}
</script>
