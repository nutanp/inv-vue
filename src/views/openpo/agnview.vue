<template>
 <div>
  <el-table
    :data="tableForAgn"
    border
    size="mini"
    style="width: 100%"
    show-summary
    :summary-method="getTotalSummariesAGN"
    id="AGN-table"
    :row-style="rowStyle"
    :header-cell-style="headerRowStyle">
     <el-table-column
      prop="poNum"
      label="PO#"
      :filters="poFilter"
      :filter-method="filterPO"
      filter-placement="bottom-end"
      header-align="center"
      min-width="90">
    </el-table-column>
    <el-table-column
      prop="agn"
      label="AGN"
      :filters="agnFilter"
      :filter-method="filterAgn"
      filter-placement="bottom-end"
      header-align="center"
      min-width="120">
        <template slot-scope="scope">
        <div v-if="scope.row.newAddedRow || scope.row.req_status==='E'">
          <el-select
              v-model="scope.row.agn"
              collapse-tags
              filterable
              placeholder="Please select AGN #"
              :default-first-option="true"
              size="mini"
              :class="{'error-data': scope.row.isAgnError}"
              @change="populateAgnDesc(scope.row) && validateUserEntriesAndErrorCount(scope.row,true,false)">
            <el-option
              v-for="item in agnsCode"
              :key="item"
              :label="item"
              :value="item">
            </el-option>
          </el-select>
        </div>
           <div v-else>
             {{scope.row.agn}}
           </div>
        </template>
    </el-table-column>
     <el-table-column
      prop="description"
      label="Description"
      header-align="center"
      min-width="120">
    </el-table-column>
   
    <el-table-column
      label="Alloc Qty"
      header-align="center"
      align="right"
      min-width="110">
      <template slot-scope="scope">
        <div v-if="scope.row.newAddedRow || scope.row.req_status==='E'">
         
           <el-input-number
            v-model="scope.row.adjustmentQty"
            controls-position="right"
            :controls="false"
            :step=0
            
            size="mini"
            id="adjstQty"
            placeholder="Qty"
            :class="{'error-data': scope.row.isQtyError1 || scope.row.isQtyError2 || scope.row.isQtyError3 || scope.row.isQtyError4}"
            @blur="validateUserEntriesAndErrorCount(scope.row,true,true)">
            </el-input-number>
           </div >
        <div v-else>
        {{scope.row.adjustmentQty}}
        </div>
      </template>
    </el-table-column>
      <el-table-column
      prop="poQty"
      label="PO Qty"
      header-align="center"
      align="right"
      min-width="70">
    </el-table-column>
      <el-table-column
      prop="openQty"
      label="Open Qty"
      header-align="center"
      align="right"
      min-width="70">
    </el-table-column>
     <el-table-column
      prop="grQty"
      label="GR Qty"
      header-align="center"
      align="right"
      min-width="70">
    </el-table-column>
     <el-table-column
      prop="poDate"
      label="PO Date"
      header-align="center"
      min-width="100"
      align="center"
      :formatter="format_date">
    </el-table-column>
     <el-table-column
      prop="expDlvDate"
      label="Exp Del Date"
      header-align="center"
      min-width="100"
      align="center"
     >
    </el-table-column>
   
    <el-table-column label="Message" header-align="center" :min-width="150">
      <template slot-scope="scope">
        <span style="color:red">
          {{ scope.row.agnValidationMessage}}{{scope.row.qtySumValidationMessage}}</span>
      </template>
    </el-table-column>
     <el-table-column
      v-if="this.seqstrtypedataforPO === 'PO'"
      label="Ops"
      align="center"
      min-width="80">
      <template slot-scope="scope">
       <div v-if="scope.row.newAddedRow">
          <div v-if="scope.row.req_status==='C' || scope.row.req_status==='A'">
           </div>
         <div v-else>
           <el-button
           @click.native.prevent="deleteRow(scope.row, tableForAgn)"
           type="danger"
           round
           size="mini"
           icon="el-icon-delete">
           </el-button>
         </div>
        </div>   
        <div v-else-if="parseInt(scope.row.grQty) <=0">
          <div v-if="scope.row.req_status==='C' || scope.row.req_status==='A'">
          </div>
          <div v-else>
            <el-button
                type="success"
                round
                size="mini"
                icon="el-icon-plus"
                @click="addRowForPO(scope.row)" >
            </el-button>
          </div>
        </div>
        <div v-else>
          <el-button 
            type="info"
            disabled
            round
            size="mini"
            icon="el-icon-plus">
          </el-button>
        </div>
       </template>
    </el-table-column>
  </el-table>
      <div v-if="this.seqstrtypedataforPO === 'PO'" class="footer">
      <el-button
          type="primary"
          size="mini"
          @click="submitOpenPO()"
          id="submit-request"
          v-bind:disabled="sbmBtnDisable"
          round>Submit Request
      </el-button>
      <el-button
        type="warning"
        round
        size="mini"
        @click="cancelOpenPO"
      >Reset</el-button>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import {agnDropdownvalidation,validateAdjustments,allocQtySumOnPO } from '@/utils/open-po-validate'
import DefaultViewtable from './defaultview'
import axios from 'axios'
  export default {
    props:{
      materialdataforPO:"",
      PlantdataforPO:"",
      seqstrtypedataforPO:""
  },
  components:{
'DefaultViewtable' :DefaultViewtable
 },
    data() {
      return {
        index:0,
        obj:{},
        agnforFilter:[],
        uniqueagnforFilter:[],
        activeViews:[{
          value: 'DefaultView',
          label: 'Default View'
        },
        {
         value: 'AGNView',
          label: 'AGN View'
        }],
        activeView:'DefaultView',
        tableForAgn:[],
        tableForAgnMaster:[],
        switchView:true,
        sbmBtnDisable: true,
        errorsExist: false,
        agnFilter: [],
        poFilter: [],
        rowsForPOKey: new Map(),
        dataForSelectedPOAndAGN:[],
        totalErrorsByAgnDropDown:0,
        totalErrorsByAgnAndQtyCheck:0
      }
    },
    watch: {
      agnData() {
          this.tableForAgn = this.tableForAgn
      }
    },
    computed: {
    ...mapGetters([
      'agnsCode',
      'agnsDDL',
      'agnsPopupDDL',
      'masterAgns',
      'openPOResponse',
      'uGroup',
      'agnsForOpenPO'
    ])
  },
  mounted: function(){
    this.readDataforTable()
  },
    methods: {
    readDataforTable()
    {  let agns=[];
     this.agnFilter=[];
      this.poFilter=[];
     var baseURI= process.env.VUE_APP_BASE_API + '/proxy/agn/PK_IBP/INV_ADJ/READ_COMPS/READ_OPEN_PO.xsjs?'
      var searchParams ='Material='+this.getTruncatedMaterialforID()
                          +'&PLANT='+this.PlantdataforPO+'&seqStrTyp='+this.seqstrtypedataforPO

        var finalURL = baseURI+searchParams

        axios.get(finalURL)
           .then(res=>{
            this.tableForAgn= res.data;
            this.tableForAgn= this.agnViewDataSort(res.data);
            this.tableForAgn.forEach(obj=>obj.poQty= Number(obj.poQty))
            this.tableForAgn.forEach(obj=>obj.openQty= Number(obj.openQty))
            this.tableForAgn.forEach(obj=>obj.grQty= Number(obj.grQty))
            this.tableForAgn.forEach(obj=>obj.validationMessage="")
            this.tableForAgn.forEach(obj=>obj.req_status="")
            this.tableForAgn.forEach(obj=>obj.adjustmentQty="")
            this.tableForAgn.forEach(obj=>obj.ponumflag="")
            this.creatDatafortable(this.tableForAgn);
            this.agnforFilter=this.tableForAgn.map(agnObj => agnObj.agn)
            this.uniqueagnforFilter = this.agnforFilter.filter((v, i, a) => a.indexOf(v) === i);
            this.uniqueagnforFilter.unshift('---Select All Agn---')
            this.tableForAgnMaster = [...this.tableForAgn];
            const pos = [...new Set(_.orderBy(res.data.map(r => r.poNum)))]
            pos.forEach((poNum) => {
              this.poFilter.push({ text: poNum, value: poNum })
            })
             agns = [...new Set(_.orderBy(res.data.map(r => r.agn)))]
            agns.forEach((agn) => {
              this.agnFilter.push({ text: agn, value: agn })
            })
        });

  //code to move in store later for API connectivity
    },
    creatDatafortable(arr)
    {
     
      arr.forEach(element => {
      element.description=this.fetchAgnDescription(element.agn)[0].DESCRIPTION
   
     });
     
    },
    fetchAgnDescription(agn)
    { const AgnFound= []
      this.masterAgns.filter(function(singleAgn){
      if(singleAgn.AGN==agn)
        AgnFound.push(singleAgn)
      })
      return AgnFound
    },
    rowStyle({ row, rowIndex }) {
      return 'background-color: #CFE2F3; color:#585858;padding:0px;'
    },
    headerRowStyle({ row, rowIndex }) {
      return 'background-color: #0069AA; color:white;'
    },
    innerRowStyle({ row, rowIndex }) {
      return 'background-color: white; color:#686868;padding:0px;'
    },
    setCurrent(row) {
      this.$refs.singleTable.setCurrentRow(row);
    },
    deleteRow(row, rows) {
      const idx = rows.indexOf(row)
      rows.splice(idx, 1)
      this.dataForSelectedPOAndAGN = this.rowsForPOKey.get(row.poNum+'~'+row.sourceAGN)
      let indexToBeDeleted = this.dataForSelectedPOAndAGN.indexOf(row)
      this.dataForSelectedPOAndAGN.splice(indexToBeDeleted, 1)

      this.rowsForPOKey.set(row.poNum+'~'+row.sourceAGN,this.dataForSelectedPOAndAGN)
      // take care of validation since qty entered by the user may change
      var noQtyErrorExists=false
      let remainingNewlyAddedRows = this.dataForSelectedPOAndAGN.filter(ele=>ele.newAddedRow)
      console.log('before recalcuation after delete remainingNewlyAddedRows', JSON.stringify(remainingNewlyAddedRows))
      if(remainingNewlyAddedRows.length){
        let sourceAllcdQty = remainingNewlyAddedRows[0].sourceAllcdQty
        let totalQty = remainingNewlyAddedRows.map(ele=>ele.adjustmentQty)
                                .reduce((t,v)=>parseInt(t)+parseInt(v),0)
         console.log('sourceAllcdQty : ', sourceAllcdQty, 'totalQty : ',totalQty )
          if(totalQty<=sourceAllcdQty){
            noQtyErrorExists=true
            remainingNewlyAddedRows.forEach(ele=>{
              ele.qtySumValidationMessage=''
              ele.isQtyError4 = false
              ele.req_status = ''})
          }else
            noQtyErrorExists=false
        } 

        //check if there are no agn drop down and qty related issues:
        let errorRowsInTransactions=[]
        for (const value of this.rowsForPOKey.values()) {
            let foundErrors = value.filter(ele=>ele.newAddedRow && (ele.isQtyError4 || ele.isAgnError))
            foundErrors.forEach(ele=>errorRowsInTransactions.push(ele))
            
        }    
        if(!errorRowsInTransactions.length){
          this.sbmBtnDisable = false
          this.errorsExist = false
        }
          
    },
    handleCurrentRow(val) {
      this.obj={}
      this.index = this.tableForAgn.findIndex(x => x.poNum ===val.poNum && x.agn ===val.agn && x.poQty !== '' );
      Object.assign(this.obj,val)
      this.obj.newAddedRow=true;
      this.obj.poQty="";
      this.obj.grQty="";
      this.obj.sourceAllcdQty = (this.obj.allocatedQty == null) ? 0 : this.obj.allocatedQty
      this.obj.openQty=""
      this.obj.sourceAGN=this.obj.agn
    },
    cancelOpenPO(){
     // document.getElementById('btnCancel').click()
      this.sbmBtnDisable = false
      this.readDataforTable()
      this.rowsForPOKey = new Map()
      this.dataForSelectedPOAndAGN = []
    },
    closeOpenPO(){
      this.$emit('closedialogPO',true)
      document.getElementById('btnRefresh').click()
    },
    addRowForPO(row)
    {
      this.handleCurrentRow(row)
      console.log('Before operation this.rowsForPOKey', this.rowsForPOKey)
      // check if map has PO number as key
      //if there are no keys, then insert
      let mapKey= row.poNum+'~'+row.agn
      if(this.rowsForPOKey.has(mapKey)){
        this.rowsForPOKey.get(mapKey).push(this.obj)
      }else{
        let totalRows = []
        totalRows.push(row)
        totalRows.push(this.obj)
        this.rowsForPOKey.set(mapKey, totalRows)
      }
      
      // if(this.dataForSelectedPOAndAGN.length){
      //   let poNumberOfClickedRow = row.poNum
      //   let agn = row.agn
      //  // If clicked row po number and agn matches with arrays first element, 
      //  // push only newly added row
      //   if(poNumberOfClickedRow=== this.dataForSelectedPOAndAGN[0].poNum &&
      //    agn=== this.dataForSelectedPOAndAGN[0].agn){
      //      this.dataForSelectedPOAndAGN.push(this.obj)
      //   }
      //   //clicked row po number and agn does not match
      //   //clearout array and push clicked row and newly added row.
      //   else{
      //      this.dataForSelectedPOAndAGN=[]
      //      this.dataForSelectedPOAndAGN.push(row)
      //      this.dataForSelectedPOAndAGN.push(this.obj)
      //   }
      // }
      // // array is empty, push clicked row and newly added row.
      // else{
      //   this.dataForSelectedPOAndAGN.push(row)
      //   this.dataForSelectedPOAndAGN.push(this.obj)
      // }
      this.tableForAgn.splice(this.index+1, 0, this.obj)
       console.log(' After operation this.rowsForPOKey', this.rowsForPOKey)
    },
    resetOpenPOResponse() {
      this.$store.dispatch('inventory/resetOpenPOResponse')
    },
      getTotalSummariesAGN(param) {
        const { columns, data } = param
        const sums = []
        columns.forEach((column, index) => {
          if (index === 0) {
            sums[index] = 'Total'
            return
          } else if (index === 4) {
            const key = 'poNum';
            const uniquePOs = [...new Set(data.map(ele => ele.poNum))]
            let arrayUniqueByKey =[]
            // const arrayUniqueByKey = [...new Map(data.map(
            //                 item =>{
            //                     [item[key], item]
            //                   })).values()];
            data.forEach(ele=>{
              uniquePOs.forEach(po=>{
                if(po===ele.poNum && !arrayUniqueByKey.filter(obj=>obj.poNum===po).length){
                  arrayUniqueByKey.push(ele)
                }else{ 
                    // do nothong   
                }
                 
              })
            })
            sums[index] = arrayUniqueByKey.reduce(
              (s, cv) => s + parseInt(cv.poQty | 0),
              0
            )
          } 
           else if (index === 5) {
            sums[index] = data.reduce(
              (s, cv) => s + parseInt(cv.openQty | 0),
              0
            )
          } else if (index === 6) {
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
      getTruncatedMaterialforID() {
        return (
            (this.materialdataforPO.indexOf('-') > 0
            ? parseInt(this.materialdataforPO.split('-')[0])
            : this.materialdataforPO)
        )
      },
      showServerValidationOnUI(responsePO)
      {let responsePOarr=[]
          responsePOarr = responsePO
          responsePOarr.forEach(element =>
        {
          for(const poData of this.tableForAgn)
          {
              if  (poData.poNum===element.poNumber &&
                  (element.destinationAGN).trim() === (poData.agn).trim() &&
                  poData.newAddedRow==true)
              {
                poData.validationMessage=element.errorMessage
                  if  (element.req_status === "C")
              {
                poData.newAddedRow=false
                poData.req_status="C"
              }
                if  (element.req_status === "E")
              {
                poData.req_status="E"
                console.log("Error status found")
              }
              }
          }
        })
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
    },
    submitOpenPO() {
      //this.popupValChange(false,true)
      if (!this.errorsExist) {
     const screenLoading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
        var recordtoPost=[]
        var requestBody = { invPoSeq: [] }
        var onScreenRecords = this.tableForAgn.filter(obj=>obj.newAddedRow==null || obj.newAddedRow == undefined || obj.newAddedRow==false)
        var partialGRs = []
        var adj = []
        for (var i=0; i<onScreenRecords.length; i++) {
          adj = onScreenRecords[i]
          if (partialGRs[adj.poNum] == undefined) {
            partialGRs[adj.poNum] = false
          }
          if (adj.grQty > 0) {
            partialGRs[adj.poNum] = partialGRs[adj.poNum] || true
          }
        }
        recordtoPost = this.tableForAgn.filter(obj=>obj.newAddedRow!=null && obj.newAddedRow != undefined && obj.newAddedRow==true)
        if (recordtoPost.length == 0) {
          const h = this.$createElement
              this.$notify({
                title: "Warning",
                message: h(
                  'i',
                  { style: 'color: red' },
                  "Nothing selected for adjustments"
                ),
                type: 'error',
                offset: 100
              })
                screenLoading.close()
        }
        else {
          var adj = []
          var nextRecSrcAgn = ''
          var remQty = -1
          for (var i=0; i<recordtoPost.length; i++) {
            adj = recordtoPost[i]
            requestBody.invPoSeq.push({
              sourceDC: this.PlantdataforPO,
              sourceAGN: adj.sourceAGN,
              destinationDC: this.PlantdataforPO,
              destinationAGN: adj.agn,
              materialID: this.getTruncatedMaterialforID(),
              adjustmentQty: adj.adjustmentQty,
              poNumber: adj.poNum,
              partialGr: (partialGRs[adj.poNum] === true) ? 'X' : '',
              uGroup: this.uGroup
            })
            remQty = (remQty == -1) ? adj.sourceAllcdQty  : remQty
            remQty = remQty - adj.adjustmentQty
            nextRecSrcAgn = recordtoPost[i+1] != undefined ? recordtoPost[i+1].sourceAGN : ''
            if(adj.sourceAGN != nextRecSrcAgn) {
              requestBody.invPoSeq.push({
                sourceDC: this.PlantdataforPO,
                sourceAGN: adj.sourceAGN,
                destinationDC: this.PlantdataforPO,
                destinationAGN: adj.sourceAGN,
                materialID: this.getTruncatedMaterialforID(),
                adjustmentQty: remQty,
                partialGr: (partialGRs[adj.poNum] === true) ? 'X' : '',
                poNumber: adj.poNum,
                uGroup: this.uGroup
              })
              remQty = -1
            }
          }
    const headers = {
      // 'client_id': conf.mule_client_id,
      // 'client_secret': conf.mule_client_secret,
      // 'Access-Control-Allow-Origin': '*',
      // 'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
    axios.post(process.env.VUE_APP_BASE_API + '/proxy/agn/PK_IBP/INV_ADJ/INV_POST/INV_ADJ_PO_SEQSTR.xsjs', JSON.stringify(requestBody), { headers: headers })
      .then((response) => {
       var apiResponse  = response.data
          this.rowsForPOKey = new Map()
          this.dataForSelectedPOAndAGN = []
          const that = this
          let runCount = 0
          const interval = setInterval(function() {
            runCount++
          //  var apiResponse  = response.data
            if(typeof apiResponse == 'string' && apiResponse.includes('InternalError')) {
              clearInterval(interval)
              const h = that.$createElement
              that.$notify({
                title: "Warning",
                message: h(
                  'i',
                  { style: 'color: red' },
                  "Invalid Response from the Server"
                ),
                type: 'error',
                offset: 100
              })
              screenLoading.close()
            }
            if (runCount > 30) {
              clearInterval(interval)
              const h = that.$createElement
              that.$notify({
                title: "Warning",
                message: h(
                  'i',
                  { style: 'color: red' },
                  "Adjustment is taking longer than expected. Please check logs before resubmitting."
                ),
                type: 'error',
                offset: 100
              })
              screenLoading.close()
            }
            if(apiResponse.validationResponse!=null &&
            apiResponse.validationResponse!==undefined &&
            Array.isArray(apiResponse.validationResponse)){
              that.showServerValidationOnUI(apiResponse.validationResponse)
              screenLoading.close()

              clearInterval(interval)
            }
            if(apiResponse.myResult!=null &&
              apiResponse.myResult!==undefined){
                clearInterval(interval)
                const h = that.$createElement
                that.$notify({
                  title: "success message",
                  message: h(
                    'i',
                    { style: 'color: teal' },
                    "success message"
                  ),
                  type: 'success',
                  offset: 100
                })
                screenLoading.close()
                that.readDataforTable()
              }
        }, 100)
                // this.$emit('displaydefaultview','DefaultView')

        })
        .catch((error) => {
            clearInterval(interval)
            const h = this.$createElement
            this.$notify({
              title: "Warning",
              message: h(
                'i',
                { style: 'color: red' },
                "Unknown Exception"
              ),
              type: 'error',
              offset: 100
            })
            screenLoading.close()
        })
      }
    }
    //
    },
    populateAgnDesc(row) {
      row.description = this.fetchAgnDescription(row.agn)[0].DESCRIPTION
      return true
    },
    // CheckAllocQty(recentlyChangedAdjustment)
    // { let totalErrorsForAllocQty=0;
       
    //     totalErrorsForAllocQty=allocQtySumOnPO(recentlyChangedAdjustment, this.tableForAgn)

    // },
    validateUserEntriesAndErrorCount(recentlyChangedAdjustment,checkOnlyAgnDropdown, checkAGNAndQtyBoth){
      
      
       if(checkOnlyAgnDropdown)
      { 
         this.totalErrorsByAgnDropDown = 0;   
        console.log("only agn check",checkOnlyAgnDropdown)
         //console.log("only agn check")
        this.totalErrorsByAgnDropDown = agnDropdownvalidation(this.tableForAgn)
    
      }
      if(checkAGNAndQtyBoth){
        this.totalErrorsByAgnAndQtyCheck=0;
        this.dataForSelectedPOAndAGN = this.rowsForPOKey.get(recentlyChangedAdjustment.poNum+'~'+recentlyChangedAdjustment.sourceAGN)
        console.log('dataForSelectedPOAndAGN : ', JSON.stringify(this.dataForSelectedPOAndAGN))
        this.totalErrorsByAgnAndQtyCheck = allocQtySumOnPO(recentlyChangedAdjustment, this.dataForSelectedPOAndAGN)
      }
      console.log("totalErrorsByAgnAndQtyCheck : ",this.totalErrorsByAgnAndQtyCheck,'totalErrorsByAgnDropDown : ',this.totalErrorsByAgnDropDown)
      let errorRowsInTransactions=[]
      for (const value of this.rowsForPOKey.values()) {
        let foundErrors = value.filter(ele=>ele.newAddedRow && ele.isQtyError4)
        foundErrors.forEach(ele=>errorRowsInTransactions.push(ele))
      }

      if(this.totalErrorsByAgnDropDown > 0 || 
          errorRowsInTransactions.length) {
        this.sbmBtnDisable = true
        this.errorsExist = true
      } else {
        this.sbmBtnDisable = false
        this.errorsExist = false
      }
    },
    // popupValChange(checkOnlyAgn,checkAll) {
    //   let totalErrors=0;
   
    //   if(checkOnlyAgn)
    //   {    console.log("only agn check",checkOnlyAgn)
    //      //console.log("only agn check")
    //     totalErrors = agnDropdownvalidation(
    //     this.tableForAgn
    //   )
     
    //   }
    //   else{
    //      console.log("only qty check",checkAll)
    //    totalErrors = validateAdjustments(
    //     this.tableForAgn
    //   )
    //   }
    //   if(totalErrors > 0) {
    //     this.sbmBtnDisable = true
    //     this.errorsExist = true
    //   } else {
    //     this.sbmBtnDisable = false
    //     this.errorsExist = false
    //   }
    // } ,
     agnViewDataSort(arrayToBeSorted) {
      function compare(a, b) {
        if((a.agn == '********************' && b.agn != '********************') || (a.agn < b.agn)) {
          return -1
        } else if(a.agn == b.agn && parseInt(a.poNum) < parseInt(b.poNum)) {
          return -1
        }
      }
      function mysortfunction(a, b) {
        var x = parseInt(a.poNum) 
        var y = parseInt(b.poNum) 
        var p1 =a.agn;
        var p2 = b.agn;
        if (x < y) {return -1;}
        if (x > y) {return 1;}
        if (p1 < p2) {return -1;}
        if (p1 > p2) {return 1;}
        return 0;
          
      }
      //return arrayToBeSorted.slice().sort(compare)
      return arrayToBeSorted.slice().sort(mysortfunction)
    },
    filterAgn(value, row) {
      //console.log('filterAGN')
      return row.agn === value
    },
    filterPO(value, row) {
      return row.poNum === value
    }
  },

  }
</script>

<style>

#AGN-table .el-table__footer-wrapper .el-table__footer tr {
    background-color: lightyellow;
    font-size: 15px;
}
#AGN-table input {
  text-align: left;
}
.footer {
  padding-top: 20px;
  text-align: right;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
.error-data {
  border: 1px solid red;
  border-radius: 4px;
}
.el-table__column-filter-trigger i {
     color: white !important;
    font-size: 14px !important;
}
#adjstQty >span
{
  display: none !important;
}
#adjstQty.el-input-number--mini {
    width: 100px;
}
.el-button--primary{
background: #0069aa;
}
.el-button--warning {
    background: #ef8200;
}
.el-dialog__headerbtn {
   
    top: 6px !important;
   
    font-size: 21px !important;
}
#AGN-table td:nth-child(6) {
  background: #f5f7fa;
}
</style>
