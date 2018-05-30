#!/bin/bash

# run npm run build only when the PROCFILE env variable is store.Procfile
if [[ $PROCFILE == 'store.Procfile' ]]; then
   echo Post build for store.Procfile
   rm -rf ./dist;
   npm run build;
elif [[ $PROCFILE == 'api.Procfile' ]]; then
  echo Post build for api.Procfile
  rm -rf ./build;
  babel . --out-dir build --ignore node_modules;
fi
