import request from '@/utils/axios-request'

export function getPlantsInfo() {
  return request({
    url: '/proxy/agn/PK_IBP/INV_ADJ/PLANT/PLANT.xsjs',
    method: 'get'
  })
}

export function getMaterialsBySuggestions(searchString) {
  return request({
    url: '/searchItem?searchstring=' + searchString,
    method: 'get'
  })
}

export function getAllAGN(agnType) {
  return request({
    url: "/proxy/agn/PK_IBP/AGN/AGN_API/AGN.xsjs?AGN_TYPE=" + agnType,
    method: 'get'
  })
}
export function getAGNforOpenPO(materialParam, plantParam) {
  return request({
    url: '/proxy/agn/PK_IBP/INV_ADJ/PLANT/AGN.xsjs?material=' + materialParam + '&PLANT=' + plantParam,
    method: 'get'
  })
}

export function getPoDocTypes() {
  return request({
    url: '/proxy/agn/PK_IBP/INV_ADJ/PLANT/PO_TYPES.xsjs',
    method: 'get'
  })
}

export function getAdjustmentsByFilter(agnParam, materialParam, plantParam, ugroup, eid) {
  return request({
    url: '/proxy/agn/PK_IBP/INV_ADJ/READ_COMPS/READ_MAT_QTY.xsjs?AGN=' + agnParam + '&Material=' + materialParam + '&PLANT=' + plantParam + '&UGROUP=' + ugroup + '&EID=' + eid,
    method: 'get'
  })
}

