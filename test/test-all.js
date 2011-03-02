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

exports["test number guard"] = function(assert) {
  var g1 = guards.Number(0);
  assert.equal(g1(), 0, "correct default value is assigned");
  assert.equal(g1(17), 17, "string guard accepts string values");
  assert.throws(function() {
    g1("12");
  }, /Number/g, "non-number throws a TypeError");

  var g2 = guards.Number();
  assert.strictEqual(g2(), undefined, "`undefined` is fallback for default");

  var g3 = guards.Number(0, "number expected not a {{type}}");
  assert.throws(function() {
    g3("boom!");
  }, /number expected not a string/g, "Optional error temaplate can be used");
};

exports["test schema guard"] = function(assert) {
  var Point = guards.Schema({
    x: guards.Number(0),
    y: guards.Number(0)
  });

  assert.deepEqual(Point(), { x: 0, y: 0 }, "default values are insterted");
  assert.deepEqual(Point({ x: 17, z: 50 }), { x: 17, y: 0 },
                   "non-guarded values are stripped out");
  assert.throws(function() {
    Point({ x: "5" });
  }, /Number/g, "Wrong type in caught by nested guard");

  assert.throws(function() {
    Point("{ y: 6 }");
  }, /Object/g, "Scheme guard throws on non-object values");


  var Segment = guards.Schema({
    start: Point,
    end: Point,
    opacity: guards.Number(1)
  });

  assert.deepEqual(Segment(),
                  { start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, opacity: 1 },
                  "default values are used by all nested guards");

  assert.deepEqual(Segment({ end: { x: 17, foo: 'bar' }, opacity: 0.5 }),
                  { start: { x: 0, y: 0 }, end: { x: 17, y: 0 }, opacity: 0.5 },
                  "fallback to default values and strip out non-guarded ones");

  assert.throws(function() {
    Segment({ start: 17 })
  }, /Object/g, "nested guard throw on wrong value types");
};

require("test").run(exports)
