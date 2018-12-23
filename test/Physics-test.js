var THREE = require('three');
// var MY3 = require('../js/MY3.js');
var Physics = require('../js/Physics.js');
var expect = require('chai').expect;

describe('Physics.aequalsb', function(){

  var a;
  var b;

  it('throws when a or b are undefined', function() {
    var a;
    var b;
    expect(function() { Physics.aequalsb(a,b) } ).to().throw()
  });
});