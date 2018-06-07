import React from "react"
import Paper from "material-ui/Paper"
import messages from "lib/text"
import styles from "./VariantList.css"

const VariantValueItem = ({ variantValue }) => {
  return (
    <div className={styles.gridRow}>
      <div className={styles.gridRowCol}>
        {variantValue.name}
      </div>
      <div className={styles.gridRowCol}>
        {variantValue.value}
      </div>
    </div>
  )
}

const ProductVariantValuesGrid = ({ settings, options, variantValues }) => {
  const hasVariantValues = variantValues && variantValues.length > 0
  console.log(variantValues)
  const variantValueRows = hasVariantValues ? variantValues.map((variantValue, index) => (
    <VariantValueItem key={index} variantValue={variantValue}/>
  )) : null

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
