/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
  const valid_map = ['admin', 'editor']
  return valid_map.indexOf(str.trim()) >= 0
}

function getShortAGN(agn) {
  const len = agn.split(':').length
  let result = ''
  switch (len) {
    case 2:
      result = agn.split('')[1]
      break
    default:
      result = agn[0]
  }
  return '***' + ':' + result
}

export function validateAdjustments(adjustments, chosenQty) {
  let errorCount = 0
  for (const adj of adjustments) {
    if (adj.destDC === '' && adj.destAGN === '') {
      if (
        adj.validationMessage.indexOf(
          'Should have valid Target DC and Target AGN.'
        ) < 0
      ) {
        adj.validationMessage +=
          'Should have valid Target DC and Target AGN. '
      }
      adj.isPlantError = true
      adj.isAgnError = true
      errorCount++
    } else if (adj.destDC === '') {
      if (
        adj.validationMessage.indexOf('Should have valid Target DC.') < 0
      ) {
        adj.validationMessage += 'Should have valid Target DC. '
      }
      adj.validationMessage = adj.validationMessage.replace(
        /Should have valid Target DC and Target AGN./g,
        ''
      )
      adj.isPlantError = true
      adj.isAgnError = false
      errorCount++
    } else if (adj.destAGN === '') {
      if (
        adj.validationMessage.indexOf('Should have valid Target AGN.') < 0
      ) {
        adj.validationMessage += 'Should have valid Target AGN. '
      }
      adj.validationMessage = adj.validationMessage.replace(
        /Should have valid Target DC and Target AGN./g,
        ''
      )
      adj.isPlantError = false
      adj.isAgnError = true
      errorCount++
    } else {
      adj.validationMessage = adj.validationMessage.replace(
        /Should have valid Target DC and Target AGN./g,
        ''
      )
      adj.validationMessage = adj.validationMessage.replace(
        /Should have valid Target DC./g,
        ''
      )
      adj.validationMessage = adj.validationMessage.replace(
        /Should have valid Target AGN./g,
        ''
      )
      adj.isPlantError = false
      adj.isAgnError = false
    }
    if (parseInt(adj.adjQuantity) > parseInt(chosenQty)) {
      if (
        adj.validationMessage.indexOf(
          'Adjustment quantity should not exceed the actual value.'
        ) < 0
      ) {
        adj.validationMessage +=
          'Adjustment quantity should not exceed the actual value. '
      }
      adj.isQtyError = true
      errorCount++
    } else {
      adj.validationMessage = adj.validationMessage.replace(
        /Adjustment quantity should not exceed the actual value./g,
        ''
      )
      adj.isQtyError = false
    }
    if (
      parseInt(adj.adjQuantity) <= 0 ||
      Number.isNaN(parseInt(adj.adjQuantity))
    ) {
      if (
        adj.validationMessage.indexOf(
          'Adjustment quantity should be numeric and should not be empty, negative or 0.'
        ) < 0
      ) {
        adj.validationMessage +=
          'Adjustment quantity should be numeric and should not be empty, negative or 0. '
      }
      adj.isQtyError2 = true
      errorCount++
    } else {
      adj.validationMessage = adj.validationMessage.replace(
        /Adjustment quantity should be numeric and should not be empty, negative or 0./g,
        ''
      )
      adj.isQtyError2 = false
    }
    if ((String(adj.adjQuantity)).indexOf('.') >= 0) {
      if (
        adj.validationMessage.indexOf(
          'Decimal point not allowed for adjustment quantity.'
        ) < 0
      ) {
        adj.validationMessage +=
          'Decimal point not allowed for adjustment quantity. '
      }
      adj.isQtyError3 = true
      errorCount++
    } else {
      adj.adjQuantity = parseInt(adj.adjQuantity)
      adj.validationMessage = adj.validationMessage.replace(
        /Decimal point not allowed for adjustment quantity./g,
        ''
      )
      adj.isQtyError3 = false
    }
    if (adj.sourceDC === adj.destDC && adj.sourceAGN === (adj.destAGN.indexOf('*****') >= 0 ? getShortAGN(adj.destAGN) : adj.destAGN)) {
      if (
        adj.validationMessage.indexOf(
          'Source and Target AGN should not be same with in same DC.'
        ) < 0
      ) {
        adj.validationMessage +=
          'Source and Target AGN should not be same with in same DC. '
      }
      adj.isAgnError2 = true
      errorCount++
    } else {
      adj.validationMessage = adj.validationMessage.replace(
        /Source and Target AGN should not be same with in same DC./g,
        ''
      )
      adj.isAgnError2 = false
    }
  }
  const totalAdj = adjustments.reduce(
    (sum, cv) => sum + parseInt(cv.adjQuantity),
    0
  )
  for (const adj of adjustments) {
    if (parseInt(totalAdj) > parseInt(chosenQty)) {
      if (
        adj.validationMessage.indexOf(
          'Sum of Adjustments should not exceed the actual value.'
        ) < 0
      ) {
        adj.validationMessage +=
          'Sum of Adjustments should not exceed the actual value. '
      }
      adj.isQtyError4 = true
      errorCount++
    } else {
      adj.validationMessage = adj.validationMessage.replace(
        /Sum of Adjustments should not exceed the actual value./g,
        ''
      )
      adj.isQtyError4 = false
    }
  }
  return errorCount
}

export function showServerValidationResponseOnUI(adjustments, serverResponse) {
  // eslint-disable-next-line no-unused-vars
  let resToLoop = serverResponse
  if (Array.isArray(serverResponse[0])) {
    resToLoop = serverResponse[0]
  } else {
    resToLoop = serverResponse
  }
  for (const resp of resToLoop) {
    for (const adj of adjustments) {
      if (resp.sourceDC === adj.sourceDC &&
        (resp.sourceAGN.indexOf('*****') >= 0 ? '***' : resp.sourceAGN) === adj.sourceAGN.split(':')[0] &&
        resp.destinationDC === adj.destDC &&
        (resp.destinationAGN.indexOf('*****') >= 0 ? '***' : resp.destinationAGN) === (adj.destAGN.split(':')[0].indexOf('*****') >= 0 ? '***' : adj.destAGN.split(':')[0]) &&
        parseInt(resp.adjustmentQty) === parseInt(adj.adjQuantity)) {
        adj.validationMessage = resp.errorMessage
        if (resp.errorMessage.toLowerCase().indexOf('initial') === 0) {
          adj.isServerValidationFailed = false
          adj.validationMessage = 'Validation Successful'
        } else {
          adj.isServerValidationFailed = true
        }
      }
    }
  }
}
