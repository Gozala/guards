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

var isArray, isFunction, isUndefined, isNumber, isString, utils;
utils = require("./type");
isArray = utils.isArray;
isFunction = utils.isFunction;
isUndefined = utils.isUndefined;
isNumber = utils.isNumber;
isString = utils.isString;

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
 *      var gUser = guard.String("Anonymous");
 *
 *      var user1 = gUser("Jack");
 *      // -> "Jack"
 *
 *      var user2 = gUser();
 *      // -> "Anonymous"
 *
 *      var user3 = gUser(7);
 *      // -> throws String expected instead of number `7`.
 *
 *      var gHi = guard.String("Hi", "string expected not a {{type}}");
 *
 *      var msg = gHi(function() {});
 *      // -> throws string expected not a function.
 */
exports.String = function String(defaultValue, message) {
  // If optional error `message` template is not provided falling back to the
  // built-in one.
  message = message || "String expected instead of {{type}} `{{value}}`";
  // Generating a guard function.
  return function GString(value, key) {
    // If `value` is `undefined` (which may mean that it was not provided)
    // falling back to the `defaultValue`.
    if (isUndefined(value))
      value = defaultValue;
    // If `value` is defined and it's not a string `TypeError` is thrown with
    // a desired message.
    else if (!isString(value))
      throw new TypeError(message.replace("{{key}}", key)
                                 .replace("{{value}}", value)
                                 .replace("{{type}}", typeof value));

    // If error was not thrown the `value` passed a guard successfully and it
    // can be returned.
    return value;
  }
};

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
 *      var gLength = guard.Number(0);
 *
 *      var length1 = gLength();
 *      // -> 0
 *      var length2 = gLength(17);
 *      // -> 17
 *      var length3 = gLength("7");
 *      // -> throws Number expected instead of string `7`.
 *
 *      var gCount = guard.Number(0, "number expected not a {{type}}");
 *
 *      var count = gCount({ value: 4 });
 *      // -> throws number expected not a object.
 */
exports.Number = function Number(defaultValue, message) {
  // If optional error `message` template is not provided falling back to the
  // built-in one.
  message = message || "Number expected instead of {{type}} `{{value}}`";
  // Generating a guard function.
  return function GNumber(value, key) {
    // If `value` is `undefined` (which may mean that it was not provided)
    // falling back to the `defaultValue`.
    if (isUndefined(value))
      value = defaultValue;
    // If `value` is defined and it's not a number `TypeError` is thrown with
    // a desired message.
    else if (!isNumber(value))
     throw new TypeError(message.replace("{{key}}", key)
                                 .replace("{{value}}", value)
                                 .replace("{{type}}", typeof value));

    // If error was not thrown the `value` passed a guard successfully and it
    // can be returned.
    return value;
  }
};

exports.Schema = function Schema(fields) {
  return isFunction(fields) ? fields : function GSchema(attributes, name) {
    var data;

    Object.keys(fields).forEach(function(key) {
      (data || (data = {}))[key] = fields[key].call(this, attributes[key], key);
    }, this);

    return data;
  };
};

function FixedArray(descriptor) {
  return function GFixedArray(value, key) {
    return descriptor.map(function(guard, index) {
      return guard.call(this, value[index]);
    }, this);
  };
};

function ArraySchema(descriptor) {
  return function GArraySchema(value, key) {
    return value.map(function(value) {
      return descriptor.call(this, value);
    }, this);
  };
};

exports.Array = function Array(descriptor) {
  return isArray(descriptor) ? FixedArray(descriptor) : ArraySchema(descriptor);
};
