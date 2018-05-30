import React from 'react'
import { Route } from 'react-router-dom'
import ViewProductUploadFilesPage from 'modules/products/uploadFiles/ViewProductUploadFilesPage'

const ViewProductUploadFiles = (props) => {
  return (
    <div className="row row--no-gutter col-full-height scroll">
      <div className="col-xs-12 col-sm-12 col-md-10 col-lg-8 col-md-offset-1 col-lg-offset-2">
        <ViewProductUploadFilesPage />
      </div>
    </div>
  )
}

export default ViewProductUploadFiles;
