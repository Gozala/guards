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

exports["test array guard"] = function(assert) {
  var Words = guards.Array(guards.String(""));

  assert.deepEqual(Words([]), [], "Empty array passes through");
  assert.deepEqual(Words([ "foo", "bar" ]), [ "foo", "bar" ],
                   "primitive type array works fine");

  assert.throws(function() {
    Words([ "foo", 9 ]);
  }, /String/g, "throw because it got number instead of string");

  var Point = guards.Schema({
    x: guards.Number(0),
    y: guards.Number(0)
  });
  var Points = guards.Array(Point);

  assert.deepEqual(Points([{ foo: 'bar' }, { x: 2, y: 8 }]),
                   [ { x: 0, y: 0 }, { x: 2, y: 8 } ],
                   "Defualts used were needed and non-guradede stripped off");

  assert.throws(function() {
    Points({ x: 2, y: 8 })
  }, /Array/g, "TypeError is thrown if value is not an array");


  var Graph = guards.Array(Points);

  assert.deepEqual(Graph([]), [], "empty array passes through");
  assert.deepEqual(Graph([
                          [{ x: 17, foo: "bar" }, { x: 16 }],
                          [{ y: 4 }],
                          []
                   ]),
                   [
                     [ { x: 17, y: 0 }, { x: 16, y: 0 } ],
                     [ { x: 0, y: 4 } ],
                     []
                   ],
                   "arrray of arrays of points works fine");
};

exports["test tuple guards"] = function(assert) {
  var guards = require("guards");
  var Point = guards.Schema({
    x: guards.Number(0),
    y: guards.Number(0)
  });
  var Segment = guards.Schema({
    start: Point,
    end: Point,
    opacity: guards.Number(1)
  });
  var Triangle = guards.Tuple([ Segment, Segment, Segment ]);

  assert.deepEqual(Triangle(),
                  [
                    { start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, opacity: 1 },
                    { start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, opacity: 1 },
                    { start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, opacity: 1 }
                  ],
                  "if no argument passed then defaults are picked up");

  assert.deepEqual(Triangle([
                    { opacity: 0, foo: "bar" },
                    { start: { x: 2 } }
                  ]),
                  [
                    { start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, opacity: 0 },
                    { start: { x: 2, y: 0 }, end: { x: 0, y: 0 }, opacity: 1 },
                    { start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, opacity: 1 }
                  ],
                  "defualts picked up non-guarded stripped");

    assert.throws(function() {
      Triangle("foo");
    }, /Array/g, "Tuple guard accepts only array");

    assert.throws(function() {
      Triangle([{ start: { x: "3" } } ]);
    }, /Number/g, "Nested guard throws if wrong `value` is passed");


    var Pointer = guards.Tuple([ Point, Segment ]);

    assert.deepEqual(Pointer(),
                    [
                      { x: 0, y: 0 },
                      { start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, opacity: 1 }
                    ],
                    "Falls back to the default values");

    assert.deepEqual(Pointer([{ x: 17 }, { opacity: 0 }]),
                    [
                      { x: 17, y: 0 },
                      { start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, opacity: 0 }
                    ],
                    "Defaults picked up, non-guarded stripped out");


    assert.deepEqual(Pointer([{ foo: "bar" }, { baz: "bla" }, "foo"]),
                    [
                      { x: 0, y: 0 },
                      { start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, opacity: 1 }
                    ],
                    "Non-guarded elements and values ar stripped out");
};

exports["test custom guards"] = function(assert) {
  var Point = guards.Schema({
    x: guards.Number(0),
    y: guards.Number(0)
  });
  function color(value) {
    if (typeof value === "number" && value <= 255 && value >= 0)
      return value
    throw new TypeError("Color is a number between 0 and 255");
  }
  var RGB = guards.Tuple([ color, color, color ]);
  var Segment = guards.Schema({
    start: Point,
    end: Point,
    color: RGB,
  });

  assert.deepEqual(Segment({ end: { y: 23 }, color: [17, 255, 0] }),
                  { start: { x: 0, y: 0 },
                    end: { x: 0, y: 23 },
                    color: [ 17, 255, 0 ]
                  },
                  "defaults values used for missing properties");
  assert.deepEqual(Segment({ color: [ 1, 2, 3, 0.5 ] }).color,
                  [ 1, 2, 3 ],
                  "non guarded tuple elements are stripped out");

  assert.throws(function() {
    Segment({ colors: [] });
  }, /Color is a number between 0 and 255/, "no defualt for colors");
  assert.throws(function() {
    Segment({ colors: [ 0, 255, 256 ] });
  }, /Color is a/, "color out of the range");
};

exports["test AnyOf guards"] = function(assert) {
  var guards = require("guards");
  var ObjectPoint = guards.Schema({
    x: guards.Number(0),
    y: guards.Number(0)
  });
  var ArrayPoint = guards.Tuple([
    guards.Number(0),
    guards.Number(0)
  ]);
  var Point = guards.AnyOf(ObjectPoint, ArrayPoint);

  assert.deepEqual(Point([ 1 ]), [ 1, 0 ], "ArrayPoint validates");
  assert.deepEqual(Point({ y: 15 }), { x: 0, y: 15 }, "ObjectPoint validates");
  assert.throws(function() {
    Point(1, 2)
  }, /invalid/, "Number does not validates");
};

exports["test function guards"] = function(assert) {
  var guards = require("guards");
  var Callee = guards.Function("Anonymous");
  var f1 = function () { return "hello world" }

  assert.equal(Callee(Object), Object, "Object validates");
  assert.equal(Callee(f1), f1, "function validates");
  assert.throws(function() {
    Callee(7);
  }, /Function expected/, "Number does not validates as Function");
  assert.throws(function() {
    var Callee2 = guards.Function("Hi", "{{type}} is not a function.");
    Callee2({});
  }, /object is not a function/, "custom error message is thrown");
};

require("test").run(exports)
