

const fs = require('fs')


fs.readFile('npm.csv', function (err, data) {
    let dataS = data.toString()

    let lines = dataS.split('\n')

    for (let line of lines){
        let newPackage = {}

    }
})
