var rest = require('../modules/rest.js');
var async = require('async');
var resultPrediction = null;

const host = 'traffic-crazy-train.apps.rhods-internal.61tk.p1.openshiftapps.com';
const path = '/v2/models/traffic/infer';
const inputs = require("../payloads/exemple-payload.json");

(async function() { 
  resultPrediction = await rest.predictImage(host, path, inputs);
  console.log("result prediction ", resultPrediction);
});