import React from "react"
import Paper from "material-ui/Paper"
import messages from "lib/text"
import styles from "./VariantList.css"

const VariantValueItem = ({ variantName, variantValue }) => {
  return (
    <div className={styles.gridRow}>
      <div className={styles.gridRowCol}>
        {variantName}
      </div>
      <div className={styles.gridRowCol}>
        {variantValue}
      </div>
    </div>
  )
}

const ProductVariantValuesGrid = ({ settings, options, variantValues }) => {
  const hasVariantValues = variantValues && Object.getOwnPropertyNames(variantValues).length > 0
  let variantValueRows = null
  if (hasVariantValues) {
    variantValueRows = Object.getOwnPropertyNames(variantValues).map((variantProperty, index) => (
      <VariantValueItem key={index} variantName={variantProperty} variantValue={variantValues[variantProperty]}/>
    ))
  }

  return (
    <Paper className="paper-box" zDepth={1}>
      <div className={styles.grid}>
        <div className={styles.gridHeadRow}>
          <div className={styles.gridCol}>{messages.variantName}</div>
          <div className={styles.gridCol}>{messages.variantValue}</div>
        </div>
        {variantValueRows}
      </div>
    </Paper>
  )
}

export default ProductVariantValuesGrid
