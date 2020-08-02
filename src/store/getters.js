const getters = {
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  loading: state => state.inventory.loading,
  materials: state => state.inventory.materials,
  plantsDDL: state => state.inventory.plantsDDL,
  plantsPopupDDL: state => state.inventory.plantsPopupDDL,
  masterPlants: state => state.inventory.masterPlants,
  chosenDC: state => state.inventory.chosenDC,
  agnsDDL: state => state.inventory.agnsDDL,
  agnsCode: state => state.inventory.agnsCode,
  agnsPopupDDL: state => state.inventory.agnsPopupDDL,
  agnsForOpenPO: state => state.inventory.agnsForOpenPO,
  masterAgns: state => state.inventory.masterAgns,
  chosenAGN: state => state.inventory.chosenAGN,
  chosenMaterial: state => state.inventory.chosenMaterial,
  chosenQty: state => state.inventory.chosenQty,
  expandRowKeys: state => state.inventory.expandRowKeys,
  dialogFormVisible: state => state.inventory.dialogFormVisible,
  isPerformAdjustmentsAttempted: state => state.inventory.isPerformAdjustmentsAttempted,
  rawFilteredAdjustments: state => state.inventory.rawFilteredAdjustments,
  filteredAdjustments: state => state.inventory.filteredAdjustments,
  adjustmentsForm: state => state.inventory.adjustmentsForm,
  isRequestProcessing: state => state.inventory.isRequestProcessing,
  adjustmentsResponse: state => state.inventory.adjustmentsResponse,
  loggedInUserEmail: state => state.inventory.loggedInUserEmail,
  loggedInUserFullName: state => state.inventory.loggedInUserFullName,
  loggedInUserEid: state => state.inventory.loggedInUserEid,
  openPOResponse: state => state.inventory.openPOResponse,
  openPOsResponse: state => state.bulk_import.openPOsResponse,
  uGroup: state => state.inventory.uGroup,
  showMassUpload: state => state.inventory.showMassUpload
}
export default getters