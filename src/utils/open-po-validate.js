export function allocQtySumOnPO(changedAdjustment, adjustments)
{
  let errorCountforOpenQty=0
  let PONumber = changedAdjustment.poNum
  if(changedAdjustment.adjustmentQty<=0 || 
    (String(changedAdjustment.adjustmentQty).indexOf('.') >= 0) 
    ){
    let message = "Alloc Qty should not be empty,decimal,negative or 0."
    changedAdjustment.qtySumValidationMessage=message
    changedAdjustment.isQtyError4 = true
    changedAdjustment.req_status = 'E'
    errorCountforOpenQty++
    return errorCountforOpenQty
  }
  changedAdjustment.isQtyError4 = false
  changedAdjustment.req_status = ''
  changedAdjustment.qtySumValidationMessage=""

  //find out all rcords for above PO in all adjustments
  let allRecordsForChangedAdjustment = adjustments.filter(ele=> ele.poNum===PONumber)
  console.log('allRecordsForChangedAdjustment',allRecordsForChangedAdjustment)
  
  let OpenQty = allRecordsForChangedAdjustment[0].openQty

  let totalQtyEnteredByUser = allRecordsForChangedAdjustment
                                .filter(ele=> ele.newAddedRow)
                                .map(ele=>ele.adjustmentQty)
                                .reduce((t,v)=>parseInt(t)+parseInt(v),0)
  
  // time to generate error if sourceQty is less than total Qty entered by user
  if(totalQtyEnteredByUser > OpenQty){
    let message=''
    if(allRecordsForChangedAdjustment.filter(ele=> ele.newAddedRow).length==1)
      message = "Alloc Qtys' should not exceed the Open Qty."
    else
      message = "Sum of Alloc Qtys' should not exceed the Open Qty."
    changedAdjustment.qtySumValidationMessage=message
    changedAdjustment.isQtyError4 = true
    changedAdjustment.req_status = 'E'
    errorCountforOpenQty++
  }
  // else block will be executed when user inuts do not generate any error, 
  // clear out messages from all rows added by the user.
  // reset error relateed flags.
  // reset error count for open qty
  else{
    allRecordsForChangedAdjustment.forEach(ele=>{
      ele.qtySumValidationMessage=''
      ele.isQtyError4 = false
      ele.req_status = ''
      errorCountforOpenQty=0
    })
  }
 return errorCountforOpenQty

}
export function agnDropdownvalidation(adjustments)
{
  let errorCountforAGN = 0
  for(const adj of adjustments)
  {
    adj.agnValidationMessage = ''
    adj.isAgnError = false
    if(adj.newAddedRow){
      if (adj.agn === adj.sourceAGN) {
        adj.agnValidationMessage = 'Source and Target AGN should not be same with in same DC. '
        adj.isAgnError = true
        adj.req_status = 'E'
        errorCountforAGN++
      // } else {
      //   adj.agnValidationMessage = adj.agnValidationMessage.replace(
      //     /Source and Target AGN should not be same with in same DC./g,
      //     ''
     // adj.req_status = 'E'
       // adj.isAgnError = false
      //   )
        
      }

    }
  } 
  return errorCountforAGN

}
export function validateAdjustments(adjustments) {
  let errorCount = 0
  for (const adj of adjustments) {
    if (adj.newAddedRow) {
      if (adj.agn === adj.sourceAGN) {
        if (
          adj.validationMessage.indexOf(
            'Source and Target AGN should not be same with in same DC.'
          ) < 0
        ) {
          adj.validationMessage +=
            'Source and Target AGN should not be same with in same DC. '
        }
        adj.isAgnError = true
        adj.req_status = 'E'
        errorCount++
      } else {
        adj.validationMessage = adj.validationMessage.replace(
          /Source and Target AGN should not be same with in same DC./g,
          ''
        )
        adj.isAgnError = false
      }

      if (parseInt(adj.adjustmentQty) > parseInt(adj.sourceOpenQty)) {
        if (
          adj.validationMessage.indexOf(
            'Alloc Qty should not exceed the Open Qty.'
          ) < 0
        ) {
          adj.validationMessage +=
                'Alloc Qty should not exceed the Open Qty.'
        }
        adj.isQtyError1 = true
        adj.req_status = 'E'
        errorCount++
      } else {
        adj.validationMessage = adj.validationMessage.replace(
          /Alloc Qty should not exceed the Open Qty./g,
          ''
        )
        adj.isQtyError1 = false
      }

      if (parseInt(adj.adjustmentQty) <= 0 || Number.isNaN(parseInt(adj.adjustmentQty))) {
        if (
          adj.validationMessage.indexOf(
            'Alloc Qty should be numeric and should not be empty, negative or 0.'
          ) < 0
        ) {
          adj.validationMessage +=
                    'Alloc Qty should be numeric and should not be empty, negative or 0.'
        }
        adj.isQtyError2 = true
        adj.req_status = 'E'
        errorCount++
      } else {
        adj.validationMessage = adj.validationMessage.replace(
          /Alloc Qty should be numeric and should not be empty, negative or 0./g,
          ''
        )
        adj.isQtyError2 = false
      }

      if ((String(adj.adjustmentQty)).indexOf('.') >= 0) {
        if (
          adj.validationMessage.indexOf(
            'Decimal point not allowed for Alloc Qty.'
          ) < 0
        ) {
          adj.validationMessage +=
                    'Decimal point not allowed for Alloc Qty. '
        }
        adj.isQtyError3 = true
        adj.req_status = 'E'
        errorCount++
      } else {
        adj.adjustmentQty = parseInt(adj.adjustmentQty)
        adj.validationMessage = adj.validationMessage.replace(
          /Decimal point not allowed for Alloc Qty./g,
          ''
        )
        adj.isQtyError3 = false
      }
    }
  }

  var sums = []
  for (const adj of adjustments) {
    if (adj.newAddedRow) {
      if (sums[adj.sourceAGN] === undefined) {
        sums[adj.sourceAGN] = adj.adjustmentQty
      } else {
        sums[adj.sourceAGN] = sums[adj.sourceAGN] + adj.adjustmentQty
      }
    }
  }

  for (const adj of adjustments) {
    if (adj.newAddedRow && !adj.isQtyError) {
      if (sums[adj.sourceAGN] > parseInt(adj.sourceOpenQty)) {
        if (
          adj.validationMessage.indexOf(
            "Sum of Alloc Qtys' should not exceed the Open Qty."
          ) < 0
        ) {
          adj.validationMessage +=
                    "Sum of Alloc Qtys' should not exceed the Open Qty."
        }
        adj.isQtyError4 = true
        adj.req_status = 'E'
        errorCount++
      } else {
        adj.validationMessage = adj.validationMessage.replace(
          /Sum of Alloc Qtys' should not exceed the Open Qty./g,
          ''
        )
        adj.isQtyError4 = false
      }
    }
  }

  return errorCount
}
