import React from 'react'
import { Route } from 'react-router-dom'
import ListProductUploadFilesPage from 'modules/products/uploadFiles/ListProductUploadFilesPage'

const ListProductUploadFiles = (props) => {
  return (
    <div className="row row--no-gutter col-full-height scroll">
      <div className="col-xs-12 col-sm-12 col-md-10 col-lg-10 col-md-offset-1 col-lg-offset-1">
        <ListProductUploadFilesPage />
      </div>
    </div>
  )
}

export default ListProductUploadFiles;
