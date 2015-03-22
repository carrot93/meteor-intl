// Rewrite of handlebars-intl for Meteor
// @see https://github.com/yahoo/handlebars-intl/blob/master/src/helpers.js
/*
 Copyright (c) 2014, Yahoo! Inc. All rights reserved.
 Copyrights licensed under the New BSD License.
 See the accompanying LICENSE file for terms.
 */
import IntlMessageFormat from 'intl-messageformat';
import IntlRelativeFormat from 'intl-relativeformat';
import createFormatCache from 'intl-format-cache';

import {extend} from './utils';

export {registerWith};

// Use the polyfill if needed
var Intl = (typeof Intl === 'undefined') ? IntlPolyfill: Intl;

// -----------------------------------------------------------------------------

var getNumberFormat   = createFormatCache(Intl.NumberFormat);
var getDateTimeFormat = createFormatCache(Intl.DateTimeFormat);
var getMessageFormat  = createFormatCache(IntlMessageFormat);
var getRelativeFormat = createFormatCache(IntlRelativeFormat);

Meteor.startup(function() {
  if (typeof Template !== 'undefined') {
    registerWith(Template);
  }
});

function registerWith(Template) {
  var helpers = {
    intlGet          : intlGet,
    formatDate       : formatDate,
    formatTime       : formatTime,
    formatRelative   : formatRelative,
    formatNumber     : formatNumber,
    formatMessage    : formatMessage,
    formatHTMLMessage: formatHTMLMessage
  };

  for (var name in helpers) {
    if (helpers.hasOwnProperty(name)) {
      Template.registerHelper(name, helpers[name]);
    }
  }

  function intlGet(path) {
    var intlData  = getIntlData(),
      pathParts = path.split('.');

    var obj, len, i;

    // Use the path to walk the Intl data to find the object at the given
    // path, and throw a descriptive error if it's not found.
    try {
      for (i = 0, len = pathParts.length; i < len; i++) {
        obj = intlData = intlData[pathParts[i]];
      }
    } finally {
      if (obj === undefined) {
        throw new ReferenceError('Could not find Intl object: ' + path);
      }
    }

    return obj;
  }

  function formatDate(date, format, options) {
    date = new Date(date);
    assertIsDate(date, 'A date or timestamp must be provided to {{formatDate}}');

    if (!options) {
      options = format;
      format  = null;
    }

    var intlData = getIntlData();
    var locales       = intlData.locales;
    var formatOptions = getFormatOptions('date', format, options);

    return getDateTimeFormat(locales, formatOptions).format(date);
  }

  function formatTime(date, format, options) {
    date = new Date(date);
    assertIsDate(date, 'A date or timestamp must be provided to {{formatTime}}');

    if (!options) {
      options = format;
      format  = null;
    }

    var intlData = getIntlData();
    var locales       = intlData.locales;
    var formatOptions = getFormatOptions('time', format, options);

    return getDateTimeFormat(locales, formatOptions).format(date);
  }

  function formatRelative(date, format, options) {
    date = new Date(date);
    assertIsDate(date, 'A date or timestamp must be provided to {{formatRelative}}');

    if (!options) {
      options = format;
      format  = null;
    }

    var intlData = getIntlData();
    var locales       = intlData.locales;
    var formatOptions = getFormatOptions('relative', format, options);
    var now           = options.hash.now;

    // Remove `now` from the options passed to the `IntlRelativeFormat`
    // constructor, because it's only used when calling `format()`.
    delete formatOptions.now;

    return getRelativeFormat(locales, formatOptions).format(date, {
      now: now
    });
  }

  function formatNumber(num, format, options) {
    assertIsNumber(num, 'A number must be provided to {{formatNumber}}');

    if (!options) {
      options = format;
      format  = null;
    }

    var intlData = getIntlData();
    var locales       = intlData.locales;
    var formatOptions = getFormatOptions('number', format, options);

    return getNumberFormat(locales, formatOptions).format(num);
  }

  function formatMessage(message, options) {
    if (!options) {
      options = message;
      message = null;
    }

    var hash = options.hash;

    // Note for Meteor: this is impossible to fix for Spacebars for now
    // TODO: remove support form `hash.intlName` once Handlebars bugs with
    // subexpressions are fixed.
    if (!(message || typeof message === 'string' || hash.intlName)) {
      throw new ReferenceError(
        '{{formatMessage}} must be provided a message or intlName'
      );
    }

    var intlData = getIntlData(),
      locales  = intlData.locales,
      formats  = intlData.formats;

    // Lookup message by path name. User must supply the full path to the
    // message on `options.data.intl`.
    if (!message && hash.intlName) {
      message = intlGet(hash.intlName, options);
    }

    // When `message` is a function, assume it's an IntlMessageFormat
    // instance's `format()` method passed by reference, and call it. This
    // is possible because its `this` will be pre-bound to the instance.
    if (typeof message === 'function') {
      return message(hash);
    }

    if (typeof message === 'string') {
      message = getMessageFormat(message, locales, formats);
    }

    return message.format(hash);
  }

  function formatHTMLMessage() {
    /* jshint validthis:true */
    var options = [].slice.call(arguments).pop(),
      hash    = options.hash;

    var key, value;

    // Replace string properties in `options.hash` with HTML-escaped
    // strings.
    for (key in hash) {
      if (hash.hasOwnProperty(key)) {
        value = hash[key];

        // Escape string value.
        if (typeof value === 'string') {
          hash[key] = escapeExpression(value);
        }
      }
    }

    // Return a Handlebars `SafeString`. This first unwraps the result to
    // make sure it's not returning a double-wrapped `SafeString`.
    return new SafeString(String(formatMessage.apply(this, arguments)));
  }

  // -- Utilities ------------------------------------------------------------

  function getIntlData() {
    var intlData = {};

    var data;
    var i = 0;

    do {
      data = Template.parentData(i++);

      if (data && data.intl) {
        intlData = extend(data.intl, intlData);
      }
    } while(data);

    return intlData;
  }

  function assertIsDate(date, errMsg) {
    // Determine if the `date` is valid by checking if it is finite, which
    // is the same way that `Intl.DateTimeFormat#format()` checks.
    if (!isFinite(date)) {
      throw new TypeError(errMsg);
    }
  }

  function assertIsNumber(num, errMsg) {
    if (typeof num !== 'number') {
      throw new TypeError(errMsg);
    }
  }

  function getFormatOptions(type, format, options) {
    var hash = options.hash;
    var formatOptions;

    if (format) {
      if (typeof format === 'string') {
        formatOptions = intlGet('formats.' + type + '.' + format);
      }

      formatOptions = extend({}, formatOptions, hash);
    } else {
      formatOptions = hash;
    }

    return formatOptions;
  }
}

// From Handlebars
// @see https://github.com/wycats/handlebars.js/blob/master/lib/handlebars/utils.js
/*jshint -W004 */
var escape = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "`": "&#x60;"
};

var badChars = /[&<>"'`]/g;
var possible = /[&<>"'`]/;

function escapeChar(chr) {
  return escape[chr];
}

function escapeExpression(string) {
  if (typeof string !== 'string') {
    // don't escape SafeStrings, since they're already safe
    if (string && string.toHTML) {
      return string.toHTML();
    } else if (string == null) {
      return '';
    } else if (!string) {
      return string + '';
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    string = '' + string;
  }

  if (!possible.test(string)) { return string; }
  return string.replace(badChars, escapeChar);
}

// From Handlebars
// @see https://github.com/wycats/handlebars.js/blob/master/lib/handlebars/safe-string.js
// Build out our basic SafeString type
function SafeString(string) {
  this.string = string;
}

SafeString.prototype.toString = SafeString.prototype.toHTML = function() {
  return "" + this.string;
};