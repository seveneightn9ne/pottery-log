#!/usr/bin/env node
// JSON-decode all the strings in an object

let getStdin = require('get-stdin');

getStdin().then((text) => {
  try {
    let obj1 = JSON.parse(text);
    let obj2 = {};
    for (let k in obj1) {
      obj2[k] = JSON.parse(obj1[k]);
    }
    console.log(JSON.stringify(obj2));
  } catch (e) {
    console.error(e);
  }
})
