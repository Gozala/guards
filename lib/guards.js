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

exports.String = function String(defaultValue, message) {
  message = message || "Incorrect value `{{value}}` was assigned to the" +
            "`{{key}}` property which had to be a String";
  return function GString(value, key) {
    if (isUndefined(value))
      value = defaultValue;
    else if (!isString(value))
      throw new TypeError(message.replace('{{key}}', key)
                                 .replace('{{value}}', value));

    return value;
  }
};

exports.Number = function Number(defaultValue, message) {
  message = message || "Incorrect value `{{value}}` was assigned to the" +
            "`{{key}}` property which had to be a Number";
  return function GNumber(value, key) {
    if (isUndefined(value))
      value = defaultValue;
    else if (!isNumber(value))
      throw new TypeError(message.replace('{{key}}', key)
                                 .replace('{{value}}', value));
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
