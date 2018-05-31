#!/bin/bash

# run npm run build only when the PROCFILE env variable is store.Procfile
if [[ $PROCFILE == 'admin.Procfile' ]]; then
   echo Post build for admin.Procfile
   rm -rf ./dist;
   npm run build-web;
elif [[ $PROCFILE == 'api.Procfile' ]]; then
  echo Post build for api.Procfile
  npm run build-api
fi
