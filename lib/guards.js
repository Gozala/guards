/* vim:ts=2:sts=2:sw=2:
 * ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Jetpack.
 *
 * The Initial Developer of the Original Code is
 * the Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Irakli Gozalishvili <gozala@mozilla.com> (Original Author)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";

var utils = require("./type");
var isArray = utils.isArray;
var isFunction = utils.isFunction;
var isUndefined = utils.isUndefined;
var isNull = utils.isNull;
var isNumber = utils.isNumber;
var isString = utils.isString;
var isObject = utils.isObject;
var isBoolean = utils.isBoolean;
var owns = Function.prototype.call.bind(Object.prototype.hasOwnProperty);

var DEFAULT = 'defaults';

/**
 * # Guard #
 *
 * Function takes `isValid` function and `message` as an argument and returns
 * guard generator function. Returned function may be used to generate value
 * guards that are validated with given `isValid` function. Please see
 * `exports.Number` or `exports.String` for more details.
 * @param {Function} isValid
 *    Function that will be used by guard to validate values. It will be called
 *    with `value` argument that needs to be validated. If function returns
 *    `true` value is valid if `false` it's not.
 * @param {String} [message="Unexpected value: `{{value}}`"]
 *    Optional `message` argument may be passed that will be used as a template
 *    for a `TypeError` message that is thrown by generated guards when called
 *    with invalid values.
 */
function Guard(isValid, message) {
  // If optional error `message` template is not provided falling back to the
  // built-in one.
  message = message || "Unexpected value: `{{value}}`";
  /**
   * Creates a guard function, that may be used to perform run time type checks
   * on a given values. Function takes an `options` object as an argument
   * through which fall back default value or a custom error message may be
   * provided to a generated guard. If `options` contains `defaults` property
   * it will be returned by generated guard function if it's called with no
   * value or `undefined`. If options has a `message` property it is going to be
   * used as a template for a messages of `TypeError`s that will be thrown by a
   * generated guard when invoked with invalid `value`s.
   * @param {Object} [options]
   * @param {Object|String|Number|function} [options.defaults]
   *    Value returned by a guard when invoked without any or `undefined`
   *    `value`. If not provided guard will always validate value and will throw
   *    `TypeError` if `undefined` does not validates.
   * @param {String} [options.message]
   *    Optional error message template of a `TypeError` that is thrown by guard
   *    when `value` does not validates. If `message` contains `"{{value}}"`
   *    and `"{{type}}"` strings they are substituted with a given `value` and
   *    it's type.
   */
  return function Guard(options) {
    options = options || {};
    var template = 'message' in options ? options.message : message;
    var hasDefault = owns(options, DEFAULT);
    var defaultValue = hasDefault ? options[DEFAULT] : undefined;
    /**
     * Guard function that may be called with a `value` to be set to a guarded
     * variable. If `value` is invalid `TypeError` is thrown. Optionally second
     * `name` argument may be passed, which is useful when guards are used for
     * object properties. In such case `name` argument just name of object
     * property and will be used to give a better error messages.
     * @param {Object|String|Number|function} value
     *    Value to be validated.
     * @param {String} name
     *    Name of the property that is being guarded.
     */
    return function guard(value, name) {
      // If guard has a default value and guard is called with `undefined`
      // `value` just falling back to the `defaultValue`.
      if (hasDefault && isUndefined(value))
        value = defaultValue;
      // Otherwise validating `value` and throwing a `TypeError` if it does not
      // validates.
      else if (!isValid(value))
        throw new TypeError(template.replace("{{name}}", name)
                                    .replace("{{value}}", value)
                                    .replace("{{type}}", typeof value));

      // Finally if we got this far, we have either or default `value` so we
      // return it back.
      return value;
    }
  }
}
exports.Guard = Guard;

/*
 * # Function #
 *
 * Function creates a function guard - function that may be used to perform run
 * time type checks on the values. Function takes an optional `defaultValue`
 * that will be returned by a created guard if it's invoked without (or with
 * `undefined`) `value` argument. The `defaultValue` will fall back to
 * `undefined` if not provided. Function also takes another optional argument
 * `message` that represents a template of a message of the `TypeError` that
 * will be thrown by guard if it's invoked with invalid `value`.
 *
 * @param {Object|String|Number|function} [defaultValue]
 *    Value that returned guard is going to fall back to if invoked without
 *    a `value` or if it's `undefined`.
 * @param {String} [message]
 *    Optional error message template that will be a message of a `TypeError`
 *    that is will be thrown if returned guard is invoked with a wrong `value`
 *    type. If `message` contains `"{{value}}"` and `"{{type}}"` strings they
 *    are going to be replaced with an actual `value` and it's type.
 *
 * ## Examples ##
 *
 *
 *      var guards = require("guards");
 *
 *      var Callee = guards.Function("Anonymous");
 *
 *      Callee(Object) == Object
 *      // true
 *
 *      Callee(function() { return "hello world" })
 *      Callee(function() { return "hello world" })
 *
 *      Callee(7);
 *      // TypeError: Function expected instead of number `7`
 *
 *      guards.Function("Hi", "{{type}} is not a function.");
 *
 *      Callee({})
 *      // TypeError: object is not a function
 */
exports.Function = Guard(isFunction, "Function expected instead of {{type}} `{{value}}`");

/**
 * # String #
 *
 * Function creates a string guard - function that may be used to perform run
 * time type checks on the values. Function takes an optional `defaultValue`
 * that will be returned by a created guard if it's invoked without (or with
 * `undefined`) `value` argument. The `defaultValue` will fallback to
 * `undefined` if not provided. Function also takes another optional argument
 * `message` that represents a template of a message of the `TypeError` that
 * will be thrown by guard if it's invoked with incorrect value.
 *
 * @param {Object|String|Number|function} [defaultValue]
 *    Value that returned guard is going to fall back to if invoked without
 *    a `value` or if it's `undefined`.
 * @param {String} [message]
 *    Optional error message template that will be a message of a `TypeError`
 *    that is will be thrown if returned guard is invoked with a wrong `value`
 *    type. If `message` contains `"{{value}}"` and `"{{type}}"` strings they
 *    are going to be replaced with an actual `value` and it's type.
 *
 * ## Examples ##
 *
 *
 *      var guards = require("guards");
 *
 *      var gUser = guards.String("Anonymous");
 *
 *      var user1 = gUser("Jack");
 *      // "Jack"
 *
 *      var user2 = gUser();
 *      // "Anonymous"
 *
 *      var user3 = gUser(7);
 *      // TypeError: String expected instead of number `7`
 *
 *      var gHi = guards.String("Hi", "string expected not a {{type}}");
 *
 *      var msg = gHi(function() {});
 *      // TypeError: string expected not a function
 */
exports.String = Guard(isString, "String expected instead of {{type}} `{{value}}`");

/**
 * # Number #
 *
 * Function creates a number guard - function that may be used to perform run
 * time type checks on the values. Function takes an optional `defaultValue`
 * that will be returned by a created guard if it's invoked without (or with
 * `undefined`) `value` argument. The `defaultValue` will fallback to
 * `undefined` if not provided. Function also takes another optional argument
 * `message` that represents a template of a message of the `TypeError` that
 * will be thrown by guard if it's invoked with incorrect value.
 *
 * @param {Object|String|Number|function} [defaultValue]
 *    Value that returned guard is going to fall back to if invoked without
 *    a `value` or if it's `undefined`.
 * @param {String} [message]
 *    Optional error message template that will be a message of a `TypeError`
 *    that is will be thrown if returned guard is invoked with a wrong `value`
 *    type. If `message` contains `"{{value}}"` and `"{{type}}"` strings they
 *    are going to be replaced with an actual `value` and it's type.
 *
 * ## examples ##
 *
 *      var guards = require("guards");
 *      var gLength = guards.Number(0);
 *
 *      var length1 = gLength();
 *      // 0
 *
 *      var length2 = gLength(17);
 *      // 17
 *
 *      var length3 = gLength("7");
 *      // TypeError: Number expected instead of string `7`
 *
 *      var gCount = guards.Number(0, "number expected not a {{type}}");
 *
 *      var count = gCount({ value: 4 });
 *      // TypeError: number expected not a object
 */
exports.Number = Guard(isNumber, "Number expected instead of {{type}} `{{value}}`");
exports.Boolean = Guard(isBoolean, "Boolean expected instead of {{type}} `{{value}}`");
exports.Null = Guard(isNull, "Boolean expected instead of {{type}} `{{value}}`");

/**
 * # Schema #
 *
 * Schema is useful for defining guards for data objects that have particular
 * structure. Function takes `descriptor` argument that is a map of guards
 * guarding same named properties of the value being validated. Scheme may
 * contain guards for a primitive values like `String` and `Number` and also
 * guards for more complex data structures defined by other `Schema`s, or to
 * put it other way `Schema` may contain guards that were created by `Schema`
 * itself which allows defining deeply nested data structures.
 *
 * Generated guard will accept only object `values` as an argument. All the
 * non-guarded properties (that are not present in the `descriptor`) of the
 * `value` will be stripped out. All the missing properties of the `value`
 * will be replaced / assembled from the defaults if associated guards provide
 * fallback mechanism to default value.
 *
 * @param {Object} descriptor
 *    Object containing guards for the associated (same named properties) of
 *    the guarded object `value`.
 * @param {String} [message]
 *    Optional error message template that will be a message of a `TypeError`
 *    that is will be thrown if returned guard is invoked with a wrong `value`
 *    type (other then "object" or "undefined"). If `message` contains
 *    `"{{value}}"` and `"{{type}}"` strings they are going to be replaced with
 *    an actual `value` and it's type.
 *
 * ## Examples ##
 *
 *      var guards = require("guards");
 *      var Point = guards.Schema({
 *        x: guards.Number(0),
 *        y: guards.Number(0)
 *      });
 *
 *      var p1 = Point();
 *      // { x: 0, y: 0 }
 *
 *      var p2 = Point({ x: 17, z: 50 });
 *      // { x: 17, y: 0 }
 *
 *      var p3 = Point({ x: "5" });
 *      // TypeError: Number expected instead of string `5`
 *
 *      var p4 = Point("{ y: 6 }");
 *      // TypeError: Object expected instead of string `{ y: 6 }`
 *
 *
 *      var Segment = guards.Schema({
 *        start: Point,
 *        end: Point,
 *        opacity: guards.Number(1)
 *      });
 *
 *      var s1 = Segment();
 *      // { start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, opacity: 1 }
 *
 *      var s2 = Segment({ end: { x: 17 }, opacity: 0.5 });
 *      // { start: { x: 0, y: 0 }, end: { x: 17, y: 0 }, opacity: 0.5 }
 *
 *      var s3 = Segment({ start: 17 });
 *      // TypeError: Object expected instead of number `17`
 *
 */
var Schema = exports.Schema = function Schema(descriptor, message) {
  // If optional error `message` template is not provided falling back to the
  // built-in one.
  message = message || "Object expected instead of {{type}} `{{value}}`";

  // If `descriptor` is a function then we assume it's a guard so we return it
  // immediately, otherwise we generate a guard function from it.
  return function GSchema(value, key) {
    var data;
    // If `value` is `undefined` (which may mean that it was not provided)
    // falling back to the `{}`.
    if (isUndefined(value))
      value = {};
    // Since schema defines object structure guard accepts only object `value`s
    // if given `value` is not an object we throw `TypeError` with a desired
    // message.
    if (!isObject(value) || isArray(value))
      throw new TypeError(message.replace("{{key}}", key)
                                 .replace("{{value}}", value)
                                 .replace("{{type}}", typeof value));

    // At this point we have an object `value` containing properties that must
    // be verified by guards of the `descriptor` to make sure that `value` has
    // correct schema. We loop over `descriptor`s guards and invoke them with
    // an associated `key` and `value`. Results are mapped to the `data` object
    // that represents verified and normalized value. If any of the property
    // guards will throw an exception it will propagate to a caller of this
    // guard notifying it that given `value` does not has desired schema.
    data = {};
    Object.keys(descriptor).forEach(function(key) {
      var guard = descriptor[key];
      data[key] = guard(value[key], key);
    }, this);

    // If error was not thrown the `value` has a schema described by
    // a `descriptor`. In such case we return map of the values properties
    // (We can't return `value` itself as it may not contain default values
    // for certain properties or may contain extra properties that have to
    // be dropped).
    return data;
  };
};

/**
 * # Array #
 *
 * Array can be used to define guards for an arrays containing elements of some
 * type or schema. Function takes `guard` as an argument that will guard all the
 * elements of the `value` array that is passed to the returned guard.
 *
 * @param {Function} guard
 *    Guard that is going to be used to verify elements of the array. It can
 *    be any guard created by `String`, `Schema`, `Array` or any custom guard
 *    as well.
 * @param {String} [message]
 *    Optional error message template that will be a message of a `TypeError`
 *    that is will be thrown if returned guard is invoked with a wrong `value`
 *    type (other then "array" or "undefined"). If `message` contains
 *    `"{{value}}"` and `"{{type}}"` strings they are going to be replaced with
 *    an actual `value` and it's type.
 *
 * ## Examples ##
 *
 *      var guards = require("guards");
 *      var Words = guards.Array(guards.String(""));
 *
 *      var ww1 = Words([ "foo", "bar" ]);
 *      // [ 'foo', 'bar' ]
 *
 *      var ww2 = Words([ "foo", 9 ]);
 *      // TypeError: String expected instead of number `9`
 *
 *      var Point = guards.Schema({
 *        x: guards.Number(0),
 *        y: guards.Number(0)
 *      });
 *      var Points = guards.Array(Point);
 *
 *      var pp1 = Points([{}, { x: 2, y: 8 }]);
 *      // [ { x: 0, y: 0 }, { x: 2, y: 8 } ]
 *
 *      var pp2 = Points({ x: 2, y: 8 });
 *      // TypeError: Array expected instead of object `[object Object]`
 *
 *
 *      var Graph = guards.Array(Points);
 *
 *      var g1 = Graph([]);
 *      // []
 *
 *      var g2 = Graph([
 *        [{ x: 17, foo: "bar" }, { x: 16 }],
 *        [{ y: 4 }],
 *        []
 *      ]);
 *      // [ [ { x: 17, y: 0 }, { x: 16, y: 0 } ], [ { x: 0, y: 4 } ], [] ]
 */
exports.Array = function Array(guard, message) {
  // If optional error `message` template is not provided falling back to the
  // built-in one.
  message = message || "Array expected instead of {{type}} `{{value}}`";

  return function GArray(value, key) {
    // If `value` is `undefined` (which may mean that it was not provided)
    // falling back to the `[]`.
    if (isUndefined(value))
      value = [];
    // Since guard validates elements of the array given `value` must be an
    // array we throw `TypeError` if this is not the case.
    if (!isArray(value))
      throw new TypeError(message.replace("{{key}}", key)
                                 .replace("{{value}}", value)
                                 .replace("{{type}}", typeof value));

    // At this point we have an array `value` containing properties that must
    // be verified by a desired `guard`. As result we return mapped array
    // containing guarded values of the given array. Please note that we need
    // to map original array as some values of it may be normalized (default
    // values added for missing properties) by guards. If any of the element
    // does not passes validation guard will throw `TypeError` and it will
    // propagate to a caller of this guard notifying it that `value` does not
    // validates.
    return value.map(function(value, index) {
      return guard(value, index);
    }, this);
  };
};

/**
 * # Tuple #
 *
 * Tuple can be used to define guards for an arrays containing predefined
 * amount of elements guarded by specific guards. Tuple guards are something
 * in between Array and Schema guards. Function takes array of guards as an
 * argument that will be used to validate same indexed elements of the `value`
 * array that is passed to the returned guard.
 *
 * @param {Function[]} guards
 *    Guards that are going to be used to verify elements of the array. It can
 *    be any guard created by `String`, `Schema`, `Array` or any custom guard
 *    as well.
 * @param {String} [message]
 *    Optional error message template that will be a message of a `TypeError`
 *    that is will be thrown if returned guard is invoked with a wrong `value`
 *    type (other then "array" or "undefined"). If `message` contains
 *    `"{{value}}"` and `"{{type}}"` strings they are going to be replaced with
 *    an actual `value` and it's type.
 *
 * ## Examples ##
 *
 *      var guards = require("guards");
 *      var Point = guards.Schema({
 *        x: guards.Number(0),
 *        y: guards.Number(0)
 *      });
 *      var Segment = guards.Schema({
 *        start: Point,
 *        end: Point,
 *        opacity: guards.Number(1)
 *      });
 *      var Triangle = guards.Tuple([ Segment, Segment, Segment ]);
 *
 *      var t1 = Triangle();
 *      // [ { start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, opacity: 1 },
 *      //   { start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, opacity: 1 },
 *      //   { start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, opacity: 1 }
 *      // ]
 *
 *      var t2 = Triangle([
 *        { opacity: 0, foo: "bar" },
 *        { start: { x: 2 } }
 *      ]);
 *      // [ { start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, opacity: 0 },
 *      //   { start: { x: 2, y: 0 }, end: { x: 0, y: 0 }, opacity: 1 },
 *      //   { start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, opacity: 1 }
 *      // ]
 *
 *      var t2 = Triangle("foo");
 *      // TypeError: Array expected instead of string `foo`
 *
 *      var t3 = Triangle([{ start: { x: '3' } } ]);
 *      // TypeError: Number expected instead of string `3`
 *
 *      var Pointer = guards.Tuple([ Point, Segment ]);
 *
 *      var p1 = Pointer();
 *      // [ { x: 0, y: 0 }, { start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, opacity: 1 } ]
 *
 *      var p2 = Pointer([ { x: 17 }, { opacity: 0 } ]);
 *      // [ { x: 17, y: 0 }, { start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, opacity: 0 } ]
 *
 *      var p3 = Pointer([ { foo: "bar" }, { baz: "bla" }, "foo" ]);
 *      // [ { x: 0, y: 0 }, { start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, opacity: 1 } ]
 */
exports.Tuple = function Tuple(guards, message) {
  // If optional error `message` template is not provided falling back to the
  // built-in one.
  message = message || "Array expected instead of {{type}} `{{value}}`";

  return function GTuple(value, key) {
    // If `value` is `undefined` (which may mean that it was not provided)
    // falling back to the `[]`.
    if (isUndefined(value))
      value = [];
    // Since guard validates elements of the array given `value` must be an
    // array we throw `TypeError` if this is not the case.
    if (!isArray(value))
      throw new TypeError(message.replace("{{key}}", key)
                                 .replace("{{value}}", value)
                                 .replace("{{type}}", typeof value));

    // At this point we have an array `value` containing properties that must
    // be verified by a guards in the `descriptor`. As result we return mapped
    // array containing guarded values of the given array. Please note that we
    // need to map original array as some values of it may be normalized
    // (default values added for missing properties) by guards also we map only
    // elements that are guarded by `descriptor` any additional ones will be
    // stripped off. If any element won't pass validation, responsible guard
    // will throw `TypeError` and it will propagate to a caller of this guard
    // notifying it that `value` does not validates.
    return guards.map(function(guard, index) {
      return guard(value[index], index);
    }, this);
  };
};

/**
 * # AnyOf #
 *
 * `AnyOf` can be used to define guards that validates `value`s that must
 * satisfy just one of many guards. This is handy in specific specific
 * scenarios were valid `value` may have different types or schemas.
 * Function takes any number guards as an arguments and returns composed
 * guard, which when called will try to validate a given `value` with a given
 * guards in an order they were passed, the first validate `value` is returned
 * as result, unless non will validate in which case `TypeError` is thrown.
 *
 * @params {Function} guard
 *    Guards used for validations.
 * @returns {Function}
 *
 * ## Examples ##
 *
 *      var guards = require("guards");
 *      var ObjectPoint = guards.Schema({
 *        x: guards.Number(0),
 *        y: guards.Number(0)
 *      });
 *      var ArrayPoint = guards.Tuple([
 *        guards.Number(0),
 *        guards.Number(0)
 *      ]);
 *      var Point = guards.AnyOf(ObjectPoint, ArrayPoint);
 *
 *      Point([ 1 ])
 *      // [ 1, 0 ]
 *
 *      Point({ y: 15 })
 *      // { x: 0, y: 15 }
 *
 *      Point(1, 2)
 *      // TypeError: Passed value: `1` has invalid type or structure
 */
exports.AnyOf = function AnyOf() {
  // Template of error `message` that will be thrown if incorrect `value` is
  // passed to it.
  var message = "Passed value: `{{value}}` has invalid type or structure";
  // Saving array of the value guards.
  var guards = Array.prototype.slice.call(arguments);
  return function GAnyOf(value, key) {
    // We try to return `value` that passes at least on validation, by trying
    // to validate it with each guard.
    for (var i = 0, ii = guards.length; i < ii; i++)
      try { return guards[i](value, key); } catch(e) {}
    // If got this far then non of the validations succeeded as value was not
    // returned, so we throw a `TypeError` that will propagate to a caller of
    // this guard notifying it that `value` does not validates.
    throw new TypeError(message.replace("{{value}}", value));
  }
};
