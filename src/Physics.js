'use strict';

// FIXME don't move the shot out by the shortest path (worst case: sideways), retrace the direction. This will break the 'movement as normal' idea

var Physics = {};

//=============================================================================
// setup for server-side testing
//=============================================================================
if (typeof require === 'function') // test for nodejs environment
{
  var THREE = require('three');
}

Physics.aequalsb = function(a,b)
{
  if(a === undefined | b === undefined){
    throw('a and b are both required');
  }
  if(a == b){
    return true;
  }else{
    return false;
  }
}

//=============================================================================
// make available in nodejs
//=============================================================================
if (exports)
{
  module.exports = Physics;
}