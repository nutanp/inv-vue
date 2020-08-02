<template>
  <el-table
    id="adjustments-table"
    border
    size="mini"
    style="width: 100%"
    show-summary
    :summary-method="getSummaries"
    :row-style="rowStyle"
    :header-cell-style="headerRowStyle"
    :data="adjustmentsForm.adjustmentsToBeDone"
  >
    <el-table-column label="Ops" header-align="center" :min-width="5">
      <template slot-scope="scope">
        <el-button
          size="mini"
          type="danger"
          icon="el-icon-delete"
          round
          @click="handleDelete(scope.$index, scope.row)"
        ></el-button>
      </template>
    </el-table-column>
    <el-table-column label="Source DC" :min-width="7" header-align="center" align="right">
      <template slot-scope="scope">
        <p style="margin: 0px !important">{{ scope.row.sourceDC }}</p>
      </template>
    </el-table-column>
    <el-table-column label="Source AGN" prop="sourceAGN" header-align="center" :min-width="16"></el-table-column>
    <el-table-column label="Target DC" header-align="center" :min-width="12">
      <template slot-scope="scope">
        <div id="plant-select">
          <el-select
            v-model="scope.row.destDC"
            collapse-tags
            filterable
            placeholder="Please select plant #"
            size="mini"
            :class="{'error-data': scope.row.isPlantError}"
            @change="popupPlantChange"
          >
            <el-option v-for="item in plantsPopupDDL" :key="item" :label="item" :value="item" />
          </el-select>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="Target AGN" header-align="center" :min-width="26">
      <template slot-scope="scope">
        <div id="agn-select">
          <el-select
            ref="ddlPopupAGN"
            v-model="scope.row.destAGN"
            collapse-tags
            filterable
            placeholder="Please select AGN #"
            size="mini"
            :class="{'error-data': (scope.row.isAgnError || scope.row.isAgnError2)}"
            :default-first-option="true"
            @change="popupAgnChange"
          >
            <el-option v-for="item in agnsPopupDDL" :key="item" :label="item" :value="item" />
          </el-select>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="Adj. Quantity" header-align="center" :min-width="8">
      <template slot-scope="scope">
        <div id="popupqty">
          <el-input
            id="txtAdjQty"
            v-model="scope.row.adjQuantity"
            placeholder="Qty"
            type="number"
            size="mini"
            step="1"
            :class="{'error-data': (scope.row.isQtyError || scope.row.isQtyError2 || scope.row.isQtyError3 || scope.row.isQtyError4)}"
            @blur="popupQuantityChange"
          ></el-input>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="Message" header-align="center" :min-width="25">
      <template slot-scope="scope">
        <span :style="{ color: (scope.row.validationMessage !== 'Validation Successful' ? 'red' : 'green')}">{{ scope.row.validationMessage }}</span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { mapGetters } from 'vuex'
import { validateAdjustments } from '@/utils/validate'
import { isNullOrUndefined } from 'util'
export default {
  computed: {
    ...mapGetters([
      'chosenQty',
      'plantsPopupDDL',
      'agnsPopupDDL',
      'adjustmentsForm',
      'isPerformAdjustmentsAttempted'
    ])
  },
  methods: {
    rowStyle({ row, rowIndex }) {
      return 'background-color: #CFE2F3; color:#585858;padding:0px;'
    },
    headerRowStyle({ row, rowIndex }) {
      return 'background-color: #0069AA; color:white;padding: 1px 0;'
    },
    getSummaries(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = 'Total'
          return
        } else if (index === 4) {
          sums[index] = data.reduce(
            (s, cv) => s + parseInt(cv.adjQuantity | 0),
            0
          )
        } else {
          sums[index] = ''
        }
      })
      return sums
    },
    popupPlantChange(selectedValue) {
      if (this.isPerformAdjustmentsAttempted) {
        const totalErrors = validateAdjustments(
          this.adjustmentsForm.adjustmentsToBeDone,
          this.chosenQty
        )
        if (totalErrors !== 0) {
          this.$store.dispatch('inventory/setDialogFormVisible', true)
        }
        const failedRecCount = this.adjustmentsForm.adjustmentsToBeDone.filter(r => r.isServerValidationFailed === true).length
        if (failedRecCount > 0) {
          this.checkForDataUpdates()
        }
      }
    },
    popupAgnChange(selectedValue) {
      if (this.isPerformAdjustmentsAttempted) {
        const totalErrors = validateAdjustments(
          this.adjustmentsForm.adjustmentsToBeDone,
          this.chosenQty
        )
        if (totalErrors !== 0) {
          this.$store.dispatch('inventory/setDialogFormVisible', true)
        }
        const failedRecCount = this.adjustmentsForm.adjustmentsToBeDone.filter(r => r.isServerValidationFailed === true).length
        if (failedRecCount > 0) {
          this.checkForDataUpdates()
        }
      }
    },
    popupQuantityChange() {
      if (this.isPerformAdjustmentsAttempted) {
        const totalErrors = validateAdjustments(
          this.adjustmentsForm.adjustmentsToBeDone,
          this.chosenQty
        )
        if (totalErrors !== 0) {
          this.$store.dispatch('inventory/setDialogFormVisible', true)
        }
        const failedRecCount = this.adjustmentsForm.adjustmentsToBeDone.filter(r => r.isServerValidationFailed === true).length
        if (failedRecCount > 0) {
          this.checkForDataUpdates()
        }
      }
    },
    checkForDataUpdates() {
      this.adjustmentsForm.adjustmentsToBeDone.forEach((adj, index) => {
        if (adj.isServerValidationFailed) {
          const errorRec = this.adjustmentsForm.adjustmentsErrorOut.filter(r => r.rowId === adj.rowId)[0]
          if (!isNullOrUndefined(errorRec)) {
            if (adj.destDC !== errorRec.destDC ||
            adj.destAGN !== errorRec.destAGN ||
            adj.adjQuantity !== errorRec.adjQuantity) {
              adj.isUpdatedAfterHanaValidation = true
              adj.validationMessage = ''
            }
          }
        }
      })
      const failedRecords = this.adjustmentsForm.adjustmentsToBeDone.filter(r => r.isServerValidationFailed === true).map(r => r.isUpdatedAfterHanaValidation)
      if (failedRecords.length === 0) {
        this.$store.dispatch('inventory/setIsRequestProcessing', false)
      } else if (failedRecords.includes(false)) {
        this.$store.dispatch('inventory/setIsRequestProcessing', true)
      } else {
        this.$store.dispatch('inventory/setIsRequestProcessing', false)
      }
    },
    handleDelete(index, row) {
      this.adjustmentsForm.adjustmentsToBeDone.splice(index, 1)
      const failedRecCount = this.adjustmentsForm.adjustmentsToBeDone.filter(r => r.isServerValidationFailed === true).length
      if (failedRecCount > 0) {
        this.checkForDataUpdates()
      } else {
        this.$store.dispatch('inventory/setIsRequestProcessing', false)
      }
    }
  }
}
</script>

<style scoped>
.error-data {
  border: 1px solid red;
  border-radius: 4px;
}
</style>
