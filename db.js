/* -2
Dependency Name
Repository
GitHub Star
GitHub Forks
GitHub Watchers
Abondoned
Code Coverage %
Linters
Dependenats
NPM Stars
Maintainers
Contributors
Dependencies
License
Total Issues
Open Issues
Security Advisories
*/

const fs = require('fs')
const Package = require("./models/Package")

const mongoose = require( 'mongoose' );
const mongodb_URI = process.env.MONGO_URI

mongoose.connect( mongodb_URI, { useNewUrlParser: true, useUnifiedTopology: true } );
mongoose.set('useFindAndModify', false); 
mongoose.set('useCreateIndex', true);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {console.log("we are connected!!!")});


fs.readFile('npm.csv', async function (err, data) {
    let dataS = data.toString()
    let lines = dataS.split('\n')
    let num = 0
    let things = []

    for (let line of lines){
        let lineData = line.split(',')
        let newThing = new Package()

        newThing.num = num
        newThing.name = lineData[0]
        newThing.repository = lineData[1]
        newThing.GitHubStars = parseInt(lineData[2])
        newThing.GitHubWatchers = parseInt(lineData[4])
        newThing.abandoned = (lineData[5] === 'true')
        newThing.codeCoveragePercent = lineData[6]
        newThing.linters = parseInt(lineData[7])
        newThing.dependents = parseInt(lineData[8])
        newThing.maintainers = parseInt(lineData[9])
        newThing.contributors = parseInt(lineData[11])
        newThing.securityAdvisories = parseInt(lineData[16])
        newThing.totalIssues = parseInt(lineData[14])
        newThing.openIssues = parseInt(lineData[15])
        num += 1

        things.push(newThing)
    }

    let res = await db.collection('top_thousand').insertMany(things)
    console.log(res)
})

