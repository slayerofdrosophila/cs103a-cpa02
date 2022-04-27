'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const Mixed = Schema.Types.Mixed;

var packageSchema = Schema( {
    name: String,
    repository: String,
    GitHubStars: Number,
    GitHubForks: Number,
    GitHubWatchers: Number,
    abandoned: Boolean,
    codeCoveragePercent: Number,
    Linters: Number,
    dependents: Number,
    NPMStars: Number,
    maintainers: Number,
    contributors: Number,
    securityAdvisories: Number,
    totalIssues: Number,
    openIssues: Number
} );

module.exports = mongoose.model( 'Package', packageSchema );
