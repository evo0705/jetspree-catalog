const csv = require("csv")

async function ParseCSVString(csvString) {
  return new Promise(function (onResolve, onReject) {
    csv.parse(csvString,
      {
        delimiter: ",", // default is ,
        columns:   true,  // if the first of the csv line is headers
      },
      (err, data) => {
        if (err) {
          onReject(err)
        }
        onResolve(data)
      })
  })
}

module.exports = { ParseCSVString }
