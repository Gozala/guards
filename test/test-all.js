"use strict";

var guards = require("guards");

exports["test string guard"] = function(assert) {
  var g1 = guards.String("default");
  assert.equal(g1(), "default", "correct default value is assigned");
  assert.equal(g1("foo"), "foo", "string guard accepts string values");
  assert.throws(function() {
    g1(12);
  }, /String/g, "non-string passed to a string gaurd throws a TypeError");
  assert.throws(function() {
    g1(new String("foo bar"));
  }, /String/g, "String instance throws exception as well");

  var g2 = guards.String();
  assert.strictEqual(g2(), undefined, "`undefined` is fallback for default");

  var g3 = guards.String("", "Boom -> {{value}}!");
  assert.throws(function() {
    var value = g3({});
  }, /Boom \-\> \[object Object\]!/g, "Optional error temaplate can be used");
};


require("test").run(exports)
