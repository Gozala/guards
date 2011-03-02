"use strict";

var guards = require("guards");

exports["test string guard"] = function(assert) {
  var g = guards.String("default");
  assert.equal(g(), "default", "correct default value is assigned");
  assert.equal(g("foo"), "foo", "string guard accepts string values");
  assert.throws(function() {
    var value = g(12);
  }, /String/g, "non-string passed to a string gaurd throws a TypeError");
  assert.throws(function() {
    var value = g(new String("foo bar"));
  }, /String/g, "String instance throws exception as well");
};


require("test").run(exports)
