import React from "react"
import Paper from "material-ui/Paper"

const MetaDataItem = ({ variantName, variantValue }) => {
  return (
    <div className="row row--no-gutter middle-xs" style={{ borderBottom: "1px solid rgb(224, 224, 224)" }}>
      <div className="col-xs-4 col--no-gutter" style={{ padding: "20px" }}>
        {variantName}
      </div>
      <div className="col-xs-8 col--no-gutter" style={{ padding: "20px" }}>
        {variantValue}
      </div>
    </div>
  )
}

const MetaDataGrid = ({ metadata }) => {
  let metadataNodes
  if (metadata) {
    metadataNodes = metadata.map((row, index) => <MetaDataItem key={index} variantName={row.name}
                                                                                    variantValue={row.value}/>)
  }

  return (
    <Paper className="paper-box" zDepth={1}>
      {metadataNodes}
    </Paper>
  )
}

export default MetaDataGrid
