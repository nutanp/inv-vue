<template>
    <div>
     <el-table
      :data="defaultViewDataSort(tableForDefault)"
      id="default-table"
      border
      size="mini"
      style="width: 100%"
      show-summary
       :summary-method="getTotalSummariesDefault"
      :row-style="rowStyle"
      :header-cell-style="headerRowStyle"
      >
       <el-table-column
        prop="poNum"
        label="PO"
        header-align="center"
        min-width="90">
      </el-table-column>
      <el-table-column
        prop="agn"
        label="AGN"
        header-align="center"
        min-width="90">
      </el-table-column>
      <el-table-column
        prop="adjustmentQty"
        label="Alloc Qty"
        header-align="center"
        align="right"
        min-width="100">
      </el-table-column>
      <el-table-column
        prop="poQty"
        label="PO Qty"
        header-align="center"
        align="right"
        min-width="100">
      </el-table-column>
        <el-table-column
        prop="openQty"
        label="Open Qty"
        header-align="center"
        align="right"
        min-width="100">
      </el-table-column>
      <el-table-column
        prop="grQty"
        label="GR Qty"
        header-align="center"
        align="right"
        min-width="100">
      </el-table-column>
      <el-table-column
        prop="poDate"
        label="PO Date"
        header-align="center"
        align="center"
        min-width="100"
        :formatter="format_date">
      </el-table-column>
      <el-table-column
        prop="expDlvDate"
        label="Exp Del Date"
        header-align="center"
        min-width="170"
        :formatter="format_date_expDelDate"
        >
      </el-table-column>
    </el-table>
    </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { validateAdjustments } from '@/utils/open-po-validate'
import axios from 'axios'
 export default {
    props:{
    
    materialdataforPO:"",
    PlantdataforPO:""
  },
    data() {
        return {
              tableForDefault:[]
        }
    },
  mounted: function(){
    this.readDataforTable()
  },
    methods: {
    readDataforTable()
    { 
     var baseURI= process.env.VUE_APP_BASE_API + '/proxy/agn/PK_IBP/INV_ADJ/READ_COMPS/READ_OPEN_PO.xsjs?'
      var searchParams ='Material='+this.getTruncatedMaterialforID()
                          +'&PLANT='+this.PlantdataforPO
                        
        var finalURL = baseURI+searchParams
         axios.get(finalURL)
           .then(res=>{
          
            this.tableForDefault=res.data;
            this.tableForDefault.forEach(obj=>obj.poQty= Number(obj.poQty))
            this.tableForDefault.forEach(obj=>obj.openQty= Number(obj.openQty))
            this.tableForDefault.forEach(obj=>obj.grQty= Number(obj.grQty))

            });
    },
     defaultViewDataSort(arrayToBeSorted) {
      function compare(a, b) {
        if(parseInt(a.poNum) == parseInt(b.poNum) && ((a.agn == '********************' && b.agn != '********************') || (a.agn < b.agn))) {
          return -1
        }
      }
      return arrayToBeSorted.slice().sort(compare)
    },
    getTruncatedMaterialforID() {
      return (
           (this.materialdataforPO.indexOf('-') > 0
          ? parseInt(this.materialdataforPO.split('-')[0]) 
         
           : this.materialdataforPO)
          )
        },
         getTotalSummariesDefault(param) {
          const { columns, data } = param
          const sums = []
          columns.forEach((column, index) => {
            if (index === 0) {
              sums[index] = 'Total'
              return
            } else if (index === 4) {
              sums[index] = data.reduce(
                (s, cv) => s + parseInt(cv.openQty | 0),
                0
              )
            } 
            // else if (index === 3) {
            //   sums[index] = data.reduce(
            //     (s, cv) => s + parseInt(cv.poQty | 0),
            //     0
            //   )
            // } 
           
             else if (index === 5) {
              sums[index] = data.reduce(
                (s, cv) => s + parseInt(cv.grQty | 0),
                0
              )
            } 
            else {
              sums[index] = ''
            }
          })
          return sums
        },
         rowStyle({ row, rowIndex }) {
      return 'background-color: #CFE2F3; color:#585858;padding:0px;'
    },
    headerRowStyle({ row, rowIndex }) {
      return 'background-color: #0069AA; color:white;'
    },
     format_date_expDelDate(row) {
      var year1 = row.expDlvDate.substring(0, 4)
      var month1 = row.expDlvDate.substring(4, 6)
      var day1 = row.expDlvDate.substring(6, 8)
      return month1 + '/' + day1 + '/' + year1
    },
    format_date(row) {
      var year = row.poDate.substring(0, 4)
      var month = row.poDate.substring(4, 6)
      var day = row.poDate.substring(6, 8)
      return month + '/' + day + '/' + year
    }
  }
}
</script>
