import React from "react"
import style from "./style.css"
import Paper from "material-ui/Paper"

const VariantValueRow = ({ variantValue }) => {
  return (
    <div className={style.gridRow}>
      <div className={style.gridCol}>
        {variantValue.name}
      </div>
      <div className={style.gridCol}>
        {variantValue.value}
      </div>
    </div>
  )
}

const ProductVariantValuesGrid = ({ variantValues }) => {
  const hasVariantValues = variantValues && variantValues.length > 0

  const VariantValueRows = hasVariantValues ? variantValues.map((variantValue, index) => (
    <VariantValueRow
      key={index}
      variantValue={variantValue}
    />
  )) : null

  return (
    <Paper className="paper-box" zDepth={1}>
      <div className={style.grid}>
        {VariantValueRows}
      </div>
    </Paper>
  )
}

export default ProductVariantValuesGrid
