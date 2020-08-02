<template>
 <div>
   <div style="margin-top: -14px;"> 
    <!-- <el-row>
     
      <el-col :span="18" style="text-align:right"> 
        <el-switch
        style="display: block"
        v-model="switchview"
        active-color="#13ce66"
        inactive-color="#ff4949"
        active-text="AGN View"
        inactive-text="PO View"
        @change="switchviewchange()">
     </el-switch>
      </el-col>
      <el-col :span="6"><div class="grid-content bg-purple" style="text-align:center;margin-left: 38px;">
     
     <el-select v-model="activeView" placeholder="Select view" size="mini">
        <el-option
          v-for="item in activeViews"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
    </el-select>
        <el-button
              id="buttonCancel" 
              
              
              size="mini"
             @click="closeOpenPO"
             style="display:inline-block;padding:6px"
           >X</el-button>
     </div></el-col>
    </el-row> -->
   </div>
  <el-row style="margin-bottom: 5px;">
    <el-col :span="8">Material:<div class="el-tag" >{{materialdataforPO}}</div></el-col>
    <el-col :span="8">Plant:<div class="el-tag">{{PlantdataforPO}}</div></el-col>
    <el-col :span="8">
      <!-- <div class="grid-content bg-purple" style="text-align:right"> <el-switch
        style="display: block"
        v-model="switchview"
        active-color="#0069aa"
        inactive-color="#909399"
        active-text="AGN View"
        inactive-text="PO View"
        @change="switchviewchange()">
     </el-switch></div> -->
    </el-col>
  </el-row>
 <div v-if="activeView==='AGNView'">
     <AGNViewtable :materialdataforPO="materialdataforPO" :PlantdataforPO="PlantdataforPO" :seqstrtypedataforPO="seqstrtypedataforPO" 
     @displaydefaultview="activeView=$event"></AGNViewtable>
 
  </div>
   <div v-else>
         <DefaultViewtable :materialdataforPO="materialdataforPO" :PlantdataforPO="PlantdataforPO"></DefaultViewtable>
      </div>
</div>

</template>

<script>
import { mapGetters } from 'vuex'
import { validateAdjustments } from '@/utils/open-po-validate'
import DefaultViewtable from './defaultview'
import AGNViewtable from './agnview'
import axios from 'axios'
 export default {
    props:{
      materialdataforPO:"",
      PlantdataforPO:"",
      seqstrtypedataforPO:""
    },
    computed: {
      ...mapGetters([
        'agnsForOpenPO'
      ])
    },
created(){
 this.$store
      .dispatch('inventory/getAGNforOpenPO',{
          material:this.getTruncatedMaterialforID(),
          plant: this.PlantdataforPO
         })
      .then(() => {})
      .catch(() => {
        console.log('getAGNforOpenPO service call failed')
      })
},
components:{
'DefaultViewtable' :DefaultViewtable,
'AGNViewtable' :AGNViewtable
 },
    data() {
      return {
       switchview:true,
        activeViews:[{
          value: 'DefaultView',
          label: 'PO View'
        },
        {
         value: 'AGNView',
          label: 'AGN View'
        }],
        activeView:'AGNView',
      }
    },
    methods: {
       getTruncatedMaterialforID() {
          return (
              (this.materialdataforPO.indexOf('-') > 0
              ? parseInt(this.materialdataforPO.split('-')[0]) 
                
              : this.materialdataforPO)
          )
        },
        switchviewchange()
        {if(this.switchview)
          this.activeView='AGNView'
          else
          this.activeView='POView'
       console.log("switchviewchange",this.switchview)
        },
          cancelOpenPO(){
            this.$emit('closedialogPO',true)
          },
          closeOpenPO(){
              this.$emit('closedialogPO',true)
              document.getElementById('btnRefresh').click()
            }, 
  }
  }
</script>

<style>
#AGN-table .el-table__footer-wrapper .el-table__footer tr {
    background-color: lightyellow;
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
</style>
