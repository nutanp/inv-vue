import { getPlantsInfo } from '@/api/inventory'
import { getMaterialsBySuggestions } from '@/api/inventory'
import { getAllAGN } from '@/api/inventory'
import { getAGNforOpenPO } from '@/api/inventory'
import { getPoDocTypes } from '@/api/inventory'
import { getAdjustmentsByFilter } from '@/api/inventory'
import axios from 'axios'
import conf from '../../config'
import _ from 'lodash'

const state = {
  loading: false,
  chosenMaterial: '',
  chosenDC: '',
  chosenAGN: '',
  chosenQty: '',
  plantsDDL: [],
  plantsPopupDDL: [],
  masterPlants: [],
  materials: [],
  agnsDDL: [],
  agnsCode: [],
  agnsPopupDDL: [],
  masterAgns: [],
  agnsForOpenPO: [],
  expandRowKeys: [],
  poDocTypes: [],
  dialogFormVisible: false,
  isPerformAdjustmentsAttempted: false,
  rawFilteredAdjustments: [],
  filteredAdjustments: [],
  adjustmentsForm: {
    material: '',
    adjustmentsToBeDone: [
      {
        rowId: '',
        sourceDC: '',
        sourceDcName: '',
        sourceAGN: '',
        destDC: '',
        isPlantError: false,
        destAGN: '',
        isAgnError: false,
        adjQuantity: '',
        isQtyError: false,
        isQtyError2: false,
        isQtyError3: false,
        isQtyError4: false,
        validationMessage: '',
        isServerValidationFailed: false,
        isUpdatedAfterHanaValidation: false
      }
    ],
    adjustmentsErrorOut: []
  },
  isRequestProcessing: false,
  adjustmentsResponse: [],
  openPOResponse: [],
  loggedInUserEmail: '',
  loggedInUserFullName: '',
  loggedInUserEid: '',
  uGroup: '',
  showMassUpload: false
}

const mutations = {
  SET_LOADING: (state, data) => {
    state.loading = data
  },
  SET_LOGGEDIN_USER_EMAIL: (state, data) => {
    state.loggedInUserEmail = data
  },
  SET_LOGGEDIN_USER_FULL_NAME: (state, data) => {
    state.loggedInUserFullName = data
  },
  SET_LOGGEDIN_USER_EID: (state, data) => {
    state.loggedInUserEid = data
  },
  SET_UGROUP: (state, data) => {
    state.uGroup = data
  },
  SET_SHOW_MASS_UPLOAD: (state, data) => {
    state.showMassUpload = data
  },
  SET_PLANTS: (state, data) => {
    const updatedData = _.uniqWith(data, _.isEqual)
    state.masterPlants = updatedData
    const mergedPlantsWithDescription = updatedData.map(plantObj => plantObj.PLANT + '-' + plantObj.DESCRIPTION)
    state.plantsDDL = mergedPlantsWithDescription
    state.plantsPopupDDL = _.uniqWith(updatedData.map(plantObj => plantObj.PLANT), _.isEqual)
    state.plantsDDL.unshift('---All-Plants---')
  },
  SET_MATERIALS: (state, data) => {
    state.materials = data
  },
  SET_AGNS: (state, data) => {
    state.masterAgns = data
    const mergedAgnDescription = data.map(agnObj => agnObj.AGN + ':' + agnObj.DESCRIPTION)
    state.agnsDDL = mergedAgnDescription
    state.agnsPopupDDL = JSON.parse(JSON.stringify(mergedAgnDescription))
    state.agnsDDL.unshift('---All-AGN---')
  },
  SET_AGNS_FOR_OPENPO: (state, data) => {
    state.agnsForOpenPO = data
    state.agnsCode = data.map(agnObj => agnObj.AGN)
  },
  SET_PODOCTYPES: (state, data) => {
    state.poDocTypes = data
  },
  SET_DC_AGN: (state, data) => {
    state.chosenDC = data.dc
    state.chosenAGN = data.agn
    state.chosenMaterial = data.material
    state.chosenQty = data.quantity
  },
  SET_CHOSEN_MATERIAL: (state, data) => {
    state.chosenMaterial = data
  },
  SET_CHOSEN_QTY: (state, data) => {
    state.chosenQty = data
  },
  SET_EXPAND_ROW_KEYS: (state, data) => {
    state.expandRowKeys = data
  },
  SET_DIALOG_FORM_VISIBLE: (state, data) => {
    state.dialogFormVisible = data
  },
  SET_INITIAL_ADJUSTMENT: (state, data) => {
    state.adjustmentsForm.material = data.material
    state.adjustmentsForm.adjustmentsToBeDone[0].rowId = 'row-1'
    state.adjustmentsForm.adjustmentsToBeDone[0].sourceDC = data.plant
    state.adjustmentsForm.adjustmentsToBeDone[0].sourceDcName = data.plantname
    state.adjustmentsForm.adjustmentsToBeDone[0].sourceAGN = data.agn + ':' + data.agnname
    state.adjustmentsForm.adjustmentsToBeDone[0].destDC = data.plant
    state.adjustmentsForm.adjustmentsToBeDone[0].validationMessage = ''
  },
  SET_ADJUSTMENTS_TOBEDONE: (state, data) => {
    if (Array.isArray(data)) {
      state.adjustmentsForm.adjustmentsToBeDone = data
    } else {
      state.adjustmentsForm.adjustmentsToBeDone.push(data)
    }
  },
  SET_ADJUSTMENTS_ERROR: (state, data) => {
    state.adjustmentsForm.adjustmentsErrorOut = data
  },
  SET_FILTERED_ADJUSTMENTS: (state, data) => {
    state.filteredAdjustments = data
  },
  SET_RAW_FILTERED_ADJUSTMENTS: (state, data) => {
    state.rawFilteredAdjustments = data
  },
  RESET_RAW_FILTERED_ADJUSTMENTS: (state, data) => {
    state.rawFilteredAdjustments = []
  },
  SET_PERFORM_ADJ_ATTEMPTED: (state, data) => {
    state.isPerformAdjustmentsAttempted = data
  },
  SET_REQUEST_PROCESSING: (state, data) => {
    state.isRequestProcessing = data
  },
  SET_ADJUSTMENTS_RESPONSE: (state, data) => {
    state.adjustmentsResponse = []
    state.adjustmentsResponse.push(data.invAdjResp)
  },
  RESET_ADJUSTMENTS_RESPONSE: (state, data) => {
    state.adjustmentsResponse = []
  },
  RESET_FILTERED_ADJUSTMENTS: (state, data) => {
    state.filteredAdjustments = []
  },
  RESET_OPENPO: (state, data) => {
    state.openPOResponse = {}
  },
  RESET_CHOSEN: (state, data) => {
    state.chosenDC = ''
    state.chosenAGN = ''
    state.chosenMaterial = ''
    state.chosenQty = ''
  },
  SET_OPENPO_RESPONSE: (state, data) => {
    state.openPOResponse = {}
    state.openPOResponse.push(data)
  }

}

const actions = {
  setLoading({ commit }, data) {
    commit('SET_LOADING', data)
  },
  setLoggedInUserEmail({ commit }, data) {
    commit('SET_LOGGEDIN_USER_EMAIL', data)
  },
  setLoggedInUserFullName({ commit }, data) {
    commit('SET_LOGGEDIN_USER_FULL_NAME', data)
  },
  setLoggedInUserEid({ commit }, data) {
    commit('SET_LOGGEDIN_USER_EID', data)
  },
  setUgroup({ commit }, data) {
    commit('SET_UGROUP', data)
  },
  setShowMassUpload({ commit }, data) {
    commit('SET_SHOW_MASS_UPLOAD', data)
  },
  getAllPlants({ commit }) {
    getPlantsInfo().then((response) => {
      commit('SET_PLANTS', response)
    })
  },
  getMaterialsBySuggestions({ commit }, searchString) {
    getMaterialsBySuggestions(searchString).then((response) => {
      commit('SET_MATERIALS', response.results)
    })
  },
  getAllAGN({ commit }, agnType) {
    getAllAGN(agnType).then((response) => {
      commit('SET_AGNS', response.agns)
    })
  },
  getAGNforOpenPO({ commit }, dataParam) {
    const materialParam = dataParam.material
    const plantParam = dataParam.plant
    getAGNforOpenPO(materialParam, plantParam).then((response) => {
      commit('SET_AGNS_FOR_OPENPO', response)
    })
  },
  getPoDocTypes({ commit }) {
    getPoDocTypes.then((response) => {
      commit('SET_PODOCTYPES', response)
    })
  },
  setExpandRowKeys({ commit }, dataParam) {
    commit('SET_EXPAND_ROW_KEYS', dataParam)
  },
  setDialogFormVisible({ commit }, dataParam) {
    commit('SET_DIALOG_FORM_VISIBLE', dataParam)
  },
  setChosenMaterial({ commit }, dataParam) {
    commit('SET_CHOSEN_MATERIAL', dataParam)
  },
  setChoseQty({ commit }, dataParam) {
    commit('SET_CHOSEN_QTY', dataParam)
  },
  getAdjustmentsByFilter({ commit }, dataParam) {
    const materialParam = dataParam.material.indexOf('-') > 0 ? dataParam.material.split('-')[0] : dataParam.material
    const plantParam = dataParam.plant[0] === '---All-Plants---' ? state.plantsPopupDDL.toString() : dataParam.plant.map(p => p.split('-')[0]).toString()
    const agnParam = dataParam.agn[0] === '---All-AGN---' ? 'ALL' : dataParam.agn.map(a => a.split(':')[0]).toString()
    const data = []
    getAdjustmentsByFilter(agnParam, materialParam, plantParam, state.uGroup, state.loggedInUserEid).then((response) => {
      response = _.orderBy(response, ['Plant', 'AGN'], ['asc', 'asc'])
      // deep copy the response to new variable
      const exportResponse = JSON.parse(JSON.stringify(response))
      // Restructuring data in order to display it in the Grid as nested / hierarchical data
      const uniquePlants = _.uniqWith(response.map(p => p.Plant), _.isEqual)
      for (const plant of uniquePlants) {
        data.push({
          Material: response.filter(x => x.Plant === plant)[0].Material,
          Plant: plant,
          plantName: state.masterPlants.find(p => p.PLANT === plant).DESCRIPTION,
          DCOHQuantity: Math.max(...response.filter(x => x.Plant === plant).map(r => r.DCOHQuantity)),
          IsTotalAvailableAccurate: (Math.max(...response.filter(x => x.Plant === plant).map(r => r.DCOHQuantity)) === response.filter(x => x.Plant === plant).map(a => Number(a.Available)).reduce((sum, cv) => sum + Number(cv), 0)),
          //  dcTotalPOQuantity: response.filter(x => x.Plant === plant).map(r => r.POQuantity).reduce((sum, cv) => sum + Number(cv), 0),
          dcTotalPOQuantity: Math.max(...response.filter(x => x.Plant === plant).map(r => r.DCOPOQuantity)),
          dcTotalSTOinTransit: response.filter(x => x.Plant === plant).map(r => r.STOinTransit).reduce((sum, cv) => sum + Number(cv), 0),
          AGNS: response.filter(x => x.Plant === plant).map(r => ({ AGN: r.AGN.indexOf('*****') >= 0 ? '***' : r.AGN, Available: Number(r.Available), POQuantity: Number(r.POQuantity), STOinTransit: Number(r.STOinTransit), LOCKED: r.LOCKED }))
        })
      }
      for (const main_item of data) {
        for (const sub_item of main_item.AGNS) {
          if (state.masterAgns.find(a => (a.AGN.indexOf('*****') >= 0 ? '***' : a.AGN) === sub_item.AGN)) {
            sub_item.AgnName = state.masterAgns.find(a => (a.AGN.indexOf('*****') >= 0 ? '***' : a.AGN) === sub_item.AGN).DESCRIPTION
          } else {
            sub_item.AgnName = ''
          }
        }
      }
      commit('SET_FILTERED_ADJUSTMENTS', data)
      // Updating data as per excel export requirements
      const exportResponseExt = _.each(exportResponse, function(element) {
        const maxAvailableQty = exportResponse.filter(i => i.Plant === element.Plant).map(i => Number(i.DCOHQuantity))
        const maxAvailableResult = Math.max.apply(null, maxAvailableQty)
        element.TotalAvailableQty = maxAvailableResult
        const sumPoQty = exportResponse.filter(i => i.Plant === element.Plant).map(i => Number(i.POQuantity)).reduce((sum, cv) => sum + Number(cv), 0)
        element.TotalPoQty = sumPoQty
        const sumStoQty = exportResponse.filter(i => i.Plant === element.Plant).map(i => Number(i.STOinTransit)).reduce((sum, cv) => sum + Number(cv), 0)
        element.TotalStoQty = sumStoQty
      })
      commit('SET_RAW_FILTERED_ADJUSTMENTS', exportResponseExt)
    })
  },
  setDCandAGN({ commit }, data) {
    commit('SET_DC_AGN', data)
  },
  setAdjustmentsToBeDone({ commit }, data) {
    commit('SET_ADJUSTMENTS_TOBEDONE', data)
  },
  setAdjustmentsError({ commit }, data) {
    commit('SET_ADJUSTMENTS_ERROR', data)
  },
  setInitialAdjustment({ commit }, data) {
    commit('SET_INITIAL_ADJUSTMENT', data)
  },
  setIsRequestProcessing({ commit }, data) {
    commit('SET_REQUEST_PROCESSING', data)
  },
  setIsPerformAdjustmentsAttempted({ commit }, data) {
    commit('SET_PERFORM_ADJ_ATTEMPTED', data)
  },
  resetFilteredAdjustments({ commit }) {
    commit('RESET_FILTERED_ADJUSTMENTS', [])
  },
  resetAdjustmentsResponse({ commit }) {
    commit('RESET_ADJUSTMENTS_RESPONSE', [])
  },
  resetChosen({ commit }) {
    commit('RESET_CHOSEN', '')
  },
  resetOpenPOResponse({ commit }) {
    commit('RESET_OPENPO', [])
  },
  resetRawFilteredAdjustments({ commit }) {
    commit('RESET_RAW_FILTERED_ADJUSTMENTS', [])
  },
  performAdjustments({ commit }, data) {
    const headers = {
      'client_id': conf.mule_client_id,
      'client_secret': conf.mule_client_secret,
      'Access-Control-Allow-Origin': '*',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'UGROUP': state.uGroup,
      'EID': state.loggedInUserEid
    }
    axios.post(process.env.VUE_APP_BASE_API + '/inventory/adjustment', JSON.stringify(data), { headers: headers })
      .then((response) => {
        commit('SET_ADJUSTMENTS_RESPONSE', response.data)
        return response.data
      }).then((response) => { })
      .catch((error) => {
        console.log(error)
      })
  },

  submitOpenPO({ commit }, data) {
    const headers = {
      // 'client_id': conf.mule_client_id,
      // 'client_secret': conf.mule_client_secret,
      // 'Access-Control-Allow-Origin': '*',
      // 'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
    // https://ws-qa-internal.something.com/MckWebServices/qa/1.0.1/ibp/process/proxy/agn/PK_IBP/INV_ADJ/INV_POST/ INV_ADJ_PO_SEQSTR.xsjs
    axios.post(process.env.VUE_APP_BASE_API + '/proxy/agn/PK_IBP/INV_ADJ/INV_POST/INV_ADJ_PO_SEQSTR.xsjs', JSON.stringify(data), { headers: headers })
      .then((response) => {
        commit('SET_OPENPO_RESPONSE', response.data)
      }).then((response) => { })
      .catch((error) => {
        console.log('OPEN PO POST error', error)
      })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
