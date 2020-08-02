import axios from 'axios'
import conf from '../../config'

const state = {
  openPOsResponse: []
}

const mutations = {
  SET_OPEN_POS_RESPONSE: (state, data) => {
    state.openPOsResponse.push(data.validationResponse)
  }
}

const actions = {
  submitOpenPOs({ commit }, data) {
    const headers = {
      'client_id': conf.mule_client_id,
      'client_secret': conf.mule_client_secret,
      'Access-Control-Allow-Origin': '*',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
    var i = 0
    const size = data.excel_data.length
    var chunk
    var chunk_size = (data.thread_type === 'multi') ? data.chunk_size : data.excel_data.length
    while (i < size) {
      chunk = data.excel_data.slice(i, i += chunk_size)
      chunk = { 'invPoSeq': chunk }
      state.openPOsResponse = []
      axios.post(process.env.VUE_APP_BASE_API + '/proxy/agn/PK_IBP/INV_ADJ/INV_POST/INV_ADJ_PO_SEQSTR.xsjs', chunk, { headers: headers })
        .then((response) => {
          commit('SET_OPEN_POS_RESPONSE', response.data)
        }).then((response) => { })
        .catch((error) => {
          console.log('OPEN POS POST error', error)
        })
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
