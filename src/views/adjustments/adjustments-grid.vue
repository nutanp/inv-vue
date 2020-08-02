<template>
  <div>
    <div v-if="dialogPOVisible">
      <el-dialog
        v-bind:title="this.dialogTitle"
        :visible.sync="dialogPOVisible"
        :close-on-press-escape="false"
        :close-on-click-modal="false"
        :show-close="true"
        @close="closeOpenPODialouge()"
        width="96%"
      >
        <openPOdialouge :materialdatafor-p-o="materialforOpenPO" :plantdatafor-p-o="plantforOpenPO" :seqstrtypedatafor-p-o="seqStrTypeforOpenPO" @closedialogPO="dialogPOVisible=false"></openPOdialouge>

      </el-dialog>
    </div>
    <div id="adjustments">
      <el-table
        ref="baseAdjustmentTable"
        v-loading="loading"
        border
        size="mini"
        style="width: 100%;"
        element-loading-text="Loading..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)"
        :key="baseAdjustmentTableKey"
        :row-key="getRowKey"
        :expand-row-keys="expandRowKeys"
        :default-sort="{prop: 'Plant', order: 'ascending'}"
        :data="filteredAdjustments"
        :row-style="rowStyle"
        :header-cell-style="headerRowStyle"
        :cell-style="cellPadding"
        max-height="490"
      >
        <el-table-column type="expand" width="30px" :resizable="false">
          <template slot-scope="props">
            <el-table
              ref="innerAdjustmentsTable"
              border
              size="mini"
              :row-style="innerRowStyle"
              :cell-style="cellStyle"
              :header-cell-style="headerRowStyle"
              :header-row-style="hideInnerHeader"
              :data="props.row.AGNS"
              :default-sort="{prop: 'AGN', order: 'ascending'}"
              style="width: 100%"
            >
              <el-table-column label="AGN" prop="AGN" width="250px"></el-table-column>
              <el-table-column label="AGN Name" prop="AgnName" width="250px"></el-table-column>
              <el-table-column label="Available" align="right">
                <template slot-scope="scope">
                  <a v-if="scope.row.Available > 0"
                    class="link-style"
                    :class="{'disabled': scope.row.LOCKED === 'X'}"
                    :data-agn="scope.row.AGN"
                    :data-plant="props.row.Plant"
                    :data-plantName="props.row.plantName"
                    :data-material="props.row.Material"
                    :data-quantity="scope.row.Available"
                    :data-agnname="scope.row.AgnName"
                    :data-isallowed="scope.row.LOCKED !== 'X'"
                    data-trantype="available"
                    @click="openAdjustments($event)"
                  >
                    <img
                      v-show="scope.row.LOCKED === 'X'"
                      src="../../assets/images/lock-20-20.png"
                      height="16px"
                      width="16px"
                    />
                    {{ scope.row.Available }}
                  </a>
                  <span v-if="scope.row.Available <= 0">
                    <img
                      v-show="scope.row.LOCKED === 'X'"
                      src="../../assets/images/lock-20-20.png"
                      height="16px"
                      width="16px"
                    />
                    {{ scope.row.Available }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="PO Quantity" align="right">
                <template slot-scope="scope">
                  <!-- <a
                              class="link-style"
                              :data-agn="scope.row.AGN"
                              :data-plant="props.row.Plant"
                              :data-plantName="props.row.plantName"
                              :data-material="props.row.Material"
                              :data-quantity="scope.row.POQuantity"
                              :data-agnname="scope.row.AgnName"
                              data-trantype="po"
                              @click="openAdjustments($event)"
                  >{{ scope.row.POQuantity }}</a> -->
                  <span>{{ scope.row.POQuantity }}</span>
                </template>
              </el-table-column>
              <el-table-column label="STO Quantity" align="right">
                <template slot-scope="scope">
                  <!-- <a
                              class="link-style"
                              :data-agn="scope.row.AGN"
                              :data-plant="props.row.Plant"
                              :data-plantname="props.row.plantName"
                              :data-material="props.row.Material"
                              :data-quantity="scope.row.STOinTransit"
                              :data-agnname="scope.row.AgnName"
                              data-trantype="sto"
                              @click="openAdjustments($event)"
                  >{{ scope.row.STOinTransit }}</a>-->
                  <span>{{ scope.row.STOinTransit }}</span>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column
          label="DC"
          :resizable="false"
          sortable
          width="70px"
          header-align="center"
          align="right"
          prop="Plant"
        ></el-table-column>
        <el-table-column
          label="Plant Name"
          :resizable="false"
          width="430px"
          header-align="center"
          prop="plantName"
        ></el-table-column>
        <el-table-column
          label="Available Qty"
          header-align="center"
          align="right"
          :resizable="false"
        >
          <template slot-scope="scope">
            <span :style="{color: scope.row.IsTotalAvailableAccurate ? '#606266' : 'brown'}">{{ scope.row.DCOHQuantity }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="Open PO Qty"
          header-align="center"
          align="right"
          :resizable="false"
        >
          <template slot-scope="scope">
          <div v-if="scope.row.dcTotalPOQuantity > 0">
            <a
              class="link-style"
              data-trantype="sto"
              @click="openPO(scope.row, 'PO')"
            >{{ scope.row.dcTotalPOQuantity }}</a>
          </div>
           <div v-else>
             {{ scope.row.dcTotalPOQuantity }}
           </div>
          </template>
        </el-table-column>
        <el-table-column
          label="Open STO Qty"
          header-align="center"
          align="right"
          :resizable="false"
        >
          <template slot-scope="scope">
            <div v-if="scope.row.dcTotalSTOinTransit > 0">
              <a
                class="link-style"
                data-trantype="sto"
                @click="openPO(scope.row, 'STO')"
              >{{ scope.row.dcTotalSTOinTransit }}</a>
            </div>
            <div v-else>
              {{ scope.row.dcTotalSTOinTransit }}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import openPOdialouge from './../openpo/index'

export default {
  components: {
    'openPOdialouge': openPOdialouge
  },
  data() {
    return {
      dialogPOVisible: false,
      materialforOpenPO: '',
      plantforOpenPO: '',
      baseAdjustmentTableKey: 0,
      seqStrTypeforOpenPO: '',
      dialogTitle: ''
    }
  },
  computed: {
    ...mapGetters([
      'loading',
      'chosenMaterial',
      'expandRowKeys',
      'filteredAdjustments'
    ])
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
  },
  methods: {
    getRowKey(row) {
      return row.Plant + '-' + row.plantName
    },
    handleResize() {
      // setTimeout(() => {
      //   document.getElementById('btnExpnCollap').click()
      //   setTimeout(() => {
      //     document.getElementById('btnExpnCollap').click()
      //   }, 100)
      // }, 0)
      if (this.baseAdjustmentTableKey >= 100) {
        this.baseAdjustmentTableKey = 0
      }
      this.baseAdjustmentTableKey += 1
    },
    openPO(row, type) {
      this.dialogPOVisible = true
      this.materialforOpenPO = this.chosenMaterial
      this.plantforOpenPO = row.Plant
      this.seqStrTypeforOpenPO = type
      this.dialogTitle = (type === 'PO') ? 'Open PO Sequestration' : 'Open STO Sequestration'
    },
    closeOpenPODialouge() {
      this.dialogPOVisible = false
      document.getElementById('btnRefresh').click()
    },
    openAdjustments(e) {
      const targetElement = e.target
      if (targetElement.dataset.isallowed) {
        const data = {
          material: this.chosenMaterial,
          plant: targetElement.dataset.plant,
          plantname: targetElement.dataset.plantname,
          agn: targetElement.dataset.agn,
          agnname: targetElement.dataset.agnname
        }
        this.$store.dispatch('inventory/setInitialAdjustment', data)
        this.$store.dispatch('inventory/setIsRequestProcessing', false)
        this.$store.dispatch('inventory/setDCandAGN', {
          dc:
            targetElement.dataset.plant + '-' + targetElement.dataset.plantname,
          agn: targetElement.dataset.agn + ':' + targetElement.dataset.agnname,
          material: this.chosenMaterial,
          quantity: targetElement.dataset.quantity
        })
        this.$store.dispatch('inventory/setDialogFormVisible', true)
      }
    },
    rowStyle({ row, rowIndex }) {
      return 'background-color: #CFE2F3; color:#585858;padding:0px;'
    },
    innerRowStyle({ row, rowIndex }) {
      return 'background-color: white; color:#686868;padding:0px;'
    },
    cellStyle({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        return 'font-size: 11px; padding-left: 65px;padding-top: 2px; padding-bottom: 2px'
      } else if (columnIndex === 2 || columnIndex === 3 || columnIndex === 4) {
        return 'font-size: 11px; padding: 2px 15px 2px 2px'
      } else {
        return 'font-size: 11px; padding: 2px 0'
      }
    },
    cellPadding({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 1 || columnIndex === 2) {
        return 'padding: 2px;font-weight: bolder;'
      } else if (columnIndex === 3 || columnIndex === 4 || columnIndex === 5) {
        return 'padding: 2px 15px 2px 2px;font-weight: bolder;'
      } else {
        return 'padding: 2px;'
      }
    },
    headerRowStyle({ row, rowIndex }) {
      return 'background-color: #0069AA; color:white;padding: 1px 0;'
    },
    hideInnerHeader({ row, rowIndex }) {
      return 'display: none;'
    }
  }
}
</script>

<style scoped>
a.link-style {
  display: block;
  text-decoration: underline;
  cursor: pointer;
  font-weight: bold;
  color: #0069aa;
}
@media screen and (max-width: 1300px) and (min-width: 700px) {
  a.link-style {
    margin-right: 1px;
  }
}
@media screen and (max-width: 1400px) and (min-width: 1301px) {
  a.link-style {
    margin-right: 0px;
  }
}
@media screen and (min-width: 1401px) {
  a.link-style {
    margin-right: -1px;
  }
}
</style>
