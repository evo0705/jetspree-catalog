#!/bin/bash

# run npm run build only when the PROCFILE env variable is store.Procfile
if [[ $PROCFILE == 'store.Procfile' ]]; then
   rm -rf ./dist;
   npm run build;
fi
