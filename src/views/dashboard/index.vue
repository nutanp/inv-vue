<template>
  <div id="dashboard-container" class="dashboard-container">
    <el-card class="box-card">
      <div id="content-body">
        <div id="narrow-search" :style="{display: !isSearchCollapsed ? 'none' : 'block'}">
          <el-card shadow="always">
            <el-tooltip
              :content="isSearchCollapsed ? 'Expand Search': 'Collapse Search'"
              placement="right"
            >
              <el-button
                id="btnToggleSearch"
                type="primary"
                size="mini"
                circle
                :icon="isSearchCollapsed ? 'el-icon-d-arrow-right' : 'el-icon-d-arrow-left'"
                @click="toggleSearch"
              ></el-button>
            </el-tooltip>
            <div
              class="rotate"
            >{{materialDesc}}</div>
          </el-card>
        </div>
        <div
          id="search-panel"
          class="flex-item"
          :style="{display: isSearchCollapsed ? 'none' : 'block'}"
        >
          <div id="inventory-search">
            <el-card shadow="always">
              <el-tooltip
                :content="isSearchCollapsed ? 'Expand Search': 'Collapse Search'"
                placement="right"
              >
                <el-button
                  id="btnToggleSearchPanel"
                  type="primary"
                  size="mini"
                  circle
                  :icon="isSearchCollapsed ? 'el-icon-d-arrow-right' : 'el-icon-d-arrow-left'"
                  style="position: relative; left: 365px"
                  @click="toggleSearch"
                ></el-button>
              </el-tooltip>
              <h2 class="box-header">Selection Criteria</h2>
              <el-form
                ref="ruleForm"
                label-width="65px"
                class="demo-ruleForm"
                size="mini"
                label-position="top"
                :model="ruleForm"
                :rules="rules"
                :inline="true"
              >
                <el-form-item label="Material" prop="material">
                  <el-autocomplete
                    v-model="ruleForm.material"
                    clearable
                    class="inline-input"
                    placeholder="Please Input Material"
                    :fetch-suggestions="querySearch"
                    :trigger-on-focus="false"
                    @blur="handleMaterialChange"
                    @select="handleMaterialSelection"
                  >
                    <template slot-scope="{ item }">
                      <div class="value">{{ item.material }}</div>
                    </template>
                  </el-autocomplete>
                </el-form-item>
                <el-form-item label="Plant" prop="plant">
                  <el-select
                    ref="ddlBasePlant"
                    v-model="ruleForm.plant"
                    collapse-tags
                    multiple
                    filterable
                    placeholder="Please select plant #"
                    @change="plantChange"
                  >
                    <el-option v-for="item in plantsDDL" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
                <el-form-item label="AGN" prop="agn">
                  <el-select
                    ref="ddlBaseAGN"
                    v-model="ruleForm.agn"
                    collapse-tags
                    multiple
                    filterable
                    placeholder="Please select AGN #"
                    :default-first-option="true"
                    @change="agnChange"
                  >
                    <el-option v-for="item in agnsDDL" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
                <!-- <el-form-item label="PO" prop="po">
                  <el-date-picker
                    v-model="ruleForm.po"
                    type="daterange"
                    align="right"
                    unlink-panels
                    range-separator="T"
                    start-placeholder="Start date"
                    end-placeholder="End date"
                    :picker-options="pickerOptions"
                  />
                </el-form-item> -->
                <el-form-item style="display: block">
                  <el-button
                    id="btnSearch"
                    size="small"
                    type="primary"
                    round
                    @click="searchWithFilters('ruleForm')"
                  >Search</el-button>
                  <el-button
                    id="btnReset"
                    size="small"
                    type="warning"
                    round
                    @click="resetForm('ruleForm')"
                  >Reset</el-button>
                
                </el-form-item>
              </el-form>
            </el-card>
          </div>
          <el-dialog
            title="Tips"
            :visible.sync="dialogVisible"
            :close-on-press-escape="false"
            :close-on-click-modal="false"
            width="30%"
          >
            <span>This is a message</span>
            <span slot="footer" class="dialog-footer">
              <el-button type="primary" @click="dialogVisible = false">Confirm</el-button>
            </span>
          </el-dialog>
        </div>
        <div id="adjustments-content-main" class="flex-item">
          <el-card shadow="always">
            <div style="display:flex; flex-wrap: wrap;">
              <div>
                <el-tooltip
                  :content="expandRowKeys.length > 0 ? 'Collapse All': 'Expand All'"
                  placement="top"
                >
                  <el-button
                    id="btnExpnCollap"
                    type="info"
                    size="mini"
                    circle
                    :disabled="filteredAdjustments.length <= 0"
                    :icon="expandRowKeys.length > 0 ? 'el-icon-remove-outline' : 'el-icon-circle-plus-outline'"
                    @click="expandCollapseRows"
                  ></el-button>
                </el-tooltip>
                <el-tooltip content="Refresh" placement="top">
                  <el-button
                    id="btnRefresh"
                    type="info"
                    size="mini"
                    icon="el-icon-refresh"
                    circle
                    :disabled="filteredAdjustments.length <= 0"
                    @click="refreshSearchResults"
                  ></el-button>
                </el-tooltip>
                <div id="download-block">
                  <download-excel
                    :data="rawFilteredAdjustments"
                    :fields="adjustment_fields"
                    worksheet="Adjustments"
                    name="Adjustments.xls"
                  >
                    <el-tooltip content="Download" placement="top">
                      <el-button
                        type="info"
                        size="mini"
                        icon="el-icon-download"
                        :disabled="rawFilteredAdjustments.length <= 0"
                        circle
                      ></el-button>
                    </el-tooltip>
                  </download-excel>
                </div>
                <div
                
                  class="toolbar-material"
                >{{this.materialDesc }}</div>
              </div>
            </div>
          </el-card>
          <Adjustments />
        </div>
      </div>
      <div id="popup-adj-dialog">
        <el-dialog
          title="Inventory Adjustments"
          width="96%"
          top="10vh"
          :close-on-press-escape="false"
          :close-on-click-modal="false"
          :show-close="false"
          :visible.sync="dialogFormVisible"
        >
          <el-form ref="adjustmentsForm" :model="adjustmentsForm" label-position="left">
            <el-form-item label="Material" label-width="60px" style="margin-bottom: 5px">
              <el-tag class="tag-display">{{ adjustmentsForm.material }}</el-tag>
              <div id="available-qty" :style="{left: (windowWidth/2)+50+'px'}">
                <strong>Available Qty</strong>
                <el-tag class="tag-display">{{ chosenQty }}</el-tag>
              </div>
              <el-tooltip effect="dark" content="Add New Adjustment" placement="left">
                <el-button
                  style="float: right; margin-top: 4px;"
                  type="success"
                  size="small"
                  icon="el-icon-plus"
                  round
                  @click="addNewRow"
                ></el-button>
              </el-tooltip>
            </el-form-item>
            <div id="adjustments-popup-window">
              <PopupAdjGrid />
            </div>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button
              id="submitrequest"
              type="primary"
              size="mini"
              :disabled="adjustmentsForm.adjustmentsToBeDone.length === 0 || isRequestProcessing"
              round
              @click="performAdjustments"
            >Submit Request</el-button>
            <el-button
              id="btnCancel"
              type="warning"
              round
              size="mini"
              @click="cancelAdjustments"
            >Cancel</el-button>
          </span>
        </el-dialog>
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { validateAdjustments } from '@/utils/validate'
import { showServerValidationResponseOnUI } from '@/utils/validate'
import { setTimeout } from 'timers'

import Adjustments from '../adjustments/adjustments-grid.vue'
import PopupAdjGrid from '../adjustments/popup-adj-grid.vue'

export default {
  name: 'Dashboard',
  components: {
    Adjustments,
    PopupAdjGrid
  },
  data() {
    return {
      windowWidth: window.innerWidth,
      isSearchCollapsed: false,
      materialDesc: '',
      dialogVisible: false,
      links: [],
      formLabelWidth: '120px',
      ruleForm: {
        material: '',
        plant: [],
        agn: [],
        po: [new Date().getTime() - 3600 * 1000 * 24 * 90, new Date()]
      },
      rules: {
        material: [
          {
            required: true,
            message: 'Please input Material number',
            trigger: 'blur'
          }
        ],
        plant: [
          {
            required: true,
            message: 'Please choose appropriate plant',
            trigger: 'change'
          }
        ],
        agn: [
          {
            required: false,
            trigger: 'change'
          }
        ],
        po: [
          {
            required: false,
            trigger: 'change'
          }
        ]
      },
      // isRequestProcessing: false,
      adjustment_fields: {
        Material: 'Material',
        Plant: 'Plant',
        AGN: {
          field: 'AGN',
          callback: value => {
            return value.indexOf('*****') >= 0 ? '***' : value
          }
        },
        'Available Quantity': 'Available',
        'PO Quantity': {
          field: 'POQuantity',
          callback: value => {
            return Number(value)
          }
        },
        'STO in Transit Quantity': {
          field: 'STOinTransit',
          callback: value => {
            return Number(value)
          }
        },
        'Total Available Qty': 'TotalAvailableQty',
        'Total PO Quantity': 'TotalPoQty',
        'Total STO Quantity': 'TotalStoQty'
      },
      pickerOptions: {
        shortcuts: [
          {
            text: 'Last week',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: 'Last month',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: 'Last 3 months',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'plantsDDL',
      'plantsPopupDDL',
      'chosenDC',
      'materials',
      'agnsDDL',
      'agnsPopupDDL',
      'chosenAGN',
      'chosenMaterial',
      'chosenQty',
      'expandRowKeys',
      'dialogFormVisible',
      'adjustmentsForm',
      'rawFilteredAdjustments',
      'filteredAdjustments',
      'isRequestProcessing',
      'adjustmentsResponse',
      'loggedInUserEmail',
      'uGroup'
    ])
  },
  created() {
    this.resetFilteredAdjustments()
    this.resetRawFilteredAdjustments()
    this.$store
      .dispatch('inventory/getAllPlants')
      .then(() => {
        this.ruleForm.plant.push('---All-Plants---')
      })
      .catch(() => {
        console.log('getAllPlants service call failed')
      })
    let agnType = ''
    if (this.uGroup === 'COMPASS-DEV' || this.uGroup === 'COMPASS_PRD') {
      agnType = 'COMP'
    } else if (this.uGroup === 'FLU_DEV' || this.uGroup === 'FLU_PRD') {
      agnType = 'FLU'
    } else if (this.uGroup === 'SUPPORT') {
      agnType = "COMP','FLU"
    }
    this.$store
      .dispatch('inventory/getAllAGN', agnType)
      .then(() => {
        this.ruleForm.agn.push('---All-AGN---')
      })
      .catch(() => {
        console.log('getAllAGN service call failed')
      })
  },
  mounted() {
    window.addEventListener('resize', this.handleWindowResize)
  },
  beforeDestroy: function() {
    window.removeEventListener('resize', this.handleWindowResize)
  },
  methods: {
    handleWindowResize(event) {
      this.windowWidth = event.currentTarget.innerWidth
    },
    toggleSearch() {
      this.isSearchCollapsed = !this.isSearchCollapsed
      // eliminating el-table layout issues while resizing window
      setTimeout(() => {
        document.getElementById('btnExpnCollap').click()
        setTimeout(() => {
          document.getElementById('btnExpnCollap').click()
        }, 100)
      }, 0)
    },
    expandCollapseRows() {
      if (this.expandRowKeys.length > 0) {
        this.$store.dispatch('inventory/setExpandRowKeys', [])
      } else {
        const rowKeys = []
        for (const adjObj of this.filteredAdjustments) {
          rowKeys.push(adjObj.Plant + '-' + adjObj.plantName)
        }
        this.$store.dispatch('inventory/setExpandRowKeys', rowKeys)
      }
    },
    getTruncatedMaterial() {
      return (
        'Material: ' +
        (this.ruleForm.material.indexOf('-') > 0
          ? parseInt(this.ruleForm.material.split('-')[0]) +
            ' - ' +
            this.ruleForm.material.split('-')[1]
          : this.ruleForm.material)
      )
    },
    performAdjustments() {
      this.$store.dispatch('inventory/setIsRequestProcessing', true)
      this.$store.dispatch('inventory/setIsPerformAdjustmentsAttempted', true)
      const screenLoading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      const totalErrors = validateAdjustments(
        this.adjustmentsForm.adjustmentsToBeDone,
        this.chosenQty
      )
      if (totalErrors !== 0) {
        this.$store.dispatch('inventory/setDialogFormVisible', true)
        this.$store.dispatch('inventory/setIsRequestProcessing', false)
        this.resetFilteredAdjustments()
        this.pullSearchResultsforMaterial()
        setTimeout(() => {
          let counter = 0
          const intervalLoad = setInterval(() => {
            counter++
            if (this.filteredAdjustments.length > 0) {
              screenLoading.close()
              clearInterval(intervalLoad)
            }
            if (counter > 100) {
              screenLoading.close()
              clearInterval(intervalLoad)
            }
          }, 200)
        }, 0)
      } else {
        const htag = this.$createElement
        this.$notify({
          title: 'Information',
          message: htag(
            'i',
            { style: 'color: grey' },
            'Processing Adjustment(s) Request...'
          ),
          type: 'info',
          offset: 100
        })
        var requestBody = { invAdjReq: [] }
        for (const adj of this.adjustmentsForm.adjustmentsToBeDone) {
          requestBody.invAdjReq.push({
            sourceDC: adj.sourceDC,
            sourceAGN:
              adj.sourceAGN.indexOf(':') > 0
                ? adj.sourceAGN.split(':')[0]
                : adj.sourceAGN,
            destinationDC: adj.destDC,
            destinationAGN:
              adj.destAGN.indexOf(':') > 0
                ? adj.destAGN.split(':')[0]
                : adj.destAGN,
            materialID:
              this.adjustmentsForm.material.indexOf('-') > 0
                ? parseInt(this.adjustmentsForm.material.split('-')[0])
                : this.adjustmentsForm.material,
            adjustmentQty: String(adj.adjQuantity),
            userEmail: this.loggedInUserEmail,
            ugroup: this.uGroup
          })
        }
        this.$store
          .dispatch('inventory/performAdjustments', requestBody)
          .then(() => {
            const that = this
            let runCount = 0
            const interval = setInterval(function() {
              runCount++
              if (that.adjustmentsResponse.length > 0) {
                if (
                  that.adjustmentsResponse[0].status === 'success' &&
                  that.adjustmentsResponse[0].message === 'Request Accepted'
                ) {
                  const h = that.$createElement
                  that.$notify({
                    title: that.adjustmentsResponse[0].status,
                    message: h(
                      'i',
                      { style: 'color: teal' },
                      that.adjustmentsResponse[0].message
                    ),
                    type: 'success',
                    offset: 100
                  })
                  that.resetFilteredAdjustments()
                  that.$store.dispatch(
                    'inventory/setIsRequestProcessing',
                    false
                  )
                  that.$store.dispatch('inventory/setDialogFormVisible', false)
                  that.cancelAdjustments()
                  that.$store.dispatch('inventory/setLoading', true)
                  setTimeout(function() {
                    that.resetFilteredAdjustments()
                    that.pullSearchResultsforMaterial()
                    screenLoading.close()
                  }, 10000) // Increased  time for HANA and SCM sync
                } else if (that.adjustmentsResponse[0].status === 'failure') {
                  const h = that.$createElement
                  that.$notify({
                    title: that.adjustmentsResponse[0].status,
                    message: h(
                      'i',
                      { style: 'color: red' },
                      that.adjustmentsResponse[0].message
                    ),
                    type: 'error',
                    offset: 100
                  })
                  that.resetFilteredAdjustments()
                  that.$store.dispatch('inventory/setDialogFormVisible', false)
                  that.$store.dispatch(
                    'inventory/setIsRequestProcessing',
                    false
                  )
                  that.cancelAdjustments()
                  screenLoading.close()
                  that.$store.dispatch('inventory/setLoading', true)
                  setTimeout(() => {
                    that.pullSearchResultsforMaterial()
                  }, 0)
                } else {
                  showServerValidationResponseOnUI(
                    that.adjustmentsForm.adjustmentsToBeDone,
                    that.adjustmentsResponse
                  )
                  that.$store.dispatch('inventory/setAdjustmentsError', JSON.parse(JSON.stringify(that.adjustmentsForm.adjustmentsToBeDone)))
                  that.$store.dispatch('inventory/setDialogFormVisible', true)
                  that.$store.dispatch('inventory/setIsRequestProcessing', true)
                  screenLoading.close()
                }
                clearInterval(interval)
                that.$store.dispatch('inventory/resetAdjustmentsResponse')
              }
              if (runCount > 60) {
                clearInterval(interval)
                screenLoading.close()
                that.$store.dispatch('inventory/setIsRequestProcessing', true)
                const h = that.$createElement
                that.$notify({
                  title: 'Information',
                  message: h(
                    'i',
                    { style: 'color: red' },
                    'Adjustment is taking longer than expected. Please check logs before resubmitting.'
                  ),
                  type: 'error',
                  offset: 100
                })
              }
            }, 200)
          })
          .catch(() => {
            const that = this
            screenLoading.close()
            that.$store.dispatch('inventory/setIsRequestProcessing', true)
            const h = that.$createElement
            that.$notify({
              title: 'Warning',
              message: h(
                'i',
                { style: 'color: red' },
                'Unknown Exception'
              ),
              type: 'error',
              offset: 100
            })
          })
      }
    },
    cancelAdjustments() {
      this.$store.dispatch('inventory/setDialogFormVisible', false)
      this.$store.dispatch('inventory/setIsPerformAdjustmentsAttempted', false)
      this.$store.dispatch('inventory/setAdjustmentsToBeDone', [])
      this.$store.dispatch('inventory/setAdjustmentsError', [])
      this.$store.dispatch('inventory/setAdjustmentsToBeDone', [
        {
          sourceDC: '',
          sourceDcName: '',
          sourceAGN: '',
          destDC: '',
          isPlantError: false,
          destAGN: '',
          isAgnError: false,
          isAgnError2: false,
          adjQuantity: '',
          isQtyError: false,
          isQtyError2: false,
          isQtyError3: false,
          isQtyError4: false,
          validationMessage: ''
        }
      ])
    },
    refreshSearchResults() {
      this.resetFilteredAdjustments()
      this.$store.dispatch('inventory/setLoading', true)
      this.pullSearchResultsforMaterial()
    },
    addNewRow() {
      this.$store.dispatch('inventory/setAdjustmentsToBeDone', {
        rowId: 'row-' + Math.max(...this.adjustmentsForm.adjustmentsToBeDone.map(r => Number(r.rowId.split('-')[1]))) + 1,
        sourceDC: this.chosenDC.split('-')[0],
        sourceDcName: this.chosenDC.split('-')[1],
        sourceAGN: this.chosenAGN,
        destDC: this.chosenDC.split('-')[0],
        isPlantError: false,
        destAGN: '',
        isAgnError: false,
        isAgnError2: false,
        adjQuantity: '',
        isQtyError: false,
        isQtyError2: false,
        isQtyError3: false,
        isQtyError4: false,
        validationMessage: '',
        isServerValidationFailed: false,
        isUpdatedAfterHanaValidation: false
      })
      const failedRecords = this.adjustmentsForm.adjustmentsToBeDone.filter(r => r.isServerValidationFailed === true).map(r => r.isUpdatedAfterHanaValidation)
      if (failedRecords.length === 0) {
        this.$store.dispatch('inventory/setIsRequestProcessing', false)
      }
    },
    plantChange(selectedValue) {
      if (selectedValue.includes('---All-Plants---')) {
        if (selectedValue[selectedValue.length - 1] === '---All-Plants---') {
          this.ruleForm.plant = []
          this.ruleForm.plant.push('---All-Plants---')
          // simulating time to make blur method work, otherwise element-ui is not responding
          setTimeout(() => {
            this.$refs.ddlBasePlant.blur()
          }, 0)
        } else if (selectedValue[0] === '---All-Plants---') {
          this.ruleForm.plant.shift()
        }
      }
    },
    agnChange(selectedValue) {
      if (selectedValue.includes('---All-AGN---')) {
        if (selectedValue[selectedValue.length - 1] === '---All-AGN---') {
          this.ruleForm.agn = []
          this.ruleForm.agn.push('---All-AGN---')
          // simulating time to make blur method work, otherwise element-ui is not responding
          setTimeout(() => {
            this.$refs.ddlBaseAGN.blur()
          }, 0)
        } else if (selectedValue[0] === '---All-AGN---') {
          this.ruleForm.agn.shift()
        }
      }
    },
    pullSearchResultsforMaterial() {
      this.$store
        .dispatch('inventory/getAdjustmentsByFilter', {
          material: this.ruleForm.material,
          plant: this.ruleForm.plant,
          agn: this.ruleForm.agn,
          po: this.ruleForm.po
        })
        .then(() => {
          const that = this
          let runCount = 0
          const interval = setInterval(function() {
            runCount++
            if (that.filteredAdjustments.length > 0) {
              clearInterval(interval)
              const rowKeys = []
              for (const adjObj of that.filteredAdjustments) {
                rowKeys.push(adjObj.Plant + '-' + adjObj.plantName)
              }
              that.$store.dispatch('inventory/setExpandRowKeys', rowKeys)
              if (that.chosenQty) {
                const agnsFiltered = that.filteredAdjustments.filter(
                  r =>
                    String(parseInt(r.Material)) === String(parseInt(that.chosenMaterial.split('-')[0])) &&
                    r.Plant === that.chosenDC.split('-')[0]
                )[0]
                if (agnsFiltered !== undefined) {
                  agnsFiltered.AGNS.forEach(element => {
                    if (element.AGN === that.chosenAGN.split(':')[0]) {
                      that.$store.dispatch(
                        'inventory/setChoseQty',
                        String(element.Available)
                      )
                    }
                  })
                }
              }
              that.$store.dispatch('inventory/setLoading', false)
            }
            if (runCount > 30) {
              that.$store.dispatch('inventory/setLoading', false)
              clearInterval(interval)
            }
          }, 500)
        })
        .catch(() => {
          console.log('getMaterialsBySuggestions call failed')
          const that = this
          that.$store.dispatch('inventory/setLoading', false)
        })
    },
    resetFilteredAdjustments() {
      this.$store.dispatch('inventory/resetFilteredAdjustments')
    },
    resetRawFilteredAdjustments() {
      this.$store.dispatch('inventory/resetRawFilteredAdjustments')
    },
    searchWithFilters(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.materialDesc=this.getTruncatedMaterial()
          this.resetFilteredAdjustments()
          this.$store.dispatch('inventory/setLoading', true)
          this.pullSearchResultsforMaterial()
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
      this.ruleForm.plant.push('---All-Plants---')
      this.ruleForm.agn.push('---All-AGN---')
      this.ruleForm.po = [
        new Date().getTime() - 3600 * 1000 * 24 * 90,
        new Date()
      ]
      this.resetFilteredAdjustments()
    },
    querySearch(queryString, cb) {
      if (queryString.length > 3) {
        this.$store
          .dispatch('inventory/getMaterialsBySuggestions', queryString)
          .then(() => {
            var results = this.materials ? this.materials : []
            // call callback function to return suggestions
            cb(results)
          })
          .catch(() => {
            console.log('getMaterialsBySuggestions call failed')
          })
      } else {
        cb([])
      }
    },
    handleMaterialSelection(item) {
      this.ruleForm.material = parseInt(item.material) + '-' + item.description
      this.$store.dispatch(
        'inventory/setChosenMaterial',
        parseInt(item.material) + '-' + item.description
      )
    },
    handleMaterialChange() {
      this.$store.dispatch(
        'inventory/setChosenMaterial',
        this.ruleForm.material
      )
    }
  }
}
</script>

<style>
#adjustments-content-main {
  padding-right: 10px;
}
#adjustments .el-table__expanded-cell {
  padding: 0px 0px 0px 30px;
}
.toolbar-material {
  display: inline;
  color: #909399;
  padding-left: 20px;
  font-weight: bolder;
}
#download-block {
  display: inline-block;
  padding-left: 10px;
}
#dashboard-container .el-card__body {
  padding: 8px;
  min-height: 540px;
}
#dashboard-container .el-card__header {
  padding: 5px 10px;
}
#adjustments-content-main .el-card__body {
  min-height: 30px;
}
#dashboard-container .tag-display {
  font-size: 14px;
  font-weight: bolder;
}
#short-search .el-card__body {
  padding-top: 8px;
  padding-bottom: 8px;
  background-color: #cfe2f3;
  font-size: 13px;
}
#adjustments-table .el-table__footer-wrapper .el-table__footer tr {
  background-color: lightyellow;
}
 #AGN-table .el-table__footer-wrapper .el-table__footer tbody tr td,
 #AGN-table .el-table__fixed-footer-wrapper tbody tr td,
 #default-table .el-table__footer-wrapper .el-table__footer tbody tr td {
    background-color: lightyellow !important;
}
#AGN-table .el-table__fixed-footer-wrapper tbody tr td  {
    background-color: lightyellow !important;
}
#inventory-search .el-input__inner {
  padding: 0 8px;
}
#popup-adj-dialog .el-dialog__body {
  padding: 15px;
}
#popup-adj-dialog .el-table .cell {
  word-break: break-word !important;
}
#plant-select .el-select {
  width: 100px;
}
#agn-select .el-select {
  width: 250px;
}
#popupqty .el-input__inner {
  padding: 0px 0px 0px 15px;
}
#available-qty {
  display: inline;
  position: absolute;
}
#txtAdjQty {
  font-size: 14px;
}
#adjustments {
  margin-top: 5px;
}
#adjustments td {
  border-right: 1px solid #ebeef5;
}
#adjustments-popup-window .el-table__footer {
  background-color: lightyellow;
}
#adjustments-popup-window .el-table__footer td {
  background-color: lightyellow;
}
#adjustments-popup-window .el-table__footer td:first-child {
  border-right: none;
  position: relative;
  left: 30%;
  z-index: 9999;
  font-size: 15px;
}
#adjustments-popup-window .el-table__footer td:nth-child(5) {
  border-right: none;
  position: relative;
  left: 29%;
  z-index: 9999;
  font-size: 15px;
}
#adjustments-popup-window
  > .el-table
  > .el-table__footer-wrapper
  > .el-table__footer
  td:nth-child(2),
#adjustments-popup-window
  > .el-table
  > .el-table__footer-wrapper
  > .el-table__footer
  td:nth-child(3),
#adjustments-popup-window
  > .el-table
  > .el-table__footer-wrapper
  > .el-table__footer
  td:nth-child(4),
#adjustments-popup-window
  > .el-table
  > .el-table__footer-wrapper
  > .el-table__footer
  td:nth-child(6) {
  border-right: none;
}
.rotate {
  width: 500px;
  height: 490px;
  font-weight: bolder;
  color: #ef8200;
  /* FF3.5+ */
  -moz-transform: rotate(-90deg);
  /* Opera 10.5 */
  -o-transform: rotate(-90deg);
  /* Saf3.1+, Chrome */
  -webkit-transform: rotate(-90deg);
  /* Standard */
  transform: rotate(-90deg);
}

#submitrequest:hover,
#submitrequest:focus,
#btnSearch:hover,
#btnSearch:focus,
#btnToggleSearch:hover,
#btnToggleSearch:focus,
#btnToggleSearchPanel:hover,
#btnToggleSearchPanel:focus {
  background: #409eff;
}
#btnReset:hover,
#btnReset:focus,
#btnCancel:hover,
#btnCancel:focus {
  background: orange;
}
#submitrequest.is-disabled {
  background-color: grey;
  border: none;
  cursor: not-allowed;
}
</style>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 5px;
  }
}
.text {
  font-size: 14px;
}
.item {
  margin-bottom: 18px;
}
.box-card {
  width: 100%;
  min-height: 85vh;
}
#content-body {
  display: flex;
}
.flex-item {
  min-width: 425px;
}
#adjustments-content-main {
  flex-grow: 1;
  // flex-basis: 69%;
  flex-basis: calc(99% - 420px);
}
#search-panel {
  flex-grow: 1;
  // flex-basis: 30%;
  flex-basis: 420px;
  padding-right: 5px;
}
#narrow-search {
  width: 50px;
  padding-right: 5px;
}
.box-header {
  color: #ef8200;
  font-size: 24px;
  margin: 0px !important;
  display: inline-block;
  position: relative;
  left: -33px;
}
.el-card.is-always-shadow,
.el-card.is-hover-shadow:focus,
.el-card.is-hover-shadow:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 90, 140, 0.3) !important;
}
.el-autocomplete {
  width: 390px;
}
.el-select {
  width: 390px;
}
.el-date-editor {
  width: 390px;
}
.el-button--primary {
  background: #0069aa;
}
.el-button--warning {
  background: #ef8200;
}
.disabled {
  display: block;
  text-decoration: underline;
  cursor: not-allowed !important;
  font-weight: bold;
  color: rgb(104, 104, 104) !important;
}
.el-table__expanded-cell {
  padding: 0px !important;
}
</style>
