import React from "react"
import Paper from "material-ui/Paper"
import FontIcon from "material-ui/FontIcon"
import IconButton from "material-ui/IconButton"
import messages from "lib/text"
import styles from "./VariantList.css"

const VariantItem = ({ variant }) => {
  return (
    <div className={styles.gridRow}>
      <div className={styles.gridRowCol}>
        {variant}
      </div>
    </div>
  )
}

const ProductVariantsGrid = ({ settings, options, variants }) => {
  const hasVariants = variants && variants.length > 0
  const variantRows = hasVariants ? variants.map((variant, index) => (
    <VariantItem key={index} variant={variant}/>
  )) : null

  return (
    <Paper className="paper-box" zDepth={1}>
      <div className={styles.grid}>
        <div className={styles.gridHeadRow}>
          <div className={styles.gridCol}>{messages.products_sku}</div>
        </div>
        {variantRows}
      </div>
    </Paper>
  )
}

export default ProductVariantsGrid
