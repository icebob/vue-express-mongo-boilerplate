webpackJsonp([0],[
/* 0 */,
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _axios = __webpack_require__(13);

var _axios2 = _interopRequireDefault(_axios);

var _socket = __webpack_require__(353);

var _socket2 = _interopRequireDefault(_socket);

var _graphqlTag = __webpack_require__(43);

var _graphqlTag2 = _interopRequireDefault(_graphqlTag);

var _apolloClient = __webpack_require__(41);

var _apolloClient2 = _interopRequireDefault(_apolloClient);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

window.gql = _graphqlTag2.default;
var networkInterface = (0, _apolloClient.createNetworkInterface)({
	uri: "/graphql",
	opts: {
		credentials: "same-origin"
	}
});

var apolloClient = new _apolloClient2.default({
	networkInterface: networkInterface
});

var Service = function () {
	function Service(namespace, vm, socketOpts) {
		_classCallCheck(this, Service);

		if (vm) this.socket = vm.$socket;else this.socket = (0, _socket2.default)(socketOpts);

		this.namespace = namespace;
		this.axios = _axios2.default.create({
			baseURL: "/api/" + namespace + "/",
			responseType: "json"
		});
	}

	_createClass(Service, [{
		key: "rest",
		value: function rest(action, params) {
			var _this = this;

			return new Promise(function (resolve, reject) {
				_this.axios.request(action, {
					method: "post",
					data: params
				}).then(function (response) {
					if (response.data && response.data.data) resolve(response.data.data);else reject(response);
				}).catch(function (error) {
					if (error.response && error.response.data && error.response.data.error) {
						console.error("REST request error!", error.response.data.error);
						reject(error.response.data.error);
					} else reject(error);
				});
			});
		}
	}, {
		key: "emit",
		value: function emit(action, params) {
			var _this2 = this;

			return new Promise(function (resolve, reject) {

				_this2.socket.emit("/" + _this2.namespace + "/" + action, params, function (response) {
					if (response && response.status == 200) resolve(response.data);else {
						console.error("Socket emit error!", response.error);
						reject(response.error);
					}
				});
			});
		}
	}, {
		key: "query",
		value: function query(_query, variables, fragments) {
			return apolloClient.query({
				query: _query,
				variables: variables,
				fragments: fragments,
				forceFetch: true
			}).then(function (result) {

				return result.data;
			}).catch(function (error) {

				var err = error;
				if (error.graphQLErrors && error.graphQLErrors.length > 0) err = error.graphQLErrors[0];

				throw err;
			});
		}
	}, {
		key: "watchQuery",
		value: function watchQuery(query, variables, fragments, pollInterval) {
			return apolloClient.watchQuery({
				query: query,
				variables: variables,
				fragments: fragments,
				pollInterval: pollInterval,
				forceFetch: true
			});
		}
	}, {
		key: "mutate",
		value: function mutate(mutation, variables, fragments) {
			return apolloClient.mutate({
				mutation: mutation,
				variables: variables,
				fragments: fragments
			}).then(function (result) {

				return result.data;
			}).catch(function (error) {

				var err = error;
				if (error.graphQLErrors && error.graphQLErrors.length > 0) err = error.graphQLErrors[0];

				throw err;
			});
		}
	}]);

	return Service;
}();

exports.default = Service;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/**
 * Module dependencies.
 */

var keys = __webpack_require__(285);
var hasBinary = __webpack_require__(64);
var sliceBuffer = __webpack_require__(215);
var after = __webpack_require__(203);
var utf8 = __webpack_require__(397);

var base64encoder;
if (global && global.ArrayBuffer) {
  base64encoder = __webpack_require__(271);
}

/**
 * Check if we are running an android browser. That requires us to use
 * ArrayBuffer with polling transports...
 *
 * http://ghinda.net/jpeg-blob-ajax-android/
 */

var isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

/**
 * Check if we are running in PhantomJS.
 * Uploading a Blob with PhantomJS does not work correctly, as reported here:
 * https://github.com/ariya/phantomjs/issues/11395
 * @type boolean
 */
var isPhantomJS = typeof navigator !== 'undefined' && /PhantomJS/i.test(navigator.userAgent);

/**
 * When true, avoids using Blobs to encode payloads.
 * @type boolean
 */
var dontSendBlobs = isAndroid || isPhantomJS;

/**
 * Current protocol version.
 */

exports.protocol = 3;

/**
 * Packet types.
 */

var packets = exports.packets = {
    open:     0    // non-ws
  , close:    1    // non-ws
  , ping:     2
  , pong:     3
  , message:  4
  , upgrade:  5
  , noop:     6
};

var packetslist = keys(packets);

/**
 * Premade error packet.
 */

var err = { type: 'error', data: 'parser error' };

/**
 * Create a blob api even for blob builder when vendor prefixes exist
 */

var Blob = __webpack_require__(272);

/**
 * Encodes a packet.
 *
 *     <packet type id> [ <data> ]
 *
 * Example:
 *
 *     5hello world
 *     3
 *     4
 *
 * Binary is encoded in an identical principle
 *
 * @api private
 */

exports.encodePacket = function (packet, supportsBinary, utf8encode, callback) {
  if ('function' == typeof supportsBinary) {
    callback = supportsBinary;
    supportsBinary = false;
  }

  if ('function' == typeof utf8encode) {
    callback = utf8encode;
    utf8encode = null;
  }

  var data = (packet.data === undefined)
    ? undefined
    : packet.data.buffer || packet.data;

  if (global.ArrayBuffer && data instanceof ArrayBuffer) {
    return encodeArrayBuffer(packet, supportsBinary, callback);
  } else if (Blob && data instanceof global.Blob) {
    return encodeBlob(packet, supportsBinary, callback);
  }

  // might be an object with { base64: true, data: dataAsBase64String }
  if (data && data.base64) {
    return encodeBase64Object(packet, callback);
  }

  // Sending data as a utf-8 string
  var encoded = packets[packet.type];

  // data fragment is optional
  if (undefined !== packet.data) {
    encoded += utf8encode ? utf8.encode(String(packet.data)) : String(packet.data);
  }

  return callback('' + encoded);

};

function encodeBase64Object(packet, callback) {
  // packet data is an object { base64: true, data: dataAsBase64String }
  var message = 'b' + exports.packets[packet.type] + packet.data.data;
  return callback(message);
}

/**
 * Encode packet helpers for binary types
 */

function encodeArrayBuffer(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  var data = packet.data;
  var contentArray = new Uint8Array(data);
  var resultBuffer = new Uint8Array(1 + data.byteLength);

  resultBuffer[0] = packets[packet.type];
  for (var i = 0; i < contentArray.length; i++) {
    resultBuffer[i+1] = contentArray[i];
  }

  return callback(resultBuffer.buffer);
}

function encodeBlobAsArrayBuffer(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  var fr = new FileReader();
  fr.onload = function() {
    packet.data = fr.result;
    exports.encodePacket(packet, supportsBinary, true, callback);
  };
  return fr.readAsArrayBuffer(packet.data);
}

function encodeBlob(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  if (dontSendBlobs) {
    return encodeBlobAsArrayBuffer(packet, supportsBinary, callback);
  }

  var length = new Uint8Array(1);
  length[0] = packets[packet.type];
  var blob = new Blob([length.buffer, packet.data]);

  return callback(blob);
}

/**
 * Encodes a packet with binary data in a base64 string
 *
 * @param {Object} packet, has `type` and `data`
 * @return {String} base64 encoded message
 */

exports.encodeBase64Packet = function(packet, callback) {
  var message = 'b' + exports.packets[packet.type];
  if (Blob && packet.data instanceof global.Blob) {
    var fr = new FileReader();
    fr.onload = function() {
      var b64 = fr.result.split(',')[1];
      callback(message + b64);
    };
    return fr.readAsDataURL(packet.data);
  }

  var b64data;
  try {
    b64data = String.fromCharCode.apply(null, new Uint8Array(packet.data));
  } catch (e) {
    // iPhone Safari doesn't let you apply with typed arrays
    var typed = new Uint8Array(packet.data);
    var basic = new Array(typed.length);
    for (var i = 0; i < typed.length; i++) {
      basic[i] = typed[i];
    }
    b64data = String.fromCharCode.apply(null, basic);
  }
  message += global.btoa(b64data);
  return callback(message);
};

/**
 * Decodes a packet. Changes format to Blob if requested.
 *
 * @return {Object} with `type` and `data` (if any)
 * @api private
 */

exports.decodePacket = function (data, binaryType, utf8decode) {
  if (data === undefined) {
    return err;
  }
  // String data
  if (typeof data == 'string') {
    if (data.charAt(0) == 'b') {
      return exports.decodeBase64Packet(data.substr(1), binaryType);
    }

    if (utf8decode) {
      data = tryDecode(data);
      if (data === false) {
        return err;
      }
    }
    var type = data.charAt(0);

    if (Number(type) != type || !packetslist[type]) {
      return err;
    }

    if (data.length > 1) {
      return { type: packetslist[type], data: data.substring(1) };
    } else {
      return { type: packetslist[type] };
    }
  }

  var asArray = new Uint8Array(data);
  var type = asArray[0];
  var rest = sliceBuffer(data, 1);
  if (Blob && binaryType === 'blob') {
    rest = new Blob([rest]);
  }
  return { type: packetslist[type], data: rest };
};

function tryDecode(data) {
  try {
    data = utf8.decode(data);
  } catch (e) {
    return false;
  }
  return data;
}

/**
 * Decodes a packet encoded in a base64 string
 *
 * @param {String} base64 encoded message
 * @return {Object} with `type` and `data` (if any)
 */

exports.decodeBase64Packet = function(msg, binaryType) {
  var type = packetslist[msg.charAt(0)];
  if (!base64encoder) {
    return { type: type, data: { base64: true, data: msg.substr(1) } };
  }

  var data = base64encoder.decode(msg.substr(1));

  if (binaryType === 'blob' && Blob) {
    data = new Blob([data]);
  }

  return { type: type, data: data };
};

/**
 * Encodes multiple messages (payload).
 *
 *     <length>:data
 *
 * Example:
 *
 *     11:hello world2:hi
 *
 * If any contents are binary, they will be encoded as base64 strings. Base64
 * encoded strings are marked with a b before the length specifier
 *
 * @param {Array} packets
 * @api private
 */

exports.encodePayload = function (packets, supportsBinary, callback) {
  if (typeof supportsBinary == 'function') {
    callback = supportsBinary;
    supportsBinary = null;
  }

  var isBinary = hasBinary(packets);

  if (supportsBinary && isBinary) {
    if (Blob && !dontSendBlobs) {
      return exports.encodePayloadAsBlob(packets, callback);
    }

    return exports.encodePayloadAsArrayBuffer(packets, callback);
  }

  if (!packets.length) {
    return callback('0:');
  }

  function setLengthHeader(message) {
    return message.length + ':' + message;
  }

  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, !isBinary ? false : supportsBinary, true, function(message) {
      doneCallback(null, setLengthHeader(message));
    });
  }

  map(packets, encodeOne, function(err, results) {
    return callback(results.join(''));
  });
};

/**
 * Async array map using after
 */

function map(ary, each, done) {
  var result = new Array(ary.length);
  var next = after(ary.length, done);

  var eachWithIndex = function(i, el, cb) {
    each(el, function(error, msg) {
      result[i] = msg;
      cb(error, result);
    });
  };

  for (var i = 0; i < ary.length; i++) {
    eachWithIndex(i, ary[i], next);
  }
}

/*
 * Decodes data when a payload is maybe expected. Possible binary contents are
 * decoded from their base64 representation
 *
 * @param {String} data, callback method
 * @api public
 */

exports.decodePayload = function (data, binaryType, callback) {
  if (typeof data != 'string') {
    return exports.decodePayloadAsBinary(data, binaryType, callback);
  }

  if (typeof binaryType === 'function') {
    callback = binaryType;
    binaryType = null;
  }

  var packet;
  if (data == '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

  var length = ''
    , n, msg;

  for (var i = 0, l = data.length; i < l; i++) {
    var chr = data.charAt(i);

    if (':' != chr) {
      length += chr;
    } else {
      if ('' == length || (length != (n = Number(length)))) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      msg = data.substr(i + 1, n);

      if (length != msg.length) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      if (msg.length) {
        packet = exports.decodePacket(msg, binaryType, true);

        if (err.type == packet.type && err.data == packet.data) {
          // parser error in individual packet - ignoring payload
          return callback(err, 0, 1);
        }

        var ret = callback(packet, i + n, l);
        if (false === ret) return;
      }

      // advance cursor
      i += n;
      length = '';
    }
  }

  if (length != '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

};

/**
 * Encodes multiple messages (payload) as binary.
 *
 * <1 = binary, 0 = string><number from 0-9><number from 0-9>[...]<number
 * 255><data>
 *
 * Example:
 * 1 3 255 1 2 3, if the binary contents are interpreted as 8 bit integers
 *
 * @param {Array} packets
 * @return {ArrayBuffer} encoded payload
 * @api private
 */

exports.encodePayloadAsArrayBuffer = function(packets, callback) {
  if (!packets.length) {
    return callback(new ArrayBuffer(0));
  }

  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, true, true, function(data) {
      return doneCallback(null, data);
    });
  }

  map(packets, encodeOne, function(err, encodedPackets) {
    var totalLength = encodedPackets.reduce(function(acc, p) {
      var len;
      if (typeof p === 'string'){
        len = p.length;
      } else {
        len = p.byteLength;
      }
      return acc + len.toString().length + len + 2; // string/binary identifier + separator = 2
    }, 0);

    var resultArray = new Uint8Array(totalLength);

    var bufferIndex = 0;
    encodedPackets.forEach(function(p) {
      var isString = typeof p === 'string';
      var ab = p;
      if (isString) {
        var view = new Uint8Array(p.length);
        for (var i = 0; i < p.length; i++) {
          view[i] = p.charCodeAt(i);
        }
        ab = view.buffer;
      }

      if (isString) { // not true binary
        resultArray[bufferIndex++] = 0;
      } else { // true binary
        resultArray[bufferIndex++] = 1;
      }

      var lenStr = ab.byteLength.toString();
      for (var i = 0; i < lenStr.length; i++) {
        resultArray[bufferIndex++] = parseInt(lenStr[i]);
      }
      resultArray[bufferIndex++] = 255;

      var view = new Uint8Array(ab);
      for (var i = 0; i < view.length; i++) {
        resultArray[bufferIndex++] = view[i];
      }
    });

    return callback(resultArray.buffer);
  });
};

/**
 * Encode as Blob
 */

exports.encodePayloadAsBlob = function(packets, callback) {
  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, true, true, function(encoded) {
      var binaryIdentifier = new Uint8Array(1);
      binaryIdentifier[0] = 1;
      if (typeof encoded === 'string') {
        var view = new Uint8Array(encoded.length);
        for (var i = 0; i < encoded.length; i++) {
          view[i] = encoded.charCodeAt(i);
        }
        encoded = view.buffer;
        binaryIdentifier[0] = 0;
      }

      var len = (encoded instanceof ArrayBuffer)
        ? encoded.byteLength
        : encoded.size;

      var lenStr = len.toString();
      var lengthAry = new Uint8Array(lenStr.length + 1);
      for (var i = 0; i < lenStr.length; i++) {
        lengthAry[i] = parseInt(lenStr[i]);
      }
      lengthAry[lenStr.length] = 255;

      if (Blob) {
        var blob = new Blob([binaryIdentifier.buffer, lengthAry.buffer, encoded]);
        doneCallback(null, blob);
      }
    });
  }

  map(packets, encodeOne, function(err, results) {
    return callback(new Blob(results));
  });
};

/*
 * Decodes data when a payload is maybe expected. Strings are decoded by
 * interpreting each byte as a key code for entries marked to start with 0. See
 * description of encodePayloadAsBinary
 *
 * @param {ArrayBuffer} data, callback method
 * @api public
 */

exports.decodePayloadAsBinary = function (data, binaryType, callback) {
  if (typeof binaryType === 'function') {
    callback = binaryType;
    binaryType = null;
  }

  var bufferTail = data;
  var buffers = [];

  var numberTooLong = false;
  while (bufferTail.byteLength > 0) {
    var tailArray = new Uint8Array(bufferTail);
    var isString = tailArray[0] === 0;
    var msgLength = '';

    for (var i = 1; ; i++) {
      if (tailArray[i] == 255) break;

      if (msgLength.length > 310) {
        numberTooLong = true;
        break;
      }

      msgLength += tailArray[i];
    }

    if(numberTooLong) return callback(err, 0, 1);

    bufferTail = sliceBuffer(bufferTail, 2 + msgLength.length);
    msgLength = parseInt(msgLength);

    var msg = sliceBuffer(bufferTail, 0, msgLength);
    if (isString) {
      try {
        msg = String.fromCharCode.apply(null, new Uint8Array(msg));
      } catch (e) {
        // iPhone Safari doesn't let you apply to typed arrays
        var typed = new Uint8Array(msg);
        msg = '';
        for (var i = 0; i < typed.length; i++) {
          msg += String.fromCharCode(typed[i]);
        }
      }
    }

    buffers.push(msg);
    bufferTail = sliceBuffer(bufferTail, msgLength);
  }

  var total = buffers.length;
  buffers.forEach(function(buffer, i) {
    callback(exports.decodePacket(buffer, binaryType, true), i, total);
  });
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

__webpack_require__(359);

var _toastrMin = __webpack_require__(363);

var _toastrMin2 = _interopRequireDefault(_toastrMin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_toastrMin2.default.options = {
	debug: false,
	newestOnTop: true,
	timeOut: 5000
};

exports.default = _toastrMin2.default;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {


/**
 * Expose `Emitter`.
 */

if (true) {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};


/***/ },
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */
/***/ function(module, exports) {


module.exports = function(a, b){
  var fn = function(){};
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
};

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {
/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__(284);
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && 'WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    return exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (typeof process !== 'undefined' && 'env' in process) {
    return {"NODE_ENV":"production"}.DEBUG;
  }
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(26)))

/***/ },
/* 26 */,
/* 27 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {
/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__(355);
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && 'WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    return exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (typeof process !== 'undefined' && 'env' in process) {
    return {"NODE_ENV":"production"}.DEBUG;
  }
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(26)))

/***/ },
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */
/***/ function(module, exports, __webpack_require__) {

/**
 * Module dependencies.
 */

var parser = __webpack_require__(12);
var Emitter = __webpack_require__(17);

/**
 * Module exports.
 */

module.exports = Transport;

/**
 * Transport abstract constructor.
 *
 * @param {Object} options.
 * @api private
 */

function Transport (opts) {
  this.path = opts.path;
  this.hostname = opts.hostname;
  this.port = opts.port;
  this.secure = opts.secure;
  this.query = opts.query;
  this.timestampParam = opts.timestampParam;
  this.timestampRequests = opts.timestampRequests;
  this.readyState = '';
  this.agent = opts.agent || false;
  this.socket = opts.socket;
  this.enablesXDR = opts.enablesXDR;

  // SSL options for Node.js client
  this.pfx = opts.pfx;
  this.key = opts.key;
  this.passphrase = opts.passphrase;
  this.cert = opts.cert;
  this.ca = opts.ca;
  this.ciphers = opts.ciphers;
  this.rejectUnauthorized = opts.rejectUnauthorized;
  this.forceNode = opts.forceNode;

  // other options for Node.js client
  this.extraHeaders = opts.extraHeaders;
  this.localAddress = opts.localAddress;
}

/**
 * Mix in `Emitter`.
 */

Emitter(Transport.prototype);

/**
 * Emits an error.
 *
 * @param {String} str
 * @return {Transport} for chaining
 * @api public
 */

Transport.prototype.onError = function (msg, desc) {
  var err = new Error(msg);
  err.type = 'TransportError';
  err.description = desc;
  this.emit('error', err);
  return this;
};

/**
 * Opens the transport.
 *
 * @api public
 */

Transport.prototype.open = function () {
  if ('closed' === this.readyState || '' === this.readyState) {
    this.readyState = 'opening';
    this.doOpen();
  }

  return this;
};

/**
 * Closes the transport.
 *
 * @api private
 */

Transport.prototype.close = function () {
  if ('opening' === this.readyState || 'open' === this.readyState) {
    this.doClose();
    this.onClose();
  }

  return this;
};

/**
 * Sends multiple packets.
 *
 * @param {Array} packets
 * @api private
 */

Transport.prototype.send = function (packets) {
  if ('open' === this.readyState) {
    this.write(packets);
  } else {
    throw new Error('Transport not open');
  }
};

/**
 * Called upon open
 *
 * @api private
 */

Transport.prototype.onOpen = function () {
  this.readyState = 'open';
  this.writable = true;
  this.emit('open');
};

/**
 * Called with data.
 *
 * @param {String} data
 * @api private
 */

Transport.prototype.onData = function (data) {
  var packet = parser.decodePacket(data, this.socket.binaryType);
  this.onPacket(packet);
};

/**
 * Called with a decoded packet.
 */

Transport.prototype.onPacket = function (packet) {
  this.emit('packet', packet);
};

/**
 * Called upon close.
 *
 * @api private
 */

Transport.prototype.onClose = function () {
  this.readyState = 'closed';
  this.emit('close');
};


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {// browser shim for xmlhttprequest module

var hasCORS = __webpack_require__(308);

module.exports = function (opts) {
  var xdomain = opts.xdomain;

  // scheme must be same when usign XDomainRequest
  // http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
  var xscheme = opts.xscheme;

  // XDomainRequest has a flow of not sending cookie, therefore it should be disabled as a default.
  // https://github.com/Automattic/engine.io-client/pull/217
  var enablesXDR = opts.enablesXDR;

  // XMLHttpRequest can be disabled on IE
  try {
    if ('undefined' !== typeof XMLHttpRequest && (!xdomain || hasCORS)) {
      return new XMLHttpRequest();
    }
  } catch (e) { }

  // Use XDomainRequest for IE8 if enablesXDR is true
  // because loading bar keeps flashing when using jsonp-polling
  // https://github.com/yujiosaka/socke.io-ie8-loading-example
  try {
    if ('undefined' !== typeof XDomainRequest && !xscheme && enablesXDR) {
      return new XDomainRequest();
    }
  } catch (e) { }

  if (!xdomain) {
    try {
      return new global[['Active'].concat('Object').join('X')]('Microsoft.XMLHTTP');
    } catch (e) { }
  }
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 36 */,
/* 37 */,
/* 38 */,
/* 39 */
/***/ function(module, exports) {

/**
 * Compiles a querystring
 * Returns string representation of the object
 *
 * @param {Object}
 * @api private
 */

exports.encode = function (obj) {
  var str = '';

  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      if (str.length) str += '&';
      str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
    }
  }

  return str;
};

/**
 * Parses a simple querystring into an object
 *
 * @param {String} qs
 * @api private
 */

exports.decode = function(qs){
  var qry = {};
  var pairs = qs.split('&');
  for (var i = 0, l = pairs.length; i < l; i++) {
    var pair = pairs[i].split('=');
    qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return qry;
};


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {


/**
 * Module dependencies.
 */

var debug = __webpack_require__(275)('socket.io-parser');
var json = __webpack_require__(331);
var Emitter = __webpack_require__(357);
var binary = __webpack_require__(356);
var isBuf = __webpack_require__(195);

/**
 * Protocol version.
 *
 * @api public
 */

exports.protocol = 4;

/**
 * Packet types.
 *
 * @api public
 */

exports.types = [
  'CONNECT',
  'DISCONNECT',
  'EVENT',
  'ACK',
  'ERROR',
  'BINARY_EVENT',
  'BINARY_ACK'
];

/**
 * Packet type `connect`.
 *
 * @api public
 */

exports.CONNECT = 0;

/**
 * Packet type `disconnect`.
 *
 * @api public
 */

exports.DISCONNECT = 1;

/**
 * Packet type `event`.
 *
 * @api public
 */

exports.EVENT = 2;

/**
 * Packet type `ack`.
 *
 * @api public
 */

exports.ACK = 3;

/**
 * Packet type `error`.
 *
 * @api public
 */

exports.ERROR = 4;

/**
 * Packet type 'binary event'
 *
 * @api public
 */

exports.BINARY_EVENT = 5;

/**
 * Packet type `binary ack`. For acks with binary arguments.
 *
 * @api public
 */

exports.BINARY_ACK = 6;

/**
 * Encoder constructor.
 *
 * @api public
 */

exports.Encoder = Encoder;

/**
 * Decoder constructor.
 *
 * @api public
 */

exports.Decoder = Decoder;

/**
 * A socket.io Encoder instance
 *
 * @api public
 */

function Encoder() {}

/**
 * Encode a packet as a single string if non-binary, or as a
 * buffer sequence, depending on packet type.
 *
 * @param {Object} obj - packet object
 * @param {Function} callback - function to handle encodings (likely engine.write)
 * @return Calls callback with Array of encodings
 * @api public
 */

Encoder.prototype.encode = function(obj, callback){
  debug('encoding packet %j', obj);

  if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
    encodeAsBinary(obj, callback);
  }
  else {
    var encoding = encodeAsString(obj);
    callback([encoding]);
  }
};

/**
 * Encode packet as string.
 *
 * @param {Object} packet
 * @return {String} encoded
 * @api private
 */

function encodeAsString(obj) {
  var str = '';
  var nsp = false;

  // first is type
  str += obj.type;

  // attachments if we have them
  if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
    str += obj.attachments;
    str += '-';
  }

  // if we have a namespace other than `/`
  // we append it followed by a comma `,`
  if (obj.nsp && '/' != obj.nsp) {
    nsp = true;
    str += obj.nsp;
  }

  // immediately followed by the id
  if (null != obj.id) {
    if (nsp) {
      str += ',';
      nsp = false;
    }
    str += obj.id;
  }

  // json data
  if (null != obj.data) {
    if (nsp) str += ',';
    str += json.stringify(obj.data);
  }

  debug('encoded %j as %s', obj, str);
  return str;
}

/**
 * Encode packet as 'buffer sequence' by removing blobs, and
 * deconstructing packet into object with placeholders and
 * a list of buffers.
 *
 * @param {Object} packet
 * @return {Buffer} encoded
 * @api private
 */

function encodeAsBinary(obj, callback) {

  function writeEncoding(bloblessData) {
    var deconstruction = binary.deconstructPacket(bloblessData);
    var pack = encodeAsString(deconstruction.packet);
    var buffers = deconstruction.buffers;

    buffers.unshift(pack); // add packet info to beginning of data list
    callback(buffers); // write all the buffers
  }

  binary.removeBlobs(obj, writeEncoding);
}

/**
 * A socket.io Decoder instance
 *
 * @return {Object} decoder
 * @api public
 */

function Decoder() {
  this.reconstructor = null;
}

/**
 * Mix in `Emitter` with Decoder.
 */

Emitter(Decoder.prototype);

/**
 * Decodes an ecoded packet string into packet JSON.
 *
 * @param {String} obj - encoded packet
 * @return {Object} packet
 * @api public
 */

Decoder.prototype.add = function(obj) {
  var packet;
  if ('string' == typeof obj) {
    packet = decodeString(obj);
    if (exports.BINARY_EVENT == packet.type || exports.BINARY_ACK == packet.type) { // binary packet's json
      this.reconstructor = new BinaryReconstructor(packet);

      // no attachments, labeled binary but no binary data to follow
      if (this.reconstructor.reconPack.attachments === 0) {
        this.emit('decoded', packet);
      }
    } else { // non-binary full packet
      this.emit('decoded', packet);
    }
  }
  else if (isBuf(obj) || obj.base64) { // raw binary data
    if (!this.reconstructor) {
      throw new Error('got binary data when not reconstructing a packet');
    } else {
      packet = this.reconstructor.takeBinaryData(obj);
      if (packet) { // received final buffer
        this.reconstructor = null;
        this.emit('decoded', packet);
      }
    }
  }
  else {
    throw new Error('Unknown type: ' + obj);
  }
};

/**
 * Decode a packet String (JSON data)
 *
 * @param {String} str
 * @return {Object} packet
 * @api private
 */

function decodeString(str) {
  var p = {};
  var i = 0;

  // look up type
  p.type = Number(str.charAt(0));
  if (null == exports.types[p.type]) return error();

  // look up attachments if type binary
  if (exports.BINARY_EVENT == p.type || exports.BINARY_ACK == p.type) {
    var buf = '';
    while (str.charAt(++i) != '-') {
      buf += str.charAt(i);
      if (i == str.length) break;
    }
    if (buf != Number(buf) || str.charAt(i) != '-') {
      throw new Error('Illegal attachments');
    }
    p.attachments = Number(buf);
  }

  // look up namespace (if any)
  if ('/' == str.charAt(i + 1)) {
    p.nsp = '';
    while (++i) {
      var c = str.charAt(i);
      if (',' == c) break;
      p.nsp += c;
      if (i == str.length) break;
    }
  } else {
    p.nsp = '/';
  }

  // look up id
  var next = str.charAt(i + 1);
  if ('' !== next && Number(next) == next) {
    p.id = '';
    while (++i) {
      var c = str.charAt(i);
      if (null == c || Number(c) != c) {
        --i;
        break;
      }
      p.id += str.charAt(i);
      if (i == str.length) break;
    }
    p.id = Number(p.id);
  }

  // look up json data
  if (str.charAt(++i)) {
    p = tryParse(p, str.substr(i));
  }

  debug('decoded %s as %j', str, p);
  return p;
}

function tryParse(p, str) {
  try {
    p.data = json.parse(str);
  } catch(e){
    return error();
  }
  return p; 
};

/**
 * Deallocates a parser's resources
 *
 * @api public
 */

Decoder.prototype.destroy = function() {
  if (this.reconstructor) {
    this.reconstructor.finishedReconstruction();
  }
};

/**
 * A manager of a binary event's 'buffer sequence'. Should
 * be constructed whenever a packet of type BINARY_EVENT is
 * decoded.
 *
 * @param {Object} packet
 * @return {BinaryReconstructor} initialized reconstructor
 * @api private
 */

function BinaryReconstructor(packet) {
  this.reconPack = packet;
  this.buffers = [];
}

/**
 * Method to be called when binary data received from connection
 * after a BINARY_EVENT packet.
 *
 * @param {Buffer | ArrayBuffer} binData - the raw binary data received
 * @return {null | Object} returns null if more binary data is expected or
 *   a reconstructed packet object if all buffers have been received.
 * @api private
 */

BinaryReconstructor.prototype.takeBinaryData = function(binData) {
  this.buffers.push(binData);
  if (this.buffers.length == this.reconPack.attachments) { // done with buffer list
    var packet = binary.reconstructPacket(this.reconPack, this.buffers);
    this.finishedReconstruction();
    return packet;
  }
  return null;
};

/**
 * Cleans up binary packet reconstruction variables.
 *
 * @api private
 */

BinaryReconstructor.prototype.finishedReconstruction = function() {
  this.reconPack = null;
  this.buffers = [];
};

function error(data){
  return {
    type: exports.ERROR,
    data: 'parser error'
  };
}


/***/ },
/* 41 */,
/* 42 */,
/* 43 */,
/* 44 */,
/* 45 */,
/* 46 */,
/* 47 */,
/* 48 */,
/* 49 */,
/* 50 */,
/* 51 */,
/* 52 */,
/* 53 */,
/* 54 */,
/* 55 */,
/* 56 */,
/* 57 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var LOAD = exports.LOAD = "LOAD";
var ADD = exports.ADD = "ADD";
var SELECT = exports.SELECT = "SELECT";
var CLEAR_SELECT = exports.CLEAR_SELECT = "CLEAR_SELECT";
var UPDATE = exports.UPDATE = "UPDATE";
var REMOVE = exports.REMOVE = "REMOVE";

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var LOAD = exports.LOAD = "LOAD";
var LOAD_MORE = exports.LOAD_MORE = "LOAD_MORE";
var ADD = exports.ADD = "ADD";
var UPDATE = exports.UPDATE = "UPDATE";
var REMOVE = exports.REMOVE = "REMOVE";

var FETCHING = exports.FETCHING = "FETCHING";
var NO_MORE_ITEMS = exports.NO_MORE_ITEMS = "NO_MORE_ITEMS";
var CLEAR = exports.CLEAR = "CLEAR";

var CHANGE_SORT = exports.CHANGE_SORT = "CHANGE_SORT";
var CHANGE_VIEWMODE = exports.CHANGE_VIEWMODE = "CHANGE_VIEWMODE";

var VOTE = exports.VOTE = "VOTE";
var UNVOTE = exports.UNVOTE = "UNVOTE";

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var SEARCH = exports.SEARCH = "SEARCH";
var ADD_NOTIFICATION = exports.ADD_NOTIFICATION = "ADD_NOTIFICATION";
var ADD_MESSAGE = exports.ADD_MESSAGE = "ADD_MESSAGE";
var SET_USER = exports.SET_USER = "SET_SESSION_USER";

/***/ },
/* 60 */
/***/ function(module, exports) {

/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/**
 * Module dependencies
 */

var XMLHttpRequest = __webpack_require__(35);
var XHR = __webpack_require__(282);
var JSONP = __webpack_require__(281);
var websocket = __webpack_require__(283);

/**
 * Export transports.
 */

exports.polling = polling;
exports.websocket = websocket;

/**
 * Polling transport polymorphic constructor.
 * Decides on xhr vs jsonp based on feature detection.
 *
 * @api private
 */

function polling (opts) {
  var xhr;
  var xd = false;
  var xs = false;
  var jsonp = false !== opts.jsonp;

  if (global.location) {
    var isSSL = 'https:' === location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    xd = opts.hostname !== location.hostname || port !== opts.port;
    xs = opts.secure !== isSSL;
  }

  opts.xdomain = xd;
  opts.xscheme = xs;
  xhr = new XMLHttpRequest(opts);

  if ('open' in xhr && !opts.forceJSONP) {
    return new XHR(opts);
  } else {
    if (!jsonp) throw new Error('JSONP disabled');
    return new JSONP(opts);
  }
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

/**
 * Module dependencies.
 */

var Transport = __webpack_require__(34);
var parseqs = __webpack_require__(39);
var parser = __webpack_require__(12);
var inherit = __webpack_require__(24);
var yeast = __webpack_require__(199);
var debug = __webpack_require__(25)('engine.io-client:polling');

/**
 * Module exports.
 */

module.exports = Polling;

/**
 * Is XHR2 supported?
 */

var hasXHR2 = (function () {
  var XMLHttpRequest = __webpack_require__(35);
  var xhr = new XMLHttpRequest({ xdomain: false });
  return null != xhr.responseType;
})();

/**
 * Polling interface.
 *
 * @param {Object} opts
 * @api private
 */

function Polling (opts) {
  var forceBase64 = (opts && opts.forceBase64);
  if (!hasXHR2 || forceBase64) {
    this.supportsBinary = false;
  }
  Transport.call(this, opts);
}

/**
 * Inherits from Transport.
 */

inherit(Polling, Transport);

/**
 * Transport name.
 */

Polling.prototype.name = 'polling';

/**
 * Opens the socket (triggers polling). We write a PING message to determine
 * when the transport is open.
 *
 * @api private
 */

Polling.prototype.doOpen = function () {
  this.poll();
};

/**
 * Pauses polling.
 *
 * @param {Function} callback upon buffers are flushed and transport is paused
 * @api private
 */

Polling.prototype.pause = function (onPause) {
  var self = this;

  this.readyState = 'pausing';

  function pause () {
    debug('paused');
    self.readyState = 'paused';
    onPause();
  }

  if (this.polling || !this.writable) {
    var total = 0;

    if (this.polling) {
      debug('we are currently polling - waiting to pause');
      total++;
      this.once('pollComplete', function () {
        debug('pre-pause polling complete');
        --total || pause();
      });
    }

    if (!this.writable) {
      debug('we are currently writing - waiting to pause');
      total++;
      this.once('drain', function () {
        debug('pre-pause writing complete');
        --total || pause();
      });
    }
  } else {
    pause();
  }
};

/**
 * Starts polling cycle.
 *
 * @api public
 */

Polling.prototype.poll = function () {
  debug('polling');
  this.polling = true;
  this.doPoll();
  this.emit('poll');
};

/**
 * Overloads onData to detect payloads.
 *
 * @api private
 */

Polling.prototype.onData = function (data) {
  var self = this;
  debug('polling got data %s', data);
  var callback = function (packet, index, total) {
    // if its the first message we consider the transport open
    if ('opening' === self.readyState) {
      self.onOpen();
    }

    // if its a close packet, we close the ongoing requests
    if ('close' === packet.type) {
      self.onClose();
      return false;
    }

    // otherwise bypass onData and handle the message
    self.onPacket(packet);
  };

  // decode payload
  parser.decodePayload(data, this.socket.binaryType, callback);

  // if an event did not trigger closing
  if ('closed' !== this.readyState) {
    // if we got data we're not polling
    this.polling = false;
    this.emit('pollComplete');

    if ('open' === this.readyState) {
      this.poll();
    } else {
      debug('ignoring poll - transport state "%s"', this.readyState);
    }
  }
};

/**
 * For polling, send a close packet.
 *
 * @api private
 */

Polling.prototype.doClose = function () {
  var self = this;

  function close () {
    debug('writing close packet');
    self.write([{ type: 'close' }]);
  }

  if ('open' === this.readyState) {
    debug('transport open - closing');
    close();
  } else {
    // in case we're trying to close while
    // handshaking is in progress (GH-164)
    debug('transport not open - deferring close');
    this.once('open', close);
  }
};

/**
 * Writes a packets payload.
 *
 * @param {Array} data packets
 * @param {Function} drain callback
 * @api private
 */

Polling.prototype.write = function (packets) {
  var self = this;
  this.writable = false;
  var callbackfn = function () {
    self.writable = true;
    self.emit('drain');
  };

  parser.encodePayload(packets, this.supportsBinary, function (data) {
    self.doWrite(data, callbackfn);
  });
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

Polling.prototype.uri = function () {
  var query = this.query || {};
  var schema = this.secure ? 'https' : 'http';
  var port = '';

  // cache busting is forced
  if (false !== this.timestampRequests) {
    query[this.timestampParam] = yeast();
  }

  if (!this.supportsBinary && !query.sid) {
    query.b64 = 1;
  }

  query = parseqs.encode(query);

  // avoid port if default for schema
  if (this.port && (('https' === schema && Number(this.port) !== 443) ||
     ('http' === schema && Number(this.port) !== 80))) {
    port = ':' + this.port;
  }

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  var ipv6 = this.hostname.indexOf(':') !== -1;
  return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
};


/***/ },
/* 63 */,
/* 64 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {
/*
 * Module requirements.
 */

var isArray = __webpack_require__(68);

/**
 * Module exports.
 */

module.exports = hasBinary;

/**
 * Checks for binary data.
 *
 * Right now only Buffer and ArrayBuffer are supported..
 *
 * @param {Object} anything
 * @api public
 */

function hasBinary(data) {

  function _hasBinary(obj) {
    if (!obj) return false;

    if ( (global.Buffer && global.Buffer.isBuffer && global.Buffer.isBuffer(obj)) ||
         (global.ArrayBuffer && obj instanceof ArrayBuffer) ||
         (global.Blob && obj instanceof Blob) ||
         (global.File && obj instanceof File)
        ) {
      return true;
    }

    if (isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
          if (_hasBinary(obj[i])) {
              return true;
          }
      }
    } else if (obj && 'object' == typeof obj) {
      // see: https://github.com/Automattic/has-binary/pull/4
      if (obj.toJSON && 'function' == typeof obj.toJSON) {
        obj = obj.toJSON();
      }

      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && _hasBinary(obj[key])) {
          return true;
        }
      }
    }

    return false;
  }

  return _hasBinary(data);
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 65 */,
/* 66 */,
/* 67 */
/***/ function(module, exports) {


var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};

/***/ },
/* 68 */
/***/ function(module, exports) {

module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};


/***/ },
/* 69 */,
/* 70 */,
/* 71 */,
/* 72 */,
/* 73 */,
/* 74 */,
/* 75 */,
/* 76 */,
/* 77 */,
/* 78 */,
/* 79 */,
/* 80 */,
/* 81 */,
/* 82 */,
/* 83 */,
/* 84 */,
/* 85 */,
/* 86 */,
/* 87 */,
/* 88 */,
/* 89 */,
/* 90 */,
/* 91 */,
/* 92 */,
/* 93 */,
/* 94 */,
/* 95 */,
/* 96 */,
/* 97 */,
/* 98 */,
/* 99 */,
/* 100 */,
/* 101 */,
/* 102 */,
/* 103 */,
/* 104 */,
/* 105 */,
/* 106 */,
/* 107 */,
/* 108 */,
/* 109 */,
/* 110 */,
/* 111 */,
/* 112 */,
/* 113 */,
/* 114 */,
/* 115 */,
/* 116 */,
/* 117 */,
/* 118 */,
/* 119 */,
/* 120 */,
/* 121 */,
/* 122 */,
/* 123 */,
/* 124 */,
/* 125 */,
/* 126 */,
/* 127 */,
/* 128 */,
/* 129 */,
/* 130 */,
/* 131 */,
/* 132 */,
/* 133 */,
/* 134 */,
/* 135 */,
/* 136 */,
/* 137 */,
/* 138 */,
/* 139 */,
/* 140 */,
/* 141 */,
/* 142 */,
/* 143 */,
/* 144 */,
/* 145 */,
/* 146 */,
/* 147 */,
/* 148 */,
/* 149 */,
/* 150 */,
/* 151 */,
/* 152 */,
/* 153 */,
/* 154 */,
/* 155 */,
/* 156 */,
/* 157 */,
/* 158 */,
/* 159 */,
/* 160 */,
/* 161 */,
/* 162 */,
/* 163 */,
/* 164 */,
/* 165 */,
/* 166 */,
/* 167 */,
/* 168 */,
/* 169 */,
/* 170 */,
/* 171 */,
/* 172 */,
/* 173 */,
/* 174 */,
/* 175 */,
/* 176 */,
/* 177 */,
/* 178 */,
/* 179 */,
/* 180 */,
/* 181 */,
/* 182 */,
/* 183 */,
/* 184 */,
/* 185 */,
/* 186 */,
/* 187 */
/***/ function(module, exports) {

/**
 * Helpers.
 */

var s = 1000
var m = s * 60
var h = m * 60
var d = h * 24
var y = d * 365.25

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function (val, options) {
  options = options || {}
  var type = typeof val
  if (type === 'string' && val.length > 0) {
    return parse(val)
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ?
			fmtLong(val) :
			fmtShort(val)
  }
  throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val))
}

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str)
  if (str.length > 10000) {
    return
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str)
  if (!match) {
    return
  }
  var n = parseFloat(match[1])
  var type = (match[2] || 'ms').toLowerCase()
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y
    case 'days':
    case 'day':
    case 'd':
      return n * d
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n
    default:
      return undefined
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd'
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h'
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm'
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's'
  }
  return ms + 'ms'
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms'
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name
  }
  return Math.ceil(ms / n) + ' ' + name + 's'
}


/***/ },
/* 188 */
/***/ function(module, exports) {

/**
 * Parses an URI
 *
 * @author Steven Levithan <stevenlevithan.com> (MIT license)
 * @api private
 */

var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

var parts = [
    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
];

module.exports = function parseuri(str) {
    var src = str,
        b = str.indexOf('['),
        e = str.indexOf(']');

    if (b != -1 && e != -1) {
        str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
    }

    var m = re.exec(str || ''),
        uri = {},
        i = 14;

    while (i--) {
        uri[parts[i]] = m[i] || '';
    }

    if (b != -1 && e != -1) {
        uri.source = src;
        uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
        uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
        uri.ipv6uri = true;
    }

    return uri;
};


/***/ },
/* 189 */,
/* 190 */,
/* 191 */,
/* 192 */
/***/ function(module, exports, __webpack_require__) {


/**
 * Module dependencies.
 */

var eio = __webpack_require__(278);
var Socket = __webpack_require__(194);
var Emitter = __webpack_require__(17);
var parser = __webpack_require__(40);
var on = __webpack_require__(193);
var bind = __webpack_require__(60);
var debug = __webpack_require__(27)('socket.io-client:manager');
var indexOf = __webpack_require__(67);
var Backoff = __webpack_require__(270);

/**
 * IE6+ hasOwnProperty
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Module exports
 */

module.exports = Manager;

/**
 * `Manager` constructor.
 *
 * @param {String} engine instance or engine uri/opts
 * @param {Object} options
 * @api public
 */

function Manager (uri, opts) {
  if (!(this instanceof Manager)) return new Manager(uri, opts);
  if (uri && ('object' === typeof uri)) {
    opts = uri;
    uri = undefined;
  }
  opts = opts || {};

  opts.path = opts.path || '/socket.io';
  this.nsps = {};
  this.subs = [];
  this.opts = opts;
  this.reconnection(opts.reconnection !== false);
  this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
  this.reconnectionDelay(opts.reconnectionDelay || 1000);
  this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
  this.randomizationFactor(opts.randomizationFactor || 0.5);
  this.backoff = new Backoff({
    min: this.reconnectionDelay(),
    max: this.reconnectionDelayMax(),
    jitter: this.randomizationFactor()
  });
  this.timeout(null == opts.timeout ? 20000 : opts.timeout);
  this.readyState = 'closed';
  this.uri = uri;
  this.connecting = [];
  this.lastPing = null;
  this.encoding = false;
  this.packetBuffer = [];
  this.encoder = new parser.Encoder();
  this.decoder = new parser.Decoder();
  this.autoConnect = opts.autoConnect !== false;
  if (this.autoConnect) this.open();
}

/**
 * Propagate given event to sockets and emit on `this`
 *
 * @api private
 */

Manager.prototype.emitAll = function () {
  this.emit.apply(this, arguments);
  for (var nsp in this.nsps) {
    if (has.call(this.nsps, nsp)) {
      this.nsps[nsp].emit.apply(this.nsps[nsp], arguments);
    }
  }
};

/**
 * Update `socket.id` of all sockets
 *
 * @api private
 */

Manager.prototype.updateSocketIds = function () {
  for (var nsp in this.nsps) {
    if (has.call(this.nsps, nsp)) {
      this.nsps[nsp].id = this.engine.id;
    }
  }
};

/**
 * Mix in `Emitter`.
 */

Emitter(Manager.prototype);

/**
 * Sets the `reconnection` config.
 *
 * @param {Boolean} true/false if it should automatically reconnect
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnection = function (v) {
  if (!arguments.length) return this._reconnection;
  this._reconnection = !!v;
  return this;
};

/**
 * Sets the reconnection attempts config.
 *
 * @param {Number} max reconnection attempts before giving up
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionAttempts = function (v) {
  if (!arguments.length) return this._reconnectionAttempts;
  this._reconnectionAttempts = v;
  return this;
};

/**
 * Sets the delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionDelay = function (v) {
  if (!arguments.length) return this._reconnectionDelay;
  this._reconnectionDelay = v;
  this.backoff && this.backoff.setMin(v);
  return this;
};

Manager.prototype.randomizationFactor = function (v) {
  if (!arguments.length) return this._randomizationFactor;
  this._randomizationFactor = v;
  this.backoff && this.backoff.setJitter(v);
  return this;
};

/**
 * Sets the maximum delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionDelayMax = function (v) {
  if (!arguments.length) return this._reconnectionDelayMax;
  this._reconnectionDelayMax = v;
  this.backoff && this.backoff.setMax(v);
  return this;
};

/**
 * Sets the connection timeout. `false` to disable
 *
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.timeout = function (v) {
  if (!arguments.length) return this._timeout;
  this._timeout = v;
  return this;
};

/**
 * Starts trying to reconnect if reconnection is enabled and we have not
 * started reconnecting yet
 *
 * @api private
 */

Manager.prototype.maybeReconnectOnOpen = function () {
  // Only try to reconnect if it's the first time we're connecting
  if (!this.reconnecting && this._reconnection && this.backoff.attempts === 0) {
    // keeps reconnection from firing twice for the same reconnection loop
    this.reconnect();
  }
};

/**
 * Sets the current transport `socket`.
 *
 * @param {Function} optional, callback
 * @return {Manager} self
 * @api public
 */

Manager.prototype.open =
Manager.prototype.connect = function (fn, opts) {
  debug('readyState %s', this.readyState);
  if (~this.readyState.indexOf('open')) return this;

  debug('opening %s', this.uri);
  this.engine = eio(this.uri, this.opts);
  var socket = this.engine;
  var self = this;
  this.readyState = 'opening';
  this.skipReconnect = false;

  // emit `open`
  var openSub = on(socket, 'open', function () {
    self.onopen();
    fn && fn();
  });

  // emit `connect_error`
  var errorSub = on(socket, 'error', function (data) {
    debug('connect_error');
    self.cleanup();
    self.readyState = 'closed';
    self.emitAll('connect_error', data);
    if (fn) {
      var err = new Error('Connection error');
      err.data = data;
      fn(err);
    } else {
      // Only do this if there is no fn to handle the error
      self.maybeReconnectOnOpen();
    }
  });

  // emit `connect_timeout`
  if (false !== this._timeout) {
    var timeout = this._timeout;
    debug('connect attempt will timeout after %d', timeout);

    // set timer
    var timer = setTimeout(function () {
      debug('connect attempt timed out after %d', timeout);
      openSub.destroy();
      socket.close();
      socket.emit('error', 'timeout');
      self.emitAll('connect_timeout', timeout);
    }, timeout);

    this.subs.push({
      destroy: function () {
        clearTimeout(timer);
      }
    });
  }

  this.subs.push(openSub);
  this.subs.push(errorSub);

  return this;
};

/**
 * Called upon transport open.
 *
 * @api private
 */

Manager.prototype.onopen = function () {
  debug('open');

  // clear old subs
  this.cleanup();

  // mark as open
  this.readyState = 'open';
  this.emit('open');

  // add new subs
  var socket = this.engine;
  this.subs.push(on(socket, 'data', bind(this, 'ondata')));
  this.subs.push(on(socket, 'ping', bind(this, 'onping')));
  this.subs.push(on(socket, 'pong', bind(this, 'onpong')));
  this.subs.push(on(socket, 'error', bind(this, 'onerror')));
  this.subs.push(on(socket, 'close', bind(this, 'onclose')));
  this.subs.push(on(this.decoder, 'decoded', bind(this, 'ondecoded')));
};

/**
 * Called upon a ping.
 *
 * @api private
 */

Manager.prototype.onping = function () {
  this.lastPing = new Date();
  this.emitAll('ping');
};

/**
 * Called upon a packet.
 *
 * @api private
 */

Manager.prototype.onpong = function () {
  this.emitAll('pong', new Date() - this.lastPing);
};

/**
 * Called with data.
 *
 * @api private
 */

Manager.prototype.ondata = function (data) {
  this.decoder.add(data);
};

/**
 * Called when parser fully decodes a packet.
 *
 * @api private
 */

Manager.prototype.ondecoded = function (packet) {
  this.emit('packet', packet);
};

/**
 * Called upon socket error.
 *
 * @api private
 */

Manager.prototype.onerror = function (err) {
  debug('error', err);
  this.emitAll('error', err);
};

/**
 * Creates a new socket for the given `nsp`.
 *
 * @return {Socket}
 * @api public
 */

Manager.prototype.socket = function (nsp, opts) {
  var socket = this.nsps[nsp];
  if (!socket) {
    socket = new Socket(this, nsp, opts);
    this.nsps[nsp] = socket;
    var self = this;
    socket.on('connecting', onConnecting);
    socket.on('connect', function () {
      socket.id = self.engine.id;
    });

    if (this.autoConnect) {
      // manually call here since connecting evnet is fired before listening
      onConnecting();
    }
  }

  function onConnecting () {
    if (!~indexOf(self.connecting, socket)) {
      self.connecting.push(socket);
    }
  }

  return socket;
};

/**
 * Called upon a socket close.
 *
 * @param {Socket} socket
 */

Manager.prototype.destroy = function (socket) {
  var index = indexOf(this.connecting, socket);
  if (~index) this.connecting.splice(index, 1);
  if (this.connecting.length) return;

  this.close();
};

/**
 * Writes a packet.
 *
 * @param {Object} packet
 * @api private
 */

Manager.prototype.packet = function (packet) {
  debug('writing packet %j', packet);
  var self = this;
  if (packet.query && packet.type === 0) packet.nsp += '?' + packet.query;

  if (!self.encoding) {
    // encode, then write to engine with result
    self.encoding = true;
    this.encoder.encode(packet, function (encodedPackets) {
      for (var i = 0; i < encodedPackets.length; i++) {
        self.engine.write(encodedPackets[i], packet.options);
      }
      self.encoding = false;
      self.processPacketQueue();
    });
  } else { // add packet to the queue
    self.packetBuffer.push(packet);
  }
};

/**
 * If packet buffer is non-empty, begins encoding the
 * next packet in line.
 *
 * @api private
 */

Manager.prototype.processPacketQueue = function () {
  if (this.packetBuffer.length > 0 && !this.encoding) {
    var pack = this.packetBuffer.shift();
    this.packet(pack);
  }
};

/**
 * Clean up transport subscriptions and packet buffer.
 *
 * @api private
 */

Manager.prototype.cleanup = function () {
  debug('cleanup');

  var subsLength = this.subs.length;
  for (var i = 0; i < subsLength; i++) {
    var sub = this.subs.shift();
    sub.destroy();
  }

  this.packetBuffer = [];
  this.encoding = false;
  this.lastPing = null;

  this.decoder.destroy();
};

/**
 * Close the current socket.
 *
 * @api private
 */

Manager.prototype.close =
Manager.prototype.disconnect = function () {
  debug('disconnect');
  this.skipReconnect = true;
  this.reconnecting = false;
  if ('opening' === this.readyState) {
    // `onclose` will not fire because
    // an open event never happened
    this.cleanup();
  }
  this.backoff.reset();
  this.readyState = 'closed';
  if (this.engine) this.engine.close();
};

/**
 * Called upon engine close.
 *
 * @api private
 */

Manager.prototype.onclose = function (reason) {
  debug('onclose');

  this.cleanup();
  this.backoff.reset();
  this.readyState = 'closed';
  this.emit('close', reason);

  if (this._reconnection && !this.skipReconnect) {
    this.reconnect();
  }
};

/**
 * Attempt a reconnection.
 *
 * @api private
 */

Manager.prototype.reconnect = function () {
  if (this.reconnecting || this.skipReconnect) return this;

  var self = this;

  if (this.backoff.attempts >= this._reconnectionAttempts) {
    debug('reconnect failed');
    this.backoff.reset();
    this.emitAll('reconnect_failed');
    this.reconnecting = false;
  } else {
    var delay = this.backoff.duration();
    debug('will wait %dms before reconnect attempt', delay);

    this.reconnecting = true;
    var timer = setTimeout(function () {
      if (self.skipReconnect) return;

      debug('attempting reconnect');
      self.emitAll('reconnect_attempt', self.backoff.attempts);
      self.emitAll('reconnecting', self.backoff.attempts);

      // check again for the case socket closed in above events
      if (self.skipReconnect) return;

      self.open(function (err) {
        if (err) {
          debug('reconnect attempt error');
          self.reconnecting = false;
          self.reconnect();
          self.emitAll('reconnect_error', err.data);
        } else {
          debug('reconnect success');
          self.onreconnect();
        }
      });
    }, delay);

    this.subs.push({
      destroy: function () {
        clearTimeout(timer);
      }
    });
  }
};

/**
 * Called upon successful reconnect.
 *
 * @api private
 */

Manager.prototype.onreconnect = function () {
  var attempt = this.backoff.attempts;
  this.reconnecting = false;
  this.backoff.reset();
  this.updateSocketIds();
  this.emitAll('reconnect', attempt);
};


/***/ },
/* 193 */
/***/ function(module, exports) {


/**
 * Module exports.
 */

module.exports = on;

/**
 * Helper for subscriptions.
 *
 * @param {Object|EventEmitter} obj with `Emitter` mixin or `EventEmitter`
 * @param {String} event name
 * @param {Function} callback
 * @api public
 */

function on (obj, ev, fn) {
  obj.on(ev, fn);
  return {
    destroy: function () {
      obj.removeListener(ev, fn);
    }
  };
}


/***/ },
/* 194 */
/***/ function(module, exports, __webpack_require__) {


/**
 * Module dependencies.
 */

var parser = __webpack_require__(40);
var Emitter = __webpack_require__(17);
var toArray = __webpack_require__(362);
var on = __webpack_require__(193);
var bind = __webpack_require__(60);
var debug = __webpack_require__(27)('socket.io-client:socket');
var hasBin = __webpack_require__(64);

/**
 * Module exports.
 */

module.exports = exports = Socket;

/**
 * Internal events (blacklisted).
 * These events can't be emitted by the user.
 *
 * @api private
 */

var events = {
  connect: 1,
  connect_error: 1,
  connect_timeout: 1,
  connecting: 1,
  disconnect: 1,
  error: 1,
  reconnect: 1,
  reconnect_attempt: 1,
  reconnect_failed: 1,
  reconnect_error: 1,
  reconnecting: 1,
  ping: 1,
  pong: 1
};

/**
 * Shortcut to `Emitter#emit`.
 */

var emit = Emitter.prototype.emit;

/**
 * `Socket` constructor.
 *
 * @api public
 */

function Socket (io, nsp, opts) {
  this.io = io;
  this.nsp = nsp;
  this.json = this; // compat
  this.ids = 0;
  this.acks = {};
  this.receiveBuffer = [];
  this.sendBuffer = [];
  this.connected = false;
  this.disconnected = true;
  if (opts && opts.query) {
    this.query = opts.query;
  }
  if (this.io.autoConnect) this.open();
}

/**
 * Mix in `Emitter`.
 */

Emitter(Socket.prototype);

/**
 * Subscribe to open, close and packet events
 *
 * @api private
 */

Socket.prototype.subEvents = function () {
  if (this.subs) return;

  var io = this.io;
  this.subs = [
    on(io, 'open', bind(this, 'onopen')),
    on(io, 'packet', bind(this, 'onpacket')),
    on(io, 'close', bind(this, 'onclose'))
  ];
};

/**
 * "Opens" the socket.
 *
 * @api public
 */

Socket.prototype.open =
Socket.prototype.connect = function () {
  if (this.connected) return this;

  this.subEvents();
  this.io.open(); // ensure open
  if ('open' === this.io.readyState) this.onopen();
  this.emit('connecting');
  return this;
};

/**
 * Sends a `message` event.
 *
 * @return {Socket} self
 * @api public
 */

Socket.prototype.send = function () {
  var args = toArray(arguments);
  args.unshift('message');
  this.emit.apply(this, args);
  return this;
};

/**
 * Override `emit`.
 * If the event is in `events`, it's emitted normally.
 *
 * @param {String} event name
 * @return {Socket} self
 * @api public
 */

Socket.prototype.emit = function (ev) {
  if (events.hasOwnProperty(ev)) {
    emit.apply(this, arguments);
    return this;
  }

  var args = toArray(arguments);
  var parserType = parser.EVENT; // default
  if (hasBin(args)) { parserType = parser.BINARY_EVENT; } // binary
  var packet = { type: parserType, data: args };

  packet.options = {};
  packet.options.compress = !this.flags || false !== this.flags.compress;

  // event ack callback
  if ('function' === typeof args[args.length - 1]) {
    debug('emitting packet with ack id %d', this.ids);
    this.acks[this.ids] = args.pop();
    packet.id = this.ids++;
  }

  if (this.connected) {
    this.packet(packet);
  } else {
    this.sendBuffer.push(packet);
  }

  delete this.flags;

  return this;
};

/**
 * Sends a packet.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.packet = function (packet) {
  packet.nsp = this.nsp;
  this.io.packet(packet);
};

/**
 * Called upon engine `open`.
 *
 * @api private
 */

Socket.prototype.onopen = function () {
  debug('transport is open - connecting');

  // write connect packet if necessary
  if ('/' !== this.nsp) {
    if (this.query) {
      this.packet({type: parser.CONNECT, query: this.query});
    } else {
      this.packet({type: parser.CONNECT});
    }
  }
};

/**
 * Called upon engine `close`.
 *
 * @param {String} reason
 * @api private
 */

Socket.prototype.onclose = function (reason) {
  debug('close (%s)', reason);
  this.connected = false;
  this.disconnected = true;
  delete this.id;
  this.emit('disconnect', reason);
};

/**
 * Called with socket packet.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onpacket = function (packet) {
  if (packet.nsp !== this.nsp) return;

  switch (packet.type) {
    case parser.CONNECT:
      this.onconnect();
      break;

    case parser.EVENT:
      this.onevent(packet);
      break;

    case parser.BINARY_EVENT:
      this.onevent(packet);
      break;

    case parser.ACK:
      this.onack(packet);
      break;

    case parser.BINARY_ACK:
      this.onack(packet);
      break;

    case parser.DISCONNECT:
      this.ondisconnect();
      break;

    case parser.ERROR:
      this.emit('error', packet.data);
      break;
  }
};

/**
 * Called upon a server event.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onevent = function (packet) {
  var args = packet.data || [];
  debug('emitting event %j', args);

  if (null != packet.id) {
    debug('attaching ack callback to event');
    args.push(this.ack(packet.id));
  }

  if (this.connected) {
    emit.apply(this, args);
  } else {
    this.receiveBuffer.push(args);
  }
};

/**
 * Produces an ack callback to emit with an event.
 *
 * @api private
 */

Socket.prototype.ack = function (id) {
  var self = this;
  var sent = false;
  return function () {
    // prevent double callbacks
    if (sent) return;
    sent = true;
    var args = toArray(arguments);
    debug('sending ack %j', args);

    var type = hasBin(args) ? parser.BINARY_ACK : parser.ACK;
    self.packet({
      type: type,
      id: id,
      data: args
    });
  };
};

/**
 * Called upon a server acknowlegement.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onack = function (packet) {
  var ack = this.acks[packet.id];
  if ('function' === typeof ack) {
    debug('calling ack %s with %j', packet.id, packet.data);
    ack.apply(this, packet.data);
    delete this.acks[packet.id];
  } else {
    debug('bad ack %s', packet.id);
  }
};

/**
 * Called upon server connect.
 *
 * @api private
 */

Socket.prototype.onconnect = function () {
  this.connected = true;
  this.disconnected = false;
  this.emit('connect');
  this.emitBuffered();
};

/**
 * Emit buffered events (received and emitted).
 *
 * @api private
 */

Socket.prototype.emitBuffered = function () {
  var i;
  for (i = 0; i < this.receiveBuffer.length; i++) {
    emit.apply(this, this.receiveBuffer[i]);
  }
  this.receiveBuffer = [];

  for (i = 0; i < this.sendBuffer.length; i++) {
    this.packet(this.sendBuffer[i]);
  }
  this.sendBuffer = [];
};

/**
 * Called upon server disconnect.
 *
 * @api private
 */

Socket.prototype.ondisconnect = function () {
  debug('server disconnect (%s)', this.nsp);
  this.destroy();
  this.onclose('io server disconnect');
};

/**
 * Called upon forced client/server side disconnections,
 * this method ensures the manager stops tracking us and
 * that reconnections don't get triggered for this.
 *
 * @api private.
 */

Socket.prototype.destroy = function () {
  if (this.subs) {
    // clean subscriptions to avoid reconnections
    for (var i = 0; i < this.subs.length; i++) {
      this.subs[i].destroy();
    }
    this.subs = null;
  }

  this.io.destroy(this);
};

/**
 * Disconnects the socket manually.
 *
 * @return {Socket} self
 * @api public
 */

Socket.prototype.close =
Socket.prototype.disconnect = function () {
  if (this.connected) {
    debug('performing disconnect (%s)', this.nsp);
    this.packet({ type: parser.DISCONNECT });
  }

  // remove socket from pool
  this.destroy();

  if (this.connected) {
    // fire events
    this.onclose('io client disconnect');
  }
  return this;
};

/**
 * Sets the compress flag.
 *
 * @param {Boolean} if `true`, compresses the sending data
 * @return {Socket} self
 * @api public
 */

Socket.prototype.compress = function (compress) {
  this.flags = this.flags || {};
  this.flags.compress = compress;
  return this;
};


/***/ },
/* 195 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {
module.exports = isBuf;

/**
 * Returns true if obj is a buffer or an arraybuffer.
 *
 * @api private
 */

function isBuf(obj) {
  return (global.Buffer && global.Buffer.isBuffer(obj)) ||
         (global.ArrayBuffer && obj instanceof ArrayBuffer);
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 196 */,
/* 197 */,
/* 198 */,
/* 199 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


var alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split('')
  , length = 64
  , map = {}
  , seed = 0
  , i = 0
  , prev;

/**
 * Return a string representing the specified number.
 *
 * @param {Number} num The number to convert.
 * @returns {String} The string representation of the number.
 * @api public
 */
function encode(num) {
  var encoded = '';

  do {
    encoded = alphabet[num % length] + encoded;
    num = Math.floor(num / length);
  } while (num > 0);

  return encoded;
}

/**
 * Return the integer value specified by the given string.
 *
 * @param {String} str The string to convert.
 * @returns {Number} The integer value represented by the string.
 * @api public
 */
function decode(str) {
  var decoded = 0;

  for (i = 0; i < str.length; i++) {
    decoded = decoded * length + map[str.charAt(i)];
  }

  return decoded;
}

/**
 * Yeast: A tiny growing id generator.
 *
 * @returns {String} A unique id.
 * @api public
 */
function yeast() {
  var now = encode(+new Date());

  if (now !== prev) return seed = 0, prev = now;
  return now +'.'+ encode(seed++);
}

//
// Map each character to its index.
//
for (; i < length; i++) map[alphabet[i]] = i;

//
// Expose the `yeast`, `encode` and `decode` functions.
//
yeast.encode = encode;
yeast.decode = decode;
module.exports = yeast;


/***/ },
/* 200 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


var _vue = __webpack_require__(2);

var _vue2 = _interopRequireDefault(_vue);

var _axios = __webpack_require__(13);

var _axios2 = _interopRequireDefault(_axios);

var _filters = __webpack_require__(233);

var _filters2 = _interopRequireDefault(_filters);

var _i18next = __webpack_require__(234);

var _i18next2 = _interopRequireDefault(_i18next);

var _vueFormGenerator = __webpack_require__(14);

var _vueFormGenerator2 = _interopRequireDefault(_vueFormGenerator);

var _vueWebsocket = __webpack_require__(46);

var _vueWebsocket2 = _interopRequireDefault(_vueWebsocket);

var _store = __webpack_require__(236);

var _store2 = _interopRequireDefault(_store);

var _App = __webpack_require__(364);

var _App2 = _interopRequireDefault(_App);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

__webpack_require__(286);

_axios2.default.defaults.headers.post["Content-Type"] = "application/json";

_vue2.default.use(_filters2.default);

_vue2.default.use(_vueFormGenerator2.default);
_vue2.default.use(_vueWebsocket2.default);

_vue2.default.use(_i18next2.default, function (i18next) {
	var router = __webpack_require__(235).default;

	new _vue2.default({
		el: "#app",
		components: {
			App: _App2.default
		},
		router: router,
		store: _store2.default,
		render: function render(h) {
			return h("app");
		}
	});
});

/***/ },
/* 201 */,
/* 202 */,
/* 203 */
/***/ function(module, exports) {

module.exports = after

function after(count, callback, err_cb) {
    var bail = false
    err_cb = err_cb || noop
    proxy.count = count

    return (count === 0) ? callback() : proxy

    function proxy(err, result) {
        if (proxy.count <= 0) {
            throw new Error('after called too many times')
        }
        --proxy.count

        // after first error, rest are passed to err_cb
        if (err) {
            bail = true
            callback(err)
            // future error callbacks will go to error handler
            callback = err_cb
        } else if (proxy.count === 0 && !bail) {
            callback(null, result)
        }
    }
}

function noop() {}


/***/ },
/* 204 */,
/* 205 */,
/* 206 */,
/* 207 */,
/* 208 */,
/* 209 */,
/* 210 */,
/* 211 */,
/* 212 */,
/* 213 */,
/* 214 */,
/* 215 */
/***/ function(module, exports) {

/**
 * An abstraction for slicing an arraybuffer even when
 * ArrayBuffer.prototype.slice is not supported
 *
 * @api public
 */

module.exports = function(arraybuffer, start, end) {
  var bytes = arraybuffer.byteLength;
  start = start || 0;
  end = end || bytes;

  if (arraybuffer.slice) { return arraybuffer.slice(start, end); }

  if (start < 0) { start += bytes; }
  if (end < 0) { end += bytes; }
  if (end > bytes) { end = bytes; }

  if (start >= bytes || start >= end || bytes === 0) {
    return new ArrayBuffer(0);
  }

  var abv = new Uint8Array(arraybuffer);
  var result = new Uint8Array(end - start);
  for (var i = start, ii = 0; i < end; i++, ii++) {
    result[ii] = abv[i];
  }
  return result.buffer;
};


/***/ },
/* 216 */,
/* 217 */,
/* 218 */,
/* 219 */,
/* 220 */,
/* 221 */,
/* 222 */,
/* 223 */,
/* 224 */,
/* 225 */,
/* 226 */,
/* 227 */,
/* 228 */,
/* 229 */,
/* 230 */,
/* 231 */,
/* 232 */,
/* 233 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _moment = __webpack_require__(0);

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var filters = {
	prettyJSON: function prettyJSON(json) {
		if (json) {
			json = JSON.stringify(json, undefined, 4);
			json = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
			return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
				var cls = "number";
				if (/^"/.test(match)) {
					if (/:$/.test(match)) {
						cls = "key";
					} else {
						cls = "string";
					}
				} else if (/true|false/.test(match)) {
					cls = "boolean";
				} else if (/null/.test(match)) {
					cls = "null";
				}
				return "<span class=\"" + cls + "\">" + match + "</span>";
			});
		}
	},
	ago: function ago(time) {
		return (0, _moment2.default)(time).fromNow();
	},
	truncate: function truncate(text, length) {
		if (text && text.length > length) return text.substr(0, length - 1) + "…";
		return text;
	}
};

exports.default = {
	filters: filters,

	install: function install(Vue) {
		var keys = Object.keys(filters);
		keys.forEach(function (name) {
			return Vue.filter(name, filters[name]);
		});
	}
};

/***/ },
/* 234 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _vue = __webpack_require__(2);

var _vue2 = _interopRequireDefault(_vue);

var _lodash = __webpack_require__(9);

var _i18next = __webpack_require__(44);

var _i18next2 = _interopRequireDefault(_i18next);

var _i18nextBrowserLanguagedetector = __webpack_require__(316);

var _i18nextBrowserLanguagedetector2 = _interopRequireDefault(_i18nextBrowserLanguagedetector);

var _i18nextXhrBackend = __webpack_require__(320);

var _i18nextXhrBackend2 = _interopRequireDefault(_i18nextXhrBackend);

var _moment = __webpack_require__(0);

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function install(Vue, callback) {
	var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


	_i18next2.default.use(_i18nextXhrBackend2.default).use(_i18nextBrowserLanguagedetector2.default).init((0, _lodash.defaultsDeep)({}, {
		fallbackLng: "en",
		whitelist: ["en", "hu"],
		ns: ["app"],
		defaultNS: "app",
		load: "languageOnly",
		saveMissing: true,
		saveMissingTo: "all",

		backend: {
			loadPath: "/locales/resources.json?lng={{lng}}&ns={{ns}}",

			addPath: "/locales/add/{{lng}}/{{ns}}",

			allowMultiLoading: true,

			crossDomain: false
		},

		detection: {
			order: ["querystring", "cookie", "htmlTag", "navigator"]
		}

	}), function (err, t) {
		Vue.prototype.$lng = _i18next2.default.language;
		Vue.prototype._ = function (key, opts) {
			return t(key, opts);
		};

		_moment2.default.locale(_i18next2.default.language);

		console.log("I18Next initialized! Language: " + _i18next2.default.language);

		if ((0, _lodash.isFunction)(callback)) callback(_i18next2.default, t);
	});

	Vue.filter("i18n", function (value, options) {
		return _i18next2.default.t(value, options);
	});

	Vue.directive("i18n", {
		bind: function bind(el, binding, vnode) {
			el.innerHTML = _i18next2.default.t(binding.expression);
		}
	});

	Vue.prototype.$i18n = _i18next2.default;
	Vue.prototype._ = function (key, opts) {
		return _i18next2.default.t(key, opts);
	};
}

exports.default = {
	install: install
};

/***/ },
/* 235 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _vue = __webpack_require__(2);

var _vue2 = _interopRequireDefault(_vue);

var _vueRouter = __webpack_require__(45);

var _vueRouter2 = _interopRequireDefault(_vueRouter);

var _home = __webpack_require__(377);

var _home2 = _interopRequireDefault(_home);

var _counter = __webpack_require__(375);

var _counter2 = _interopRequireDefault(_counter);

var _devices = __webpack_require__(376);

var _devices2 = _interopRequireDefault(_devices);

var _posts = __webpack_require__(378);

var _posts2 = _interopRequireDefault(_posts);

var _profile = __webpack_require__(379);

var _profile2 = _interopRequireDefault(_profile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_vue2.default.use(_vueRouter2.default);

exports.default = new _vueRouter2.default({
	mode: "hash",
	routes: [{ path: "/", component: _home2.default }, { path: "/devices", component: _devices2.default }, { path: "/posts", component: _posts2.default }, { path: "/counter", component: _counter2.default }, { path: "/profile", component: _profile2.default }]
});

/***/ },
/* 236 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _vue = __webpack_require__(2);

var _vue2 = _interopRequireDefault(_vue);

var _vuex = __webpack_require__(5);

var _vuex2 = _interopRequireDefault(_vuex);

var _store = __webpack_require__(253);

var _store2 = _interopRequireDefault(_store);

var _store3 = __webpack_require__(243);

var _store4 = _interopRequireDefault(_store3);

var _store5 = __webpack_require__(247);

var _store6 = _interopRequireDefault(_store5);

var _store7 = __webpack_require__(239);

var _store8 = _interopRequireDefault(_store7);

var _store9 = __webpack_require__(250);

var _store10 = _interopRequireDefault(_store9);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_vue2.default.use(_vuex2.default);

exports.default = new _vuex2.default.Store({
	modules: {
		session: _store2.default,
		counter: _store8.default,
		devices: _store4.default,
		posts: _store6.default,
		profile: _store10.default
	}
});

/***/ },
/* 237 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.changedValue = exports.decrement = exports.increment = exports.getValue = undefined;

var _vue = __webpack_require__(2);

var _vue2 = _interopRequireDefault(_vue);

var _service = __webpack_require__(11);

var _service2 = _interopRequireDefault(_service);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var service = new _service2.default("counter", undefined);

var getValue = exports.getValue = function getValue(ctx) {
	service.emit("find").then(function (data) {
		console.log("Counter current value: ", data);
		ctx.commit("CHANGED_VALUE", data);
	});
};

var increment = exports.increment = function increment(_ref) {
	var commit = _ref.commit;

	service.emit("increment").then(function (newValue) {
		commit("CHANGED_VALUE", newValue);
	});
};

var decrement = exports.decrement = function decrement(_ref2) {
	var commit = _ref2.commit;

	service.emit("decrement").then(function (newValue) {
		commit("CHANGED_VALUE", newValue);
	});
};

var changedValue = exports.changedValue = function changedValue(_ref3, newValue) {
	var commit = _ref3.commit;

	commit("CHANGED_VALUE", newValue);
};

/***/ },
/* 238 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.count = count;
function count(state) {
	return state.count;
}

/***/ },
/* 239 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _getters = __webpack_require__(238);

var getters = _interopRequireWildcard(_getters);

var _actions = __webpack_require__(237);

var actions = _interopRequireWildcard(_actions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var state = {
	count: 0
};

var mutations = _defineProperty({}, "CHANGED_VALUE", function CHANGED_VALUE(state, newValue) {
	state.count = newValue;
});

exports.default = {
	namespaced: true,
	state: state,
	getters: getters,
	actions: actions,
	mutations: mutations
};

/***/ },
/* 240 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


var _vue = __webpack_require__(2);

var _vue2 = _interopRequireDefault(_vue);

var _moment = __webpack_require__(0);

var _moment2 = _interopRequireDefault(_moment);

var _types = __webpack_require__(244);

var _vueFormGenerator = __webpack_require__(14);

var _lodash = __webpack_require__(9);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ = _vue2.default.prototype._;

module.exports = {

	id: "devices",
	title: _("Devices"),

	table: {
		multiSelect: true,
		columns: [{
			title: _("ID"),
			field: "code",
			align: "left",
			formatter: function formatter(value, model) {
				return model ? model.code : "";
			}
		}, {
			title: _("Type"),
			field: "type",
			formatter: function formatter(value) {
				var type = (0, _lodash.find)(_types.deviceTypes, function (type) {
					return type.id == value;
				});
				return type ? type.name : value;
			}
		}, {
			title: _("Address"),
			field: "address"
		}, {
			title: _("Name"),
			field: "name"
		}, {
			title: _("Status"),
			field: "status",
			formatter: function formatter(value, model, col) {
				return value ? "<i class='fa fa-check'/>" : "<i class='fa fa-ban'/>";
			},

			align: "center"
		}, {
			title: _("LastCommunication"),
			field: "lastCommunication",
			formatter: function formatter(value) {
				return (0, _moment2.default)(value).fromNow();
			}
		}],

		rowClasses: function rowClasses(model) {
			return {
				inactive: !model.status
			};
		}

	},

	form: {
		fields: [{
			type: "text",
			label: _("ID"),
			model: "code",
			readonly: true,
			disabled: true,
			multi: false,
			get: function get(model) {
				if (model.code) return model.code;else return _("willBeGenerated");
			}
		}, {
			type: "select",
			label: _("Type"),
			model: "type",
			required: true,
			values: _types.deviceTypes,
			default: "rasperry",
			validator: _vueFormGenerator.validators.required

		}, {
			type: "text",
			label: _("Name"),
			model: "name",
			featured: true,
			required: true,
			placeholder: _("DeviceName"),
			validator: _vueFormGenerator.validators.string
		}, {
			type: "text",
			label: _("Description"),
			model: "description",
			featured: false,
			required: false,
			validator: _vueFormGenerator.validators.string
		}, {
			type: "text",
			label: _("Address"),
			model: "address",
			placeholder: _("AddressOfDevice"),
			validator: _vueFormGenerator.validators.string
		}, {
			type: "label",
			label: _("LastCommunication"),
			model: "lastCommunication",
			get: function get(model) {
				return model && model.lastCommunication ? (0, _moment2.default)(model.lastCommunication).fromNow() : "-";
			}
		}, {
			type: "switch",
			label: _("Status"),
			model: "status",
			multi: true,
			default: 1,
			textOn: _("Active"),
			textOff: _("Inactive"),
			valueOn: 1,
			valueOff: 0
		}]
	},

	options: {
		searchable: true,

		enableNewButton: true,
		enabledSaveButton: true,
		enableDeleteButton: true,
		enableCloneButton: false,

		validateAfterLoad: false,
		validateAfterChanged: false,
		validateBeforeSave: true },

	events: {
		onSelect: null,
		onNewItem: null,
		onCloneItem: null,
		onSaveItem: null,
		onDeleteItem: null,
		onChangeItem: null,
		onValidated: function onValidated(model, errors, schema) {
			if (errors.length > 0) console.warn("Validation error in page! Errors:", errors, ", Model:", model);
		}
	},

	resources: {
		addCaption: _("AddNewDevice"),
		saveCaption: _("Save"),
		cloneCaption: _("Clone"),
		deleteCaption: _("Delete")
	}

};

/***/ },
/* 241 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.removed = exports.removeRow = exports.updated = exports.updateRow = exports.created = exports.saveRow = exports.downloadRows = exports.clearSelection = exports.selectRow = exports.NAMESPACE = undefined;

var _vue = __webpack_require__(2);

var _vue2 = _interopRequireDefault(_vue);

var _toastr = __webpack_require__(16);

var _toastr2 = _interopRequireDefault(_toastr);

var _types = __webpack_require__(57);

var _axios = __webpack_require__(13);

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NAMESPACE = exports.NAMESPACE = "/api/devices";

var selectRow = exports.selectRow = function selectRow(_ref, row, multiSelect) {
	var commit = _ref.commit;

	commit(_types.SELECT, row, multiSelect);
};

var clearSelection = exports.clearSelection = function clearSelection(_ref2) {
	var commit = _ref2.commit;

	commit(_types.CLEAR_SELECT);
};

var downloadRows = exports.downloadRows = function downloadRows(_ref3) {
	var commit = _ref3.commit;

	_axios2.default.get(NAMESPACE).then(function (response) {
		var res = response.data;
		if (res.status == 200 && res.data) commit(_types.LOAD, res.data);else console.error("Request error!", res.error);
	}).catch(function (response) {
		console.error("Request error!", response.statusText);
	});
};

var saveRow = exports.saveRow = function saveRow(_ref4, model) {
	var commit = _ref4.commit;

	_axios2.default.post(NAMESPACE, model).then(function (response) {
		var res = response.data;

		if (res.status == 200 && res.data) created({ commit: commit }, res.data, true);
	}).catch(function (response) {
		if (response.data.error) _toastr2.default.error(response.data.error.message);
	});
};

var created = exports.created = function created(_ref5, row, needSelect) {
	var commit = _ref5.commit;

	commit(_types.ADD, row);
	if (needSelect) commit(_types.SELECT, row, false);
};

var updateRow = exports.updateRow = function updateRow(_ref6, row) {
	var commit = _ref6.commit;

	_axios2.default.put(NAMESPACE + "/" + row.code, row).then(function (response) {
		var res = response.data;
		if (res.data) commit(_types.UPDATE, res.data);
	}).catch(function (response) {
		if (response.data.error) _toastr2.default.error(response.data.error.message);
	});
};

var updated = exports.updated = function updated(_ref7, row) {
	var commit = _ref7.commit;

	commit(_types.UPDATE, row);
};

var removeRow = exports.removeRow = function removeRow(_ref8, row) {
	var commit = _ref8.commit;

	_axios2.default.delete(NAMESPACE + "/" + row.code).then(function (response) {
		commit(_types.REMOVE, row);
	}).catch(function (response) {
		if (response.data.error) _toastr2.default.error(response.data.error.message);
	});
};

var removed = exports.removed = function removed(_ref9, row) {
	var commit = _ref9.commit;

	commit(_types.REMOVE, row);
};

/***/ },
/* 242 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.devices = devices;
exports.selected = selected;
function devices(state) {
	return state.rows;
}

function selected(state) {
	return state.selected;
}

/***/ },
/* 243 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _mutations;

var _types = __webpack_require__(57);

var _lodash = __webpack_require__(9);

var _getters = __webpack_require__(242);

var getters = _interopRequireWildcard(_getters);

var _actions = __webpack_require__(241);

var actions = _interopRequireWildcard(_actions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var state = {
	rows: [],
	selected: []
};

var mutations = (_mutations = {}, _defineProperty(_mutations, _types.LOAD, function (state, models) {
	var _state$rows;

	state.rows.splice(0);
	(_state$rows = state.rows).push.apply(_state$rows, _toConsumableArray(models));
}), _defineProperty(_mutations, _types.ADD, function (state, model) {
	var found = (0, _lodash.find)(state.rows, function (item) {
		return item.code == model.code;
	});
	if (!found) state.rows.push(model);
}), _defineProperty(_mutations, _types.SELECT, function (state, row, multiSelect) {
	if ((0, _lodash.isArray)(row)) {
		var _state$selected;

		state.selected.splice(0);
		(_state$selected = state.selected).push.apply(_state$selected, _toConsumableArray(row));
	} else {
		if (multiSelect === true) {
			if (state.selected.indexOf(row) != -1) state.selected = state.selected.filter(function (item) {
				return item != row;
			});else state.selected.push(row);
		} else {
			state.selected.splice(0);
			state.selected.push(row);
		}
	}
}), _defineProperty(_mutations, _types.CLEAR_SELECT, function (state) {
	state.selected.splice(0);
}), _defineProperty(_mutations, _types.UPDATE, function (state, model) {
	(0, _lodash.each)(state.rows, function (item) {
		if (item.code == model.code) (0, _lodash.assign)(item, model);
	});
}), _defineProperty(_mutations, _types.REMOVE, function (state, model) {
	state.rows = state.rows.filter(function (item) {
		return item.code != model.code;
	});
}), _mutations);

exports.default = {
	namespaced: true,
	state: state,
	getters: getters,
	actions: actions,
	mutations: mutations
};

/***/ },
/* 244 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


module.exports = {

	deviceTypes: [{ id: "rasperry", name: "Raspberry" }, { id: "odroid", name: "ODroid" }, { id: "nanopi", name: "NanoPI" }, { id: "pc", name: "PC" }]

};

/***/ },
/* 245 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.removed = exports.updated = exports.created = exports.unVote = exports.vote = exports.removeRow = exports.updateRow = exports.saveRow = exports.changeViewMode = exports.changeSort = exports.loadMoreRows = exports.getRows = exports.NAMESPACE = undefined;

var _vue = __webpack_require__(2);

var _vue2 = _interopRequireDefault(_vue);

var _toastr = __webpack_require__(16);

var _toastr2 = _interopRequireDefault(_toastr);

var _service = __webpack_require__(11);

var _service2 = _interopRequireDefault(_service);

var _types = __webpack_require__(58);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NAMESPACE = exports.NAMESPACE = "/api/posts";

var service = new _service2.default("posts");

var getRows = exports.getRows = function getRows(_ref, loadMore) {
	var commit = _ref.commit,
	    state = _ref.state;

	commit(_types.FETCHING, true);
	return service.rest("find", { filter: state.viewMode, sort: state.sort, limit: 10, offset: state.offset }).then(function (data) {
		if (data.length == 0) commit(_types.NO_MORE_ITEMS);else commit(loadMore ? _types.LOAD_MORE : _types.LOAD, data);
	}).catch(function (err) {
		_toastr2.default.error(err.message);
	}).then(function () {
		commit(_types.FETCHING, false);
	});
};

var loadMoreRows = exports.loadMoreRows = function loadMoreRows(context) {
	return getRows(context, true);
};

var changeSort = exports.changeSort = function changeSort(store, sort) {
	store.commit(_types.CHANGE_SORT, sort);
	getRows(store);
};

var changeViewMode = exports.changeViewMode = function changeViewMode(store, viewMode) {
	store.commit(_types.CHANGE_VIEWMODE, viewMode);
	getRows(store);
};

var saveRow = exports.saveRow = function saveRow(store, model) {
	service.rest("create", model).then(function (data) {
		created(store, data);
	}).catch(function (err) {
		_toastr2.default.error(err.message);
	});
};

var updateRow = exports.updateRow = function updateRow(store, model) {
	service.rest("update", model).then(function (data) {
		updated(store, data);
	}).catch(function (err) {
		_toastr2.default.error(err.message);
	});
};

var removeRow = exports.removeRow = function removeRow(store, model) {
	service.rest("remove", { code: model.code }).then(function (data) {
		removed(store, data);
	}).catch(function (err) {
		_toastr2.default.error(err.message);
	});
};

var vote = exports.vote = function vote(store, model) {
	service.rest("vote", { code: model.code }).then(function (data) {
		updated(store, data);
	}).catch(function (err) {
		_toastr2.default.error(err.message);
	});
};

var unVote = exports.unVote = function unVote(store, model) {
	service.rest("unvote", { code: model.code }).then(function (data) {
		updated(store, data);
	}).catch(function (err) {
		_toastr2.default.error(err.message);
	});
};

var created = exports.created = function created(_ref2, model) {
	var commit = _ref2.commit;

	commit(_types.ADD, model);
};

var updated = exports.updated = function updated(_ref3, model) {
	var commit = _ref3.commit;

	commit(_types.UPDATE, model);
};

var removed = exports.removed = function removed(_ref4, model) {
	var commit = _ref4.commit;

	commit(_types.REMOVE, model);
};

/***/ },
/* 246 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.posts = posts;
exports.hasMore = hasMore;
exports.fetching = fetching;
exports.sort = sort;
exports.viewMode = viewMode;
function posts(state) {
	return state.rows;
}

function hasMore(state) {
	return state.hasMore;
}

function fetching(state) {
	return state.fetching;
}

function sort(state) {
	return state.sort;
}

function viewMode(state) {
	return state.viewMode;
}

/***/ },
/* 247 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _mutations;

var _types = __webpack_require__(58);

var _lodash = __webpack_require__(9);

var _getters = __webpack_require__(246);

var getters = _interopRequireWildcard(_getters);

var _actions = __webpack_require__(245);

var actions = _interopRequireWildcard(_actions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var state = {
	rows: [],
	offset: 0,
	hasMore: true,
	fetching: false,
	sort: "-votes",
	viewMode: "all"
};

var mutations = (_mutations = {}, _defineProperty(_mutations, _types.LOAD, function (state, models) {
	var _state$rows;

	state.rows.splice(0);
	(_state$rows = state.rows).push.apply(_state$rows, _toConsumableArray(models));
	state.offset = state.rows.length;
}), _defineProperty(_mutations, _types.LOAD_MORE, function (state, models) {
	var _state$rows2;

	(_state$rows2 = state.rows).push.apply(_state$rows2, _toConsumableArray(models));
	state.offset = state.rows.length;
}), _defineProperty(_mutations, _types.CLEAR, function (state) {
	state.offset = 0;
	state.hasMore = true;
}), _defineProperty(_mutations, _types.FETCHING, function (state, status) {
	state.fetching = status;
}), _defineProperty(_mutations, _types.CHANGE_SORT, function (state, sort) {
	state.sort = sort;
	mutations[_types.CLEAR](state);
}), _defineProperty(_mutations, _types.CHANGE_VIEWMODE, function (state, mode) {
	state.viewMode = mode;
	mutations[_types.CLEAR](state);
}), _defineProperty(_mutations, _types.NO_MORE_ITEMS, function (state) {
	state.hasMore = false;
}), _defineProperty(_mutations, _types.ADD, function (state, model) {
	var found = (0, _lodash.find)(state.rows, function (item) {
		return item.code == model.code;
	});
	if (!found) state.rows.unshift(model);
}), _defineProperty(_mutations, _types.UPDATE, function (state, model) {
	(0, _lodash.each)(state.rows, function (item) {
		if (item.code == model.code) {
			(0, _lodash.assign)(item, model);
		}
	});
}), _defineProperty(_mutations, _types.REMOVE, function (state, model) {
	state.rows = state.rows.filter(function (item) {
		return item.code != model.code;
	});
}), _mutations);

exports.default = {
	namespaced: true,
	state: state,
	getters: getters,
	actions: actions,
	mutations: mutations
};

/***/ },
/* 248 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.getProfile = exports.NAMESPACE = undefined;

var _vue = __webpack_require__(2);

var _vue2 = _interopRequireDefault(_vue);

var _toastr = __webpack_require__(16);

var _toastr2 = _interopRequireDefault(_toastr);

var _service = __webpack_require__(11);

var _service2 = _interopRequireDefault(_service);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NAMESPACE = exports.NAMESPACE = "/api/profile";

var service = new _service2.default("profile");

var getProfile = exports.getProfile = function getProfile(_ref) {
	var commit = _ref.commit;

	service.rest("get").then(function (data) {
		commit("UPDATE", data);
	}).catch(function (err) {
		_toastr2.default.error(err.message);
	});
};

/***/ },
/* 249 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.profile = profile;
function profile(state) {
	return state.profile;
}

/***/ },
/* 250 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _getters = __webpack_require__(249);

var getters = _interopRequireWildcard(_getters);

var _actions = __webpack_require__(248);

var actions = _interopRequireWildcard(_actions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var state = {
	profile: {}
};

var mutations = _defineProperty({}, "UPDATE", function UPDATE(state, profile) {
	state.profile = profile;
});

exports.default = {
	namespaced: true,
	state: state,
	getters: getters,
	actions: actions,
	mutations: mutations
};

/***/ },
/* 251 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.searching = exports.addNotification = exports.addMessage = exports.getSessionUser = exports.NAMESPACE = undefined;

var _vue = __webpack_require__(2);

var _vue2 = _interopRequireDefault(_vue);

var _axios = __webpack_require__(13);

var _axios2 = _interopRequireDefault(_axios);

var _types = __webpack_require__(59);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NAMESPACE = exports.NAMESPACE = "/api/session";

var getSessionUser = exports.getSessionUser = function getSessionUser(_ref) {
	var commit = _ref.commit;

	_axios2.default.get(NAMESPACE + "/me").then(function (response) {
		var res = response.data;
		if (res.status == 200) commit(_types.SET_USER, res.data);else console.error("Request error!", res.error);
	}).catch(function (response) {
		console.error("Request error!", response.statusText);
	});
};

var addMessage = exports.addMessage = function addMessage(_ref2, item) {
	var commit = _ref2.commit;

	commit(_types.ADD_MESSAGE, item);
};

var addNotification = exports.addNotification = function addNotification(_ref3, item) {
	var commit = _ref3.commit;

	commit(_types.ADD_NOTIFICATION, item);
};

var searching = exports.searching = function searching(_ref4, text) {
	var commit = _ref4.commit;

	commit(_types.SEARCH, text);
};

/***/ },
/* 252 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.me = me;
exports.notifications = notifications;
exports.messages = messages;
exports.searchText = searchText;
function me(state) {
	return state.user;
}

function notifications(state) {
	return state.notifications;
}

function messages(state) {
	return state.messages;
}

function searchText(state) {
	return state.searchText;
}

/***/ },
/* 253 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _mutations;

var _types = __webpack_require__(59);

var _getters = __webpack_require__(252);

var getters = _interopRequireWildcard(_getters);

var _actions = __webpack_require__(251);

var actions = _interopRequireWildcard(_actions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var state = {
	user: null,
	notifications: [{ id: 1, text: "Something happened!", time: 1, user: null }],
	messages: [],
	searchText: ""
};

var mutations = (_mutations = {}, _defineProperty(_mutations, _types.ADD_MESSAGE, function (state, item) {
	state.messages.splice(0);
	state.messages.push(item);
}), _defineProperty(_mutations, _types.ADD_NOTIFICATION, function (state, item) {
	state.notifications.splice(0);
	state.notifications.push(item);
}), _defineProperty(_mutations, _types.SET_USER, function (state, user) {
	state.user = user;
}), _defineProperty(_mutations, _types.SEARCH, function (state, text) {
	state.searchText = text;
}), _mutations);

exports.default = {
	namespaced: true,
	state: state,
	getters: getters,
	actions: actions,
	mutations: mutations
};

/***/ },
/* 254 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _vue = __webpack_require__(2);

var _vue2 = _interopRequireDefault(_vue);

var _index = __webpack_require__(369);

var _index2 = _interopRequireDefault(_index);

var _index3 = __webpack_require__(373);

var _index4 = _interopRequireDefault(_index3);

var _service = __webpack_require__(11);

var _service2 = _interopRequireDefault(_service);

var _vuex = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
	components: {
		PageHeader: _index2.default,
		Sidebar: _index4.default
	},

	data: function data() {
		return {
			wsReconnecting: false,
			miniSidebar: false
		};
	},


	watch: {
		$lng: function $lng() {
			console.log("Language updated");
			this.update(this);
		}
	},

	socket: {

		events: {
			connect: function connect() {
				console.log("Websocket connected to " + this.$socket.nsp);

				if (this.wsReconnecting) window.location.reload(true);else this.$socket.emit("welcome", "Hello! " + navigator.userAgent);
			},
			disconnect: function disconnect() {
				console.log("Websocket disconnected from " + this.$socket.nsp);
				this.wsReconnecting = true;
			},
			error: function error(err) {
				console.error("Websocket error!", err);
			}
		}
	},

	methods: _extends({}, (0, _vuex.mapActions)("session", ["getSessionUser"]), {

		update: function update(vm) {
			if (vm == null) return;

			var i = vm._watchers.length;
			while (i--) {
				vm._watchers[i].update(true);
			}var children = vm.$children;
			i = children.length;
			while (i--) {
				this.update(children[i]);
			}
		},

		toggleSidebar: function toggleSidebar() {
			this.miniSidebar = !this.miniSidebar;
		}
	}),

	created: function created() {
		console.log("App started!");
		window.app = this;

		this.getSessionUser();

		window.postService = new _service2.default("posts", this);
		window.counterService = new _service2.default("counter", this);
		window.deviceService = new _service2.default("device", this);
	}
};

/***/ },
/* 255 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _vue = __webpack_require__(2);

var _vue2 = _interopRequireDefault(_vue);

var _vueFormGenerator = __webpack_require__(14);

var _dataTable = __webpack_require__(374);

var _dataTable2 = _interopRequireDefault(_dataTable);

var _lodash = __webpack_require__(9);

var _vuex = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

	components: {
		DataTable: _dataTable2.default
	},

	props: ["schema", "selected", "rows"],

	data: function data() {
		return {
			order: {
				field: "id",
				direction: 1
			},

			model: null,
			isNewModel: false
		};
	},


	computed: _extends({}, (0, _vuex.mapGetters)("session", {
		search: "searchText"
	}), {
		options: function options() {
			return this.schema.options || {};
		},
		enabledNew: function enabledNew() {
			return this.options.enableNewButton !== false;
		},
		enabledSave: function enabledSave() {
			return this.model && this.options.enabledSaveButton !== false;
		},
		enabledClone: function enabledClone() {
			return this.model && !this.isNewModel && this.options.enableDeleteButton !== false;
		},
		enabledDelete: function enabledDelete() {
			return this.model && !this.isNewModel && this.options.enableDeleteButton !== false;
		},
		validationErrors: function validationErrors() {
			if (this.$refs.form && this.$refs.form.errors) return this.$refs.form.errors;

			return [];
		}
	}),

	watch: {
		selected: function selected() {
			if (!this.isNewModel) this.generateModel();
		}
	},

	methods: {
		select: function select(event, row, add) {
			this.isNewModel = false;

			if (this.schema.table.multiSelect === true && (add || event && event.ctrlKey)) {
				this.$parent.selectRow(row, true);
			} else {
				this.$parent.selectRow(row, false);
			}
		},
		selectAll: function selectAll(event) {
			this.isNewModel = false;

			var filter = _vue2.default.filter("filterBy");
			var filteredRows = filter(this.rows, this.search);

			if (this.selected.length < filteredRows.length) {
				this.$parent.selectRow(filteredRows, false);
			} else {
				this.$parent.clearSelection();
			}
		},
		generateModel: function generateModel() {
			if (this.selected.length == 1) {
				this.model = (0, _lodash.cloneDeep)(this.selected[0]);
			} else if (this.selected.length > 1) {
				this.model = _vueFormGenerator.schema.mergeMultiObjectFields(this.schema.form, this.selected);
			} else this.model = null;
		},
		newModel: function newModel() {
			console.log("Create new model...");

			this.$parent.clearSelection();

			var newRow = _vueFormGenerator.schema.createDefaultObject(this.schema.form);
			this.isNewModel = true;
			this.model = newRow;

			this.$nextTick(function () {
				var el = document.querySelector("div.form input:nth-child(1):not([readonly]):not(:disabled)");
				if (el) el.focus();
			});
		},
		cloneModel: function cloneModel() {
			console.log("Clone model...");
			var baseModel = this.model;
			this.$parent.clearSelection();

			var newRow = (0, _lodash.cloneDeep)(baseModel);
			newRow.id = null;
			newRow.code = null;
			this.isNewModel = true;
			this.model = newRow;
		},
		saveModel: function saveModel() {
			console.log("Save model...");
			if (this.options.validateBeforeSave === false || this.validate()) {

				if (this.isNewModel) this.$parent.saveRow(this.model);else this.$parent.updateRow(this.model);
			} else {}
		},
		deleteModel: function deleteModel() {
			var _this = this;

			if (this.selected.length > 0) {
				(0, _lodash.each)(this.selected, function (row) {
					return _this.$parent.removeRow(row);
				});
				this.$parent.clearSelection();
			}
		},
		validate: function validate() {
			var res = this.$refs.form.validate();

			if (this.schema.events && (0, _lodash.isFunction)(this.schema.events.onValidated)) {
				this.schema.events.onValidated(this.model, this.$refs.form.errors, this.schema);
			}

			if (!res) {
				this.$nextTick(function () {
					var el = document.querySelector("div.form tr.error input:nth-child(1)");
					if (el) el.focus();
				});
			}

			return res;
		}
	},

	created: function created() {}
};

/***/ },
/* 256 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = {

	props: ["visible"]

};

/***/ },
/* 257 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = {

	props: ["visible"]

};

/***/ },
/* 258 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = {

	props: ["visible"]

};

/***/ },
/* 259 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _logo = __webpack_require__(370);

var _logo2 = _interopRequireDefault(_logo);

var _searchBox = __webpack_require__(371);

var _searchBox2 = _interopRequireDefault(_searchBox);

var _userBox = __webpack_require__(372);

var _userBox2 = _interopRequireDefault(_userBox);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
	components: {
		Logo: _logo2.default,
		SearchBox: _searchBox2.default,
		UserBox: _userBox2.default
	},

	props: ["toggleSidebar"]

};

/***/ },
/* 260 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {};

/***/ },
/* 261 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _vuex = __webpack_require__(5);

exports.default = {
	computed: _extends({}, (0, _vuex.mapGetters)("session", ["searchText"]), {
		text: {
			get: function get() {
				return this.searchText;
			},
			set: function set(value) {
				this.searching(value);
			}
		}
	}),

	methods: _extends({}, (0, _vuex.mapActions)("session", ["searching"]))
};

/***/ },
/* 262 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _user = __webpack_require__(368);

var _user2 = _interopRequireDefault(_user);

var _notifications = __webpack_require__(367);

var _notifications2 = _interopRequireDefault(_notifications);

var _messages = __webpack_require__(366);

var _messages2 = _interopRequireDefault(_messages);

var _vuex = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
	computed: (0, _vuex.mapGetters)("session", ["me", "notifications", "messages"]),

	components: {
		UserDropdown: _user2.default,
		NotificationsDropdown: _notifications2.default,
		MessagesDropdown: _messages2.default
	},

	data: function data() {
		return {
			expandedUserMenu: false,
			expandedNotifications: false,
			expandedMessages: false
		};
	},


	methods: {
		toggleUserMenu: function toggleUserMenu() {
			this.expandedUserMenu = !this.expandedUserMenu;
			if (this.expandedUserMenu) {
				this.expandedMessages = false;
				this.expandedNotifications = false;
			}
		},
		toggleMessages: function toggleMessages() {
			this.expandedMessages = !this.expandedMessages;
			if (this.expandedMessages) {
				this.expandedUserMenu = false;
				this.expandedNotifications = false;
			}
		},
		toggleNotifications: function toggleNotifications() {
			this.expandedNotifications = !this.expandedNotifications;
			if (this.expandedNotifications) {
				this.expandedMessages = false;
				this.expandedUserMenu = false;
			}
		}
	}

};

/***/ },
/* 263 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = {
	props: ["minimized"]
};

/***/ },
/* 264 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _lodash = __webpack_require__(9);

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function searchInObject(obj, text) {
	text = text.toLowerCase();
	var values = Object.values(obj);
	var res = values.filter(function (val) {
		if ((0, _lodash.isObject)(val)) {
			return searchInObject(val, text);
		} else if ((0, _lodash.isArray)(val)) {
			return val.filter(function (item) {
				return searchInObject(item, text);
			});
		} else if ((0, _lodash.isString)(val)) {
			return val.toLowerCase().indexOf(text) != -1;
		}
	});
	return res.length > 0;
}

exports.default = {

	props: ["schema", "rows", "selected", "order", "select", "selectAll", "search"],

	computed: {
		filteredOrderedRows: function filteredOrderedRows() {
			var _this = this;

			var items = this.rows;
			if (this.search) {
				(function () {
					var search = _this.search.toLowerCase();
					items = _this.rows.filter(function (row) {
						return searchInObject(row, search);
					});
				})();
			}

			return (0, _lodash.orderBy)(items, this.order.field, this.order.direction == 1 ? "asc" : "desc");
		}
	},

	methods: {
		getCellValue: function getCellValue(row, col) {
			var value = void 0;
			if (!col.field && (0, _lodash.isFunction)(col.get)) value = col.get(row);else value = (0, _lodash.get)(row, col.field);

			return this.tableFormatter(row, col, value);
		},
		tableFormatter: function tableFormatter(row, col, value) {
			if ((0, _lodash.isNil)(value)) return;
			var formatter = col.formatter;
			if (formatter) {
				if ((0, _lodash.isArray)(formatter)) {
					(0, _lodash.each)(formatter, function (fmt) {
						value = fmt(value, row, col);
					});
				} else if ((0, _lodash.isFunction)(formatter)) value = formatter(value, row, col);
			}

			return value;
		},
		getRowClasses: function getRowClasses(row) {
			var res = {
				selected: this.isSelected(row)
			};

			if ((0, _lodash.isFunction)(this.schema.rowClasses)) res = (0, _lodash.defaults)(this.schema.rowClasses(row), res);

			return res;
		},
		getCellClasses: function getCellClasses(row, col) {
			if (!(0, _lodash.isNil)(col.align)) return _defineProperty({}, "align-" + col.align, true);
		},
		changeSort: function changeSort(col) {
			if (col.field) {
				if (this.order.field == col.field) {
					this.order.direction *= -1;
				} else {
					this.order.field = col.field;
					this.order.direction = 1;
				}
			}
		},
		isSelected: function isSelected(row) {
			return this.selected.indexOf(row) != -1;
		}
	}

};

/***/ },
/* 265 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _vuex = __webpack_require__(5);

var _service = __webpack_require__(11);

var _service2 = _interopRequireDefault(_service);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
	computed: (0, _vuex.mapGetters)("counter", ["count"]),

	methods: _extends({}, (0, _vuex.mapActions)("counter", ["getValue", "increment", "decrement", "changedValue"]), {
		inc: function inc() {
			this.increment();
		},
		dec: function dec() {
			this.decrement();
		}
	}),

	socket: {

		prefix: "/counter/",

		events: {
			changed: function changed(res) {
				console.log("Counter changed to " + res.data + (res.user ? " by " + res.user.fullName : ""));
				this.changedValue(res.data);
			}
		}
	},

	created: function created() {
		this.$service = new _service2.default("counter", this);

		this.getValue();
	}
};

/***/ },
/* 266 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _vue = __webpack_require__(2);

var _vue2 = _interopRequireDefault(_vue);

var _DefaultAdminPage = __webpack_require__(365);

var _DefaultAdminPage2 = _interopRequireDefault(_DefaultAdminPage);

var _schema = __webpack_require__(240);

var _schema2 = _interopRequireDefault(_schema);

var _toastr = __webpack_require__(16);

var _toastr2 = _interopRequireDefault(_toastr);

var _vuex = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

	components: {
		AdminPage: _DefaultAdminPage2.default
	},

	computed: (0, _vuex.mapGetters)("devices", ["devices", "selected"]),

	data: function data() {
		return {
			schema: _schema2.default
		};
	},

	socket: {

		prefix: "/devices/",

		events: {
			created: function created(res) {
				this.created(res.data);
				_toastr2.default.success(this._("DeviceNameAdded", res), this._("DeviceAdded"));
			},
			updated: function updated(res) {
				this.updated(res.data);
				_toastr2.default.success(this._("DeviceNameUpdated", res), this._("DeviceUpdated"));
			},
			removed: function removed(res) {
				this.removed(res.data);
				_toastr2.default.success(this._("DeviceNameDeleted", res), this._("DeviceDeleted"));
			}
		}
	},

	methods: _extends({}, (0, _vuex.mapActions)("devices", ["downloadRows", "created", "updated", "removed", "selectRow", "clearSelection", "saveRow", "updateRow", "removeRow"])),

	created: function created() {
		this.downloadRows();
	}
};

/***/ },
/* 267 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = {

	methods: {
		getTypographyInfo: function getTypographyInfo(elType) {
			if (this.$el) {
				var element = this.$el.querySelector(elType);
				if (element) {
					var style = window.getComputedStyle(element, null);
					return style.fontFamily.split(",")[0] + " " + style.fontWeight + ", " + style.fontSize;
				}
			}
		}
	}
};

/***/ },
/* 268 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _vue = __webpack_require__(2);

var _vue2 = _interopRequireDefault(_vue);

var _marked = __webpack_require__(346);

var _marked2 = _interopRequireDefault(_marked);

var _toastr = __webpack_require__(16);

var _toastr2 = _interopRequireDefault(_toastr);

var _lodash = __webpack_require__(9);

var _vueFormGenerator = __webpack_require__(14);

var _vuex = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

	computed: _extends({}, (0, _vuex.mapGetters)("posts", ["posts", "hasMore", "fetching", "sort", "viewMode"]), (0, _vuex.mapGetters)("session", ["me"])),

	data: function data() {
		return {
			showForm: false,
			isNewPost: false,
			model: null,
			schema: {
				fields: [{
					type: "text",
					label: this._("Title"),
					model: "title",
					featured: true,
					required: true,
					placeholder: this._("TitleOfPost"),
					validator: _vueFormGenerator.validators.string
				}, {
					type: "textArea",
					label: this._("Content"),
					model: "content",
					featured: true,
					required: true,
					rows: 10,
					placeholder: this._("ContentOfPost"),
					validator: _vueFormGenerator.validators.string
				}]
			}
		};
	},

	socket: {

		prefix: "/posts/",

		events: {
			updated: function updated(res) {
				this.updated(res.data);
				_toastr2.default.success(this._("PostNameUpdated", res), this._("PostUpdated"));
			},
			voted: function voted(res) {
				this.updated(res.data);
				_toastr2.default.success(this._("PostNameVoted", res), this._("PostUpdated"));
			},
			unvoted: function unvoted(res) {
				this.updated(res.data);
				_toastr2.default.success(this._("PostNameUnvoted", res), this._("PostUpdated"));
			},
			removed: function removed(res) {
				this.removed(res.data);
				_toastr2.default.success(this._("PostNameDeleted", res), this._("PostDeleted"));
			}
		}
	},

	methods: _extends({}, (0, _vuex.mapActions)("posts", ["getRows", "loadMoreRows", "changeSort", "changeViewMode", "vote", "unVote", "saveRow", "updateRow", "removeRow", "updated", "removed"]), {
		markdown: function markdown(content) {
			return (0, _marked2.default)(content);
		},
		iVoted: function iVoted(post) {
			var _this = this;

			return _.find(post.voters, function (user) {
				return user.code == _this.me.code;
			}) != null;
		},
		toggleVote: function toggleVote(post) {
			if (this.iVoted(post)) this.unVote(post);else this.vote(post);
		},
		lastVoters: function lastVoters(post) {
			var count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;

			if (post.voters && post.voters.length > 0) {
				var voters = _.clone(post.voters).reverse().slice(0, 5);
				return voters;
			}
			return [];
		},
		createdAgo: function createdAgo(post) {
			return this._("CreatedAgoByName", { ago: _vue2.default.filter("ago")(post.createdAt), name: post.author.fullName });
		},
		editedAgo: function editedAgo(post) {
			if (post.editedAt) return this._("EditedAgo", { ago: _vue2.default.filter("ago")(post.editedAt) });
		},
		newPost: function newPost() {
			this.model = _vueFormGenerator.schema.createDefaultObject(this.schema);
			this.showForm = true;
			this.isNewPost = true;

			this.focusFirstInput();
		},
		editPost: function editPost(post) {
			this.model = (0, _lodash.cloneDeep)(post);
			this.showForm = true;
			this.isNewPost = false;
			this.focusFirstInput();
		},
		focusFirstInput: function focusFirstInput() {
			this.$nextTick(function () {
				var el = document.querySelector(".postForm .form-control:nth-child(1):not([readonly]):not(:disabled)");
				if (el) el.focus();
			});
		},
		focusFirstErrorInput: function focusFirstErrorInput() {
			this.$nextTick(function () {
				var el = document.querySelector(".postForm .form-group.error .form-control");
				if (el) el.focus();
			});
		},
		savePost: function savePost() {
			if (this.$refs.form.validate()) {
				if (this.isNewPost) this.saveRow(this.model);else this.updateRow(this.model);

				this.cancelPost();
			} else {
				this.focusFirstErrorInput();
			}
		},
		cancelPost: function cancelPost() {
			this.showForm = false;
			this.model = null;
		},
		deletePost: function deletePost(post) {
			this.removeRow(post);
		}
	}),

	created: function created() {
		this.getRows();
	}
};

/***/ },
/* 269 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _service = __webpack_require__(11);

var _service2 = _interopRequireDefault(_service);

var _vuex = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
	computed: (0, _vuex.mapGetters)("profile", ["profile"]),

	methods: _extends({}, (0, _vuex.mapActions)("profile", ["getProfile"])),

	created: function created() {
		this.$service = new _service2.default("profile", this);

		this.getProfile();
	}
};

/***/ },
/* 270 */
/***/ function(module, exports) {


/**
 * Expose `Backoff`.
 */

module.exports = Backoff;

/**
 * Initialize backoff timer with `opts`.
 *
 * - `min` initial timeout in milliseconds [100]
 * - `max` max timeout [10000]
 * - `jitter` [0]
 * - `factor` [2]
 *
 * @param {Object} opts
 * @api public
 */

function Backoff(opts) {
  opts = opts || {};
  this.ms = opts.min || 100;
  this.max = opts.max || 10000;
  this.factor = opts.factor || 2;
  this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
  this.attempts = 0;
}

/**
 * Return the backoff duration.
 *
 * @return {Number}
 * @api public
 */

Backoff.prototype.duration = function(){
  var ms = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var rand =  Math.random();
    var deviation = Math.floor(rand * this.jitter * ms);
    ms = (Math.floor(rand * 10) & 1) == 0  ? ms - deviation : ms + deviation;
  }
  return Math.min(ms, this.max) | 0;
};

/**
 * Reset the number of attempts.
 *
 * @api public
 */

Backoff.prototype.reset = function(){
  this.attempts = 0;
};

/**
 * Set the minimum duration
 *
 * @api public
 */

Backoff.prototype.setMin = function(min){
  this.ms = min;
};

/**
 * Set the maximum duration
 *
 * @api public
 */

Backoff.prototype.setMax = function(max){
  this.max = max;
};

/**
 * Set the jitter
 *
 * @api public
 */

Backoff.prototype.setJitter = function(jitter){
  this.jitter = jitter;
};



/***/ },
/* 271 */
/***/ function(module, exports) {

/*
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */
(function(){
  "use strict";

  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  // Use a lookup table to find the index.
  var lookup = new Uint8Array(256);
  for (var i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  exports.encode = function(arraybuffer) {
    var bytes = new Uint8Array(arraybuffer),
    i, len = bytes.length, base64 = "";

    for (i = 0; i < len; i+=3) {
      base64 += chars[bytes[i] >> 2];
      base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
      base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
      base64 += chars[bytes[i + 2] & 63];
    }

    if ((len % 3) === 2) {
      base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
      base64 = base64.substring(0, base64.length - 2) + "==";
    }

    return base64;
  };

  exports.decode =  function(base64) {
    var bufferLength = base64.length * 0.75,
    len = base64.length, i, p = 0,
    encoded1, encoded2, encoded3, encoded4;

    if (base64[base64.length - 1] === "=") {
      bufferLength--;
      if (base64[base64.length - 2] === "=") {
        bufferLength--;
      }
    }

    var arraybuffer = new ArrayBuffer(bufferLength),
    bytes = new Uint8Array(arraybuffer);

    for (i = 0; i < len; i+=4) {
      encoded1 = lookup[base64.charCodeAt(i)];
      encoded2 = lookup[base64.charCodeAt(i+1)];
      encoded3 = lookup[base64.charCodeAt(i+2)];
      encoded4 = lookup[base64.charCodeAt(i+3)];

      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
  };
})();


/***/ },
/* 272 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/**
 * Create a blob builder even when vendor prefixes exist
 */

var BlobBuilder = global.BlobBuilder
  || global.WebKitBlobBuilder
  || global.MSBlobBuilder
  || global.MozBlobBuilder;

/**
 * Check if Blob constructor is supported
 */

var blobSupported = (function() {
  try {
    var a = new Blob(['hi']);
    return a.size === 2;
  } catch(e) {
    return false;
  }
})();

/**
 * Check if Blob constructor supports ArrayBufferViews
 * Fails in Safari 6, so we need to map to ArrayBuffers there.
 */

var blobSupportsArrayBufferView = blobSupported && (function() {
  try {
    var b = new Blob([new Uint8Array([1,2])]);
    return b.size === 2;
  } catch(e) {
    return false;
  }
})();

/**
 * Check if BlobBuilder is supported
 */

var blobBuilderSupported = BlobBuilder
  && BlobBuilder.prototype.append
  && BlobBuilder.prototype.getBlob;

/**
 * Helper function that maps ArrayBufferViews to ArrayBuffers
 * Used by BlobBuilder constructor and old browsers that didn't
 * support it in the Blob constructor.
 */

function mapArrayBufferViews(ary) {
  for (var i = 0; i < ary.length; i++) {
    var chunk = ary[i];
    if (chunk.buffer instanceof ArrayBuffer) {
      var buf = chunk.buffer;

      // if this is a subarray, make a copy so we only
      // include the subarray region from the underlying buffer
      if (chunk.byteLength !== buf.byteLength) {
        var copy = new Uint8Array(chunk.byteLength);
        copy.set(new Uint8Array(buf, chunk.byteOffset, chunk.byteLength));
        buf = copy.buffer;
      }

      ary[i] = buf;
    }
  }
}

function BlobBuilderConstructor(ary, options) {
  options = options || {};

  var bb = new BlobBuilder();
  mapArrayBufferViews(ary);

  for (var i = 0; i < ary.length; i++) {
    bb.append(ary[i]);
  }

  return (options.type) ? bb.getBlob(options.type) : bb.getBlob();
};

function BlobConstructor(ary, options) {
  mapArrayBufferViews(ary);
  return new Blob(ary, options || {});
};

module.exports = (function() {
  if (blobSupported) {
    return blobSupportsArrayBufferView ? global.Blob : BlobConstructor;
  } else if (blobBuilderSupported) {
    return BlobBuilderConstructor;
  } else {
    return undefined;
  }
})();

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 273 */
/***/ function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(274)();
// imports


// module
exports.push([module.i, ".toast-title {\n  font-weight: bold;\n}\n.toast-message {\n  -ms-word-wrap: break-word;\n  word-wrap: break-word;\n}\n.toast-message a,\n.toast-message label {\n  color: #ffffff;\n}\n.toast-message a:hover {\n  color: #cccccc;\n  text-decoration: none;\n}\n.toast-close-button {\n  position: relative;\n  right: -0.3em;\n  top: -0.3em;\n  float: right;\n  font-size: 20px;\n  font-weight: bold;\n  color: #ffffff;\n  -webkit-text-shadow: 0 1px 0 #ffffff;\n  text-shadow: 0 1px 0 #ffffff;\n  opacity: 0.8;\n  -ms-filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=80);\n  filter: alpha(opacity=80);\n}\n.toast-close-button:hover,\n.toast-close-button:focus {\n  color: #000000;\n  text-decoration: none;\n  cursor: pointer;\n  opacity: 0.4;\n  -ms-filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=40);\n  filter: alpha(opacity=40);\n}\n/*Additional properties for button version\n iOS requires the button element instead of an anchor tag.\n If you want the anchor version, it requires `href=\"#\"`.*/\nbutton.toast-close-button {\n  padding: 0;\n  cursor: pointer;\n  background: transparent;\n  border: 0;\n  -webkit-appearance: none;\n}\n.toast-top-center {\n  top: 0;\n  right: 0;\n  width: 100%;\n}\n.toast-bottom-center {\n  bottom: 0;\n  right: 0;\n  width: 100%;\n}\n.toast-top-full-width {\n  top: 0;\n  right: 0;\n  width: 100%;\n}\n.toast-bottom-full-width {\n  bottom: 0;\n  right: 0;\n  width: 100%;\n}\n.toast-top-left {\n  top: 12px;\n  left: 12px;\n}\n.toast-top-right {\n  top: 12px;\n  right: 12px;\n}\n.toast-bottom-right {\n  right: 12px;\n  bottom: 12px;\n}\n.toast-bottom-left {\n  bottom: 12px;\n  left: 12px;\n}\n#toast-container {\n  position: fixed;\n  z-index: 999999;\n  pointer-events: none;\n  /*overrides*/\n}\n#toast-container * {\n  -moz-box-sizing: border-box;\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n}\n#toast-container > div {\n  position: relative;\n  pointer-events: auto;\n  overflow: hidden;\n  margin: 0 0 6px;\n  padding: 15px 15px 15px 50px;\n  width: 300px;\n  -moz-border-radius: 3px 3px 3px 3px;\n  -webkit-border-radius: 3px 3px 3px 3px;\n  border-radius: 3px 3px 3px 3px;\n  background-position: 15px center;\n  background-repeat: no-repeat;\n  -moz-box-shadow: 0 0 12px #999999;\n  -webkit-box-shadow: 0 0 12px #999999;\n  box-shadow: 0 0 12px #999999;\n  color: #ffffff;\n  opacity: 0.8;\n  -ms-filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=80);\n  filter: alpha(opacity=80);\n}\n#toast-container > :hover {\n  -moz-box-shadow: 0 0 12px #000000;\n  -webkit-box-shadow: 0 0 12px #000000;\n  box-shadow: 0 0 12px #000000;\n  opacity: 1;\n  -ms-filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n  filter: alpha(opacity=100);\n  cursor: pointer;\n}\n#toast-container > .toast-info {\n  background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGwSURBVEhLtZa9SgNBEMc9sUxxRcoUKSzSWIhXpFMhhYWFhaBg4yPYiWCXZxBLERsLRS3EQkEfwCKdjWJAwSKCgoKCcudv4O5YLrt7EzgXhiU3/4+b2ckmwVjJSpKkQ6wAi4gwhT+z3wRBcEz0yjSseUTrcRyfsHsXmD0AmbHOC9Ii8VImnuXBPglHpQ5wwSVM7sNnTG7Za4JwDdCjxyAiH3nyA2mtaTJufiDZ5dCaqlItILh1NHatfN5skvjx9Z38m69CgzuXmZgVrPIGE763Jx9qKsRozWYw6xOHdER+nn2KkO+Bb+UV5CBN6WC6QtBgbRVozrahAbmm6HtUsgtPC19tFdxXZYBOfkbmFJ1VaHA1VAHjd0pp70oTZzvR+EVrx2Ygfdsq6eu55BHYR8hlcki+n+kERUFG8BrA0BwjeAv2M8WLQBtcy+SD6fNsmnB3AlBLrgTtVW1c2QN4bVWLATaIS60J2Du5y1TiJgjSBvFVZgTmwCU+dAZFoPxGEEs8nyHC9Bwe2GvEJv2WXZb0vjdyFT4Cxk3e/kIqlOGoVLwwPevpYHT+00T+hWwXDf4AJAOUqWcDhbwAAAAASUVORK5CYII=\") !important;\n}\n#toast-container > .toast-error {\n  background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAHOSURBVEhLrZa/SgNBEMZzh0WKCClSCKaIYOED+AAKeQQLG8HWztLCImBrYadgIdY+gIKNYkBFSwu7CAoqCgkkoGBI/E28PdbLZmeDLgzZzcx83/zZ2SSXC1j9fr+I1Hq93g2yxH4iwM1vkoBWAdxCmpzTxfkN2RcyZNaHFIkSo10+8kgxkXIURV5HGxTmFuc75B2RfQkpxHG8aAgaAFa0tAHqYFfQ7Iwe2yhODk8+J4C7yAoRTWI3w/4klGRgR4lO7Rpn9+gvMyWp+uxFh8+H+ARlgN1nJuJuQAYvNkEnwGFck18Er4q3egEc/oO+mhLdKgRyhdNFiacC0rlOCbhNVz4H9FnAYgDBvU3QIioZlJFLJtsoHYRDfiZoUyIxqCtRpVlANq0EU4dApjrtgezPFad5S19Wgjkc0hNVnuF4HjVA6C7QrSIbylB+oZe3aHgBsqlNqKYH48jXyJKMuAbiyVJ8KzaB3eRc0pg9VwQ4niFryI68qiOi3AbjwdsfnAtk0bCjTLJKr6mrD9g8iq/S/B81hguOMlQTnVyG40wAcjnmgsCNESDrjme7wfftP4P7SP4N3CJZdvzoNyGq2c/HWOXJGsvVg+RA/k2MC/wN6I2YA2Pt8GkAAAAASUVORK5CYII=\") !important;\n}\n#toast-container > .toast-success {\n  background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADsSURBVEhLY2AYBfQMgf///3P8+/evAIgvA/FsIF+BavYDDWMBGroaSMMBiE8VC7AZDrIFaMFnii3AZTjUgsUUWUDA8OdAH6iQbQEhw4HyGsPEcKBXBIC4ARhex4G4BsjmweU1soIFaGg/WtoFZRIZdEvIMhxkCCjXIVsATV6gFGACs4Rsw0EGgIIH3QJYJgHSARQZDrWAB+jawzgs+Q2UO49D7jnRSRGoEFRILcdmEMWGI0cm0JJ2QpYA1RDvcmzJEWhABhD/pqrL0S0CWuABKgnRki9lLseS7g2AlqwHWQSKH4oKLrILpRGhEQCw2LiRUIa4lwAAAABJRU5ErkJggg==\") !important;\n}\n#toast-container > .toast-warning {\n  background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGYSURBVEhL5ZSvTsNQFMbXZGICMYGYmJhAQIJAICYQPAACiSDB8AiICQQJT4CqQEwgJvYASAQCiZiYmJhAIBATCARJy+9rTsldd8sKu1M0+dLb057v6/lbq/2rK0mS/TRNj9cWNAKPYIJII7gIxCcQ51cvqID+GIEX8ASG4B1bK5gIZFeQfoJdEXOfgX4QAQg7kH2A65yQ87lyxb27sggkAzAuFhbbg1K2kgCkB1bVwyIR9m2L7PRPIhDUIXgGtyKw575yz3lTNs6X4JXnjV+LKM/m3MydnTbtOKIjtz6VhCBq4vSm3ncdrD2lk0VgUXSVKjVDJXJzijW1RQdsU7F77He8u68koNZTz8Oz5yGa6J3H3lZ0xYgXBK2QymlWWA+RWnYhskLBv2vmE+hBMCtbA7KX5drWyRT/2JsqZ2IvfB9Y4bWDNMFbJRFmC9E74SoS0CqulwjkC0+5bpcV1CZ8NMej4pjy0U+doDQsGyo1hzVJttIjhQ7GnBtRFN1UarUlH8F3xict+HY07rEzoUGPlWcjRFRr4/gChZgc3ZL2d8oAAAAASUVORK5CYII=\") !important;\n}\n#toast-container.toast-top-center > div,\n#toast-container.toast-bottom-center > div {\n  width: 300px;\n  margin-left: auto;\n  margin-right: auto;\n}\n#toast-container.toast-top-full-width > div,\n#toast-container.toast-bottom-full-width > div {\n  width: 96%;\n  margin-left: auto;\n  margin-right: auto;\n}\n.toast {\n  background-color: #030303;\n}\n.toast-success {\n  background-color: #51a351;\n}\n.toast-error {\n  background-color: #bd362f;\n}\n.toast-info {\n  background-color: #2f96b4;\n}\n.toast-warning {\n  background-color: #f89406;\n}\n.toast-progress {\n  position: absolute;\n  left: 0;\n  bottom: 0;\n  height: 4px;\n  background-color: #000000;\n  opacity: 0.4;\n  -ms-filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=40);\n  filter: alpha(opacity=40);\n}\n/*Responsive Design*/\n@media all and (max-width: 240px) {\n  #toast-container > div {\n    padding: 8px 8px 8px 50px;\n    width: 11em;\n  }\n  #toast-container .toast-close-button {\n    right: -0.2em;\n    top: -0.2em;\n  }\n}\n@media all and (min-width: 241px) and (max-width: 480px) {\n  #toast-container > div {\n    padding: 8px 8px 8px 50px;\n    width: 18em;\n  }\n  #toast-container .toast-close-button {\n    right: -0.2em;\n    top: -0.2em;\n  }\n}\n@media all and (min-width: 481px) and (max-width: 768px) {\n  #toast-container > div {\n    padding: 15px 15px 15px 50px;\n    width: 25em;\n  }\n}\n", ""]);

// exports


/***/ },
/* 274 */,
/* 275 */
/***/ function(module, exports, __webpack_require__) {


/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__(276);
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}


/***/ },
/* 276 */
/***/ function(module, exports, __webpack_require__) {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = __webpack_require__(277);

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}


/***/ },
/* 277 */
/***/ function(module, exports) {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = '' + str;
  if (str.length > 10000) return;
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}


/***/ },
/* 278 */
/***/ function(module, exports, __webpack_require__) {


module.exports = __webpack_require__(279);


/***/ },
/* 279 */
/***/ function(module, exports, __webpack_require__) {


module.exports = __webpack_require__(280);

/**
 * Exports parser
 *
 * @api public
 *
 */
module.exports.parser = __webpack_require__(12);


/***/ },
/* 280 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/**
 * Module dependencies.
 */

var transports = __webpack_require__(61);
var Emitter = __webpack_require__(17);
var debug = __webpack_require__(25)('engine.io-client:socket');
var index = __webpack_require__(67);
var parser = __webpack_require__(12);
var parseuri = __webpack_require__(188);
var parsejson = __webpack_require__(348);
var parseqs = __webpack_require__(39);

/**
 * Module exports.
 */

module.exports = Socket;

/**
 * Socket constructor.
 *
 * @param {String|Object} uri or options
 * @param {Object} options
 * @api public
 */

function Socket (uri, opts) {
  if (!(this instanceof Socket)) return new Socket(uri, opts);

  opts = opts || {};

  if (uri && 'object' === typeof uri) {
    opts = uri;
    uri = null;
  }

  if (uri) {
    uri = parseuri(uri);
    opts.hostname = uri.host;
    opts.secure = uri.protocol === 'https' || uri.protocol === 'wss';
    opts.port = uri.port;
    if (uri.query) opts.query = uri.query;
  } else if (opts.host) {
    opts.hostname = parseuri(opts.host).host;
  }

  this.secure = null != opts.secure ? opts.secure
    : (global.location && 'https:' === location.protocol);

  if (opts.hostname && !opts.port) {
    // if no port is specified manually, use the protocol default
    opts.port = this.secure ? '443' : '80';
  }

  this.agent = opts.agent || false;
  this.hostname = opts.hostname ||
    (global.location ? location.hostname : 'localhost');
  this.port = opts.port || (global.location && location.port
      ? location.port
      : (this.secure ? 443 : 80));
  this.query = opts.query || {};
  if ('string' === typeof this.query) this.query = parseqs.decode(this.query);
  this.upgrade = false !== opts.upgrade;
  this.path = (opts.path || '/engine.io').replace(/\/$/, '') + '/';
  this.forceJSONP = !!opts.forceJSONP;
  this.jsonp = false !== opts.jsonp;
  this.forceBase64 = !!opts.forceBase64;
  this.enablesXDR = !!opts.enablesXDR;
  this.timestampParam = opts.timestampParam || 't';
  this.timestampRequests = opts.timestampRequests;
  this.transports = opts.transports || ['polling', 'websocket'];
  this.readyState = '';
  this.writeBuffer = [];
  this.prevBufferLen = 0;
  this.policyPort = opts.policyPort || 843;
  this.rememberUpgrade = opts.rememberUpgrade || false;
  this.binaryType = null;
  this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades;
  this.perMessageDeflate = false !== opts.perMessageDeflate ? (opts.perMessageDeflate || {}) : false;

  if (true === this.perMessageDeflate) this.perMessageDeflate = {};
  if (this.perMessageDeflate && null == this.perMessageDeflate.threshold) {
    this.perMessageDeflate.threshold = 1024;
  }

  // SSL options for Node.js client
  this.pfx = opts.pfx || null;
  this.key = opts.key || null;
  this.passphrase = opts.passphrase || null;
  this.cert = opts.cert || null;
  this.ca = opts.ca || null;
  this.ciphers = opts.ciphers || null;
  this.rejectUnauthorized = opts.rejectUnauthorized === undefined ? null : opts.rejectUnauthorized;
  this.forceNode = !!opts.forceNode;

  // other options for Node.js client
  var freeGlobal = typeof global === 'object' && global;
  if (freeGlobal.global === freeGlobal) {
    if (opts.extraHeaders && Object.keys(opts.extraHeaders).length > 0) {
      this.extraHeaders = opts.extraHeaders;
    }

    if (opts.localAddress) {
      this.localAddress = opts.localAddress;
    }
  }

  // set on handshake
  this.id = null;
  this.upgrades = null;
  this.pingInterval = null;
  this.pingTimeout = null;

  // set on heartbeat
  this.pingIntervalTimer = null;
  this.pingTimeoutTimer = null;

  this.open();
}

Socket.priorWebsocketSuccess = false;

/**
 * Mix in `Emitter`.
 */

Emitter(Socket.prototype);

/**
 * Protocol version.
 *
 * @api public
 */

Socket.protocol = parser.protocol; // this is an int

/**
 * Expose deps for legacy compatibility
 * and standalone browser access.
 */

Socket.Socket = Socket;
Socket.Transport = __webpack_require__(34);
Socket.transports = __webpack_require__(61);
Socket.parser = __webpack_require__(12);

/**
 * Creates transport of the given type.
 *
 * @param {String} transport name
 * @return {Transport}
 * @api private
 */

Socket.prototype.createTransport = function (name) {
  debug('creating transport "%s"', name);
  var query = clone(this.query);

  // append engine.io protocol identifier
  query.EIO = parser.protocol;

  // transport name
  query.transport = name;

  // session id if we already have one
  if (this.id) query.sid = this.id;

  var transport = new transports[name]({
    agent: this.agent,
    hostname: this.hostname,
    port: this.port,
    secure: this.secure,
    path: this.path,
    query: query,
    forceJSONP: this.forceJSONP,
    jsonp: this.jsonp,
    forceBase64: this.forceBase64,
    enablesXDR: this.enablesXDR,
    timestampRequests: this.timestampRequests,
    timestampParam: this.timestampParam,
    policyPort: this.policyPort,
    socket: this,
    pfx: this.pfx,
    key: this.key,
    passphrase: this.passphrase,
    cert: this.cert,
    ca: this.ca,
    ciphers: this.ciphers,
    rejectUnauthorized: this.rejectUnauthorized,
    perMessageDeflate: this.perMessageDeflate,
    extraHeaders: this.extraHeaders,
    forceNode: this.forceNode,
    localAddress: this.localAddress
  });

  return transport;
};

function clone (obj) {
  var o = {};
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      o[i] = obj[i];
    }
  }
  return o;
}

/**
 * Initializes transport to use and starts probe.
 *
 * @api private
 */
Socket.prototype.open = function () {
  var transport;
  if (this.rememberUpgrade && Socket.priorWebsocketSuccess && this.transports.indexOf('websocket') !== -1) {
    transport = 'websocket';
  } else if (0 === this.transports.length) {
    // Emit error on next tick so it can be listened to
    var self = this;
    setTimeout(function () {
      self.emit('error', 'No transports available');
    }, 0);
    return;
  } else {
    transport = this.transports[0];
  }
  this.readyState = 'opening';

  // Retry with the next transport if the transport is disabled (jsonp: false)
  try {
    transport = this.createTransport(transport);
  } catch (e) {
    this.transports.shift();
    this.open();
    return;
  }

  transport.open();
  this.setTransport(transport);
};

/**
 * Sets the current transport. Disables the existing one (if any).
 *
 * @api private
 */

Socket.prototype.setTransport = function (transport) {
  debug('setting transport %s', transport.name);
  var self = this;

  if (this.transport) {
    debug('clearing existing transport %s', this.transport.name);
    this.transport.removeAllListeners();
  }

  // set up transport
  this.transport = transport;

  // set up transport listeners
  transport
  .on('drain', function () {
    self.onDrain();
  })
  .on('packet', function (packet) {
    self.onPacket(packet);
  })
  .on('error', function (e) {
    self.onError(e);
  })
  .on('close', function () {
    self.onClose('transport close');
  });
};

/**
 * Probes a transport.
 *
 * @param {String} transport name
 * @api private
 */

Socket.prototype.probe = function (name) {
  debug('probing transport "%s"', name);
  var transport = this.createTransport(name, { probe: 1 });
  var failed = false;
  var self = this;

  Socket.priorWebsocketSuccess = false;

  function onTransportOpen () {
    if (self.onlyBinaryUpgrades) {
      var upgradeLosesBinary = !this.supportsBinary && self.transport.supportsBinary;
      failed = failed || upgradeLosesBinary;
    }
    if (failed) return;

    debug('probe transport "%s" opened', name);
    transport.send([{ type: 'ping', data: 'probe' }]);
    transport.once('packet', function (msg) {
      if (failed) return;
      if ('pong' === msg.type && 'probe' === msg.data) {
        debug('probe transport "%s" pong', name);
        self.upgrading = true;
        self.emit('upgrading', transport);
        if (!transport) return;
        Socket.priorWebsocketSuccess = 'websocket' === transport.name;

        debug('pausing current transport "%s"', self.transport.name);
        self.transport.pause(function () {
          if (failed) return;
          if ('closed' === self.readyState) return;
          debug('changing transport and sending upgrade packet');

          cleanup();

          self.setTransport(transport);
          transport.send([{ type: 'upgrade' }]);
          self.emit('upgrade', transport);
          transport = null;
          self.upgrading = false;
          self.flush();
        });
      } else {
        debug('probe transport "%s" failed', name);
        var err = new Error('probe error');
        err.transport = transport.name;
        self.emit('upgradeError', err);
      }
    });
  }

  function freezeTransport () {
    if (failed) return;

    // Any callback called by transport should be ignored since now
    failed = true;

    cleanup();

    transport.close();
    transport = null;
  }

  // Handle any error that happens while probing
  function onerror (err) {
    var error = new Error('probe error: ' + err);
    error.transport = transport.name;

    freezeTransport();

    debug('probe transport "%s" failed because of error: %s', name, err);

    self.emit('upgradeError', error);
  }

  function onTransportClose () {
    onerror('transport closed');
  }

  // When the socket is closed while we're probing
  function onclose () {
    onerror('socket closed');
  }

  // When the socket is upgraded while we're probing
  function onupgrade (to) {
    if (transport && to.name !== transport.name) {
      debug('"%s" works - aborting "%s"', to.name, transport.name);
      freezeTransport();
    }
  }

  // Remove all listeners on the transport and on self
  function cleanup () {
    transport.removeListener('open', onTransportOpen);
    transport.removeListener('error', onerror);
    transport.removeListener('close', onTransportClose);
    self.removeListener('close', onclose);
    self.removeListener('upgrading', onupgrade);
  }

  transport.once('open', onTransportOpen);
  transport.once('error', onerror);
  transport.once('close', onTransportClose);

  this.once('close', onclose);
  this.once('upgrading', onupgrade);

  transport.open();
};

/**
 * Called when connection is deemed open.
 *
 * @api public
 */

Socket.prototype.onOpen = function () {
  debug('socket open');
  this.readyState = 'open';
  Socket.priorWebsocketSuccess = 'websocket' === this.transport.name;
  this.emit('open');
  this.flush();

  // we check for `readyState` in case an `open`
  // listener already closed the socket
  if ('open' === this.readyState && this.upgrade && this.transport.pause) {
    debug('starting upgrade probes');
    for (var i = 0, l = this.upgrades.length; i < l; i++) {
      this.probe(this.upgrades[i]);
    }
  }
};

/**
 * Handles a packet.
 *
 * @api private
 */

Socket.prototype.onPacket = function (packet) {
  if ('opening' === this.readyState || 'open' === this.readyState ||
      'closing' === this.readyState) {
    debug('socket receive: type "%s", data "%s"', packet.type, packet.data);

    this.emit('packet', packet);

    // Socket is live - any packet counts
    this.emit('heartbeat');

    switch (packet.type) {
      case 'open':
        this.onHandshake(parsejson(packet.data));
        break;

      case 'pong':
        this.setPing();
        this.emit('pong');
        break;

      case 'error':
        var err = new Error('server error');
        err.code = packet.data;
        this.onError(err);
        break;

      case 'message':
        this.emit('data', packet.data);
        this.emit('message', packet.data);
        break;
    }
  } else {
    debug('packet received with socket readyState "%s"', this.readyState);
  }
};

/**
 * Called upon handshake completion.
 *
 * @param {Object} handshake obj
 * @api private
 */

Socket.prototype.onHandshake = function (data) {
  this.emit('handshake', data);
  this.id = data.sid;
  this.transport.query.sid = data.sid;
  this.upgrades = this.filterUpgrades(data.upgrades);
  this.pingInterval = data.pingInterval;
  this.pingTimeout = data.pingTimeout;
  this.onOpen();
  // In case open handler closes socket
  if ('closed' === this.readyState) return;
  this.setPing();

  // Prolong liveness of socket on heartbeat
  this.removeListener('heartbeat', this.onHeartbeat);
  this.on('heartbeat', this.onHeartbeat);
};

/**
 * Resets ping timeout.
 *
 * @api private
 */

Socket.prototype.onHeartbeat = function (timeout) {
  clearTimeout(this.pingTimeoutTimer);
  var self = this;
  self.pingTimeoutTimer = setTimeout(function () {
    if ('closed' === self.readyState) return;
    self.onClose('ping timeout');
  }, timeout || (self.pingInterval + self.pingTimeout));
};

/**
 * Pings server every `this.pingInterval` and expects response
 * within `this.pingTimeout` or closes connection.
 *
 * @api private
 */

Socket.prototype.setPing = function () {
  var self = this;
  clearTimeout(self.pingIntervalTimer);
  self.pingIntervalTimer = setTimeout(function () {
    debug('writing ping packet - expecting pong within %sms', self.pingTimeout);
    self.ping();
    self.onHeartbeat(self.pingTimeout);
  }, self.pingInterval);
};

/**
* Sends a ping packet.
*
* @api private
*/

Socket.prototype.ping = function () {
  var self = this;
  this.sendPacket('ping', function () {
    self.emit('ping');
  });
};

/**
 * Called on `drain` event
 *
 * @api private
 */

Socket.prototype.onDrain = function () {
  this.writeBuffer.splice(0, this.prevBufferLen);

  // setting prevBufferLen = 0 is very important
  // for example, when upgrading, upgrade packet is sent over,
  // and a nonzero prevBufferLen could cause problems on `drain`
  this.prevBufferLen = 0;

  if (0 === this.writeBuffer.length) {
    this.emit('drain');
  } else {
    this.flush();
  }
};

/**
 * Flush write buffers.
 *
 * @api private
 */

Socket.prototype.flush = function () {
  if ('closed' !== this.readyState && this.transport.writable &&
    !this.upgrading && this.writeBuffer.length) {
    debug('flushing %d packets in socket', this.writeBuffer.length);
    this.transport.send(this.writeBuffer);
    // keep track of current length of writeBuffer
    // splice writeBuffer and callbackBuffer on `drain`
    this.prevBufferLen = this.writeBuffer.length;
    this.emit('flush');
  }
};

/**
 * Sends a message.
 *
 * @param {String} message.
 * @param {Function} callback function.
 * @param {Object} options.
 * @return {Socket} for chaining.
 * @api public
 */

Socket.prototype.write =
Socket.prototype.send = function (msg, options, fn) {
  this.sendPacket('message', msg, options, fn);
  return this;
};

/**
 * Sends a packet.
 *
 * @param {String} packet type.
 * @param {String} data.
 * @param {Object} options.
 * @param {Function} callback function.
 * @api private
 */

Socket.prototype.sendPacket = function (type, data, options, fn) {
  if ('function' === typeof data) {
    fn = data;
    data = undefined;
  }

  if ('function' === typeof options) {
    fn = options;
    options = null;
  }

  if ('closing' === this.readyState || 'closed' === this.readyState) {
    return;
  }

  options = options || {};
  options.compress = false !== options.compress;

  var packet = {
    type: type,
    data: data,
    options: options
  };
  this.emit('packetCreate', packet);
  this.writeBuffer.push(packet);
  if (fn) this.once('flush', fn);
  this.flush();
};

/**
 * Closes the connection.
 *
 * @api private
 */

Socket.prototype.close = function () {
  if ('opening' === this.readyState || 'open' === this.readyState) {
    this.readyState = 'closing';

    var self = this;

    if (this.writeBuffer.length) {
      this.once('drain', function () {
        if (this.upgrading) {
          waitForUpgrade();
        } else {
          close();
        }
      });
    } else if (this.upgrading) {
      waitForUpgrade();
    } else {
      close();
    }
  }

  function close () {
    self.onClose('forced close');
    debug('socket closing - telling transport to close');
    self.transport.close();
  }

  function cleanupAndClose () {
    self.removeListener('upgrade', cleanupAndClose);
    self.removeListener('upgradeError', cleanupAndClose);
    close();
  }

  function waitForUpgrade () {
    // wait for upgrade to finish since we can't send packets while pausing a transport
    self.once('upgrade', cleanupAndClose);
    self.once('upgradeError', cleanupAndClose);
  }

  return this;
};

/**
 * Called upon transport error
 *
 * @api private
 */

Socket.prototype.onError = function (err) {
  debug('socket error %j', err);
  Socket.priorWebsocketSuccess = false;
  this.emit('error', err);
  this.onClose('transport error', err);
};

/**
 * Called upon transport close.
 *
 * @api private
 */

Socket.prototype.onClose = function (reason, desc) {
  if ('opening' === this.readyState || 'open' === this.readyState || 'closing' === this.readyState) {
    debug('socket close with reason: "%s"', reason);
    var self = this;

    // clear timers
    clearTimeout(this.pingIntervalTimer);
    clearTimeout(this.pingTimeoutTimer);

    // stop event from firing again for transport
    this.transport.removeAllListeners('close');

    // ensure transport won't stay open
    this.transport.close();

    // ignore further transport communication
    this.transport.removeAllListeners();

    // set ready state
    this.readyState = 'closed';

    // clear session id
    this.id = null;

    // emit close event
    this.emit('close', reason, desc);

    // clean buffers after, so users can still
    // grab the buffers on `close` event
    self.writeBuffer = [];
    self.prevBufferLen = 0;
  }
};

/**
 * Filters upgrades, returning only those matching client transports.
 *
 * @param {Array} server upgrades
 * @api private
 *
 */

Socket.prototype.filterUpgrades = function (upgrades) {
  var filteredUpgrades = [];
  for (var i = 0, j = upgrades.length; i < j; i++) {
    if (~index(this.transports, upgrades[i])) filteredUpgrades.push(upgrades[i]);
  }
  return filteredUpgrades;
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 281 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {
/**
 * Module requirements.
 */

var Polling = __webpack_require__(62);
var inherit = __webpack_require__(24);

/**
 * Module exports.
 */

module.exports = JSONPPolling;

/**
 * Cached regular expressions.
 */

var rNewline = /\n/g;
var rEscapedNewline = /\\n/g;

/**
 * Global JSONP callbacks.
 */

var callbacks;

/**
 * Noop.
 */

function empty () { }

/**
 * JSONP Polling constructor.
 *
 * @param {Object} opts.
 * @api public
 */

function JSONPPolling (opts) {
  Polling.call(this, opts);

  this.query = this.query || {};

  // define global callbacks array if not present
  // we do this here (lazily) to avoid unneeded global pollution
  if (!callbacks) {
    // we need to consider multiple engines in the same page
    if (!global.___eio) global.___eio = [];
    callbacks = global.___eio;
  }

  // callback identifier
  this.index = callbacks.length;

  // add callback to jsonp global
  var self = this;
  callbacks.push(function (msg) {
    self.onData(msg);
  });

  // append to query string
  this.query.j = this.index;

  // prevent spurious errors from being emitted when the window is unloaded
  if (global.document && global.addEventListener) {
    global.addEventListener('beforeunload', function () {
      if (self.script) self.script.onerror = empty;
    }, false);
  }
}

/**
 * Inherits from Polling.
 */

inherit(JSONPPolling, Polling);

/*
 * JSONP only supports binary as base64 encoded strings
 */

JSONPPolling.prototype.supportsBinary = false;

/**
 * Closes the socket.
 *
 * @api private
 */

JSONPPolling.prototype.doClose = function () {
  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  if (this.form) {
    this.form.parentNode.removeChild(this.form);
    this.form = null;
    this.iframe = null;
  }

  Polling.prototype.doClose.call(this);
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

JSONPPolling.prototype.doPoll = function () {
  var self = this;
  var script = document.createElement('script');

  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  script.async = true;
  script.src = this.uri();
  script.onerror = function (e) {
    self.onError('jsonp poll error', e);
  };

  var insertAt = document.getElementsByTagName('script')[0];
  if (insertAt) {
    insertAt.parentNode.insertBefore(script, insertAt);
  } else {
    (document.head || document.body).appendChild(script);
  }
  this.script = script;

  var isUAgecko = 'undefined' !== typeof navigator && /gecko/i.test(navigator.userAgent);

  if (isUAgecko) {
    setTimeout(function () {
      var iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      document.body.removeChild(iframe);
    }, 100);
  }
};

/**
 * Writes with a hidden iframe.
 *
 * @param {String} data to send
 * @param {Function} called upon flush.
 * @api private
 */

JSONPPolling.prototype.doWrite = function (data, fn) {
  var self = this;

  if (!this.form) {
    var form = document.createElement('form');
    var area = document.createElement('textarea');
    var id = this.iframeId = 'eio_iframe_' + this.index;
    var iframe;

    form.className = 'socketio';
    form.style.position = 'absolute';
    form.style.top = '-1000px';
    form.style.left = '-1000px';
    form.target = id;
    form.method = 'POST';
    form.setAttribute('accept-charset', 'utf-8');
    area.name = 'd';
    form.appendChild(area);
    document.body.appendChild(form);

    this.form = form;
    this.area = area;
  }

  this.form.action = this.uri();

  function complete () {
    initIframe();
    fn();
  }

  function initIframe () {
    if (self.iframe) {
      try {
        self.form.removeChild(self.iframe);
      } catch (e) {
        self.onError('jsonp polling iframe removal error', e);
      }
    }

    try {
      // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
      var html = '<iframe src="javascript:0" name="' + self.iframeId + '">';
      iframe = document.createElement(html);
    } catch (e) {
      iframe = document.createElement('iframe');
      iframe.name = self.iframeId;
      iframe.src = 'javascript:0';
    }

    iframe.id = self.iframeId;

    self.form.appendChild(iframe);
    self.iframe = iframe;
  }

  initIframe();

  // escape \n to prevent it from being converted into \r\n by some UAs
  // double escaping is required for escaped new lines because unescaping of new lines can be done safely on server-side
  data = data.replace(rEscapedNewline, '\\\n');
  this.area.value = data.replace(rNewline, '\\n');

  try {
    this.form.submit();
  } catch (e) {}

  if (this.iframe.attachEvent) {
    this.iframe.onreadystatechange = function () {
      if (self.iframe.readyState === 'complete') {
        complete();
      }
    };
  } else {
    this.iframe.onload = complete;
  }
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 282 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/**
 * Module requirements.
 */

var XMLHttpRequest = __webpack_require__(35);
var Polling = __webpack_require__(62);
var Emitter = __webpack_require__(17);
var inherit = __webpack_require__(24);
var debug = __webpack_require__(25)('engine.io-client:polling-xhr');

/**
 * Module exports.
 */

module.exports = XHR;
module.exports.Request = Request;

/**
 * Empty function
 */

function empty () {}

/**
 * XHR Polling constructor.
 *
 * @param {Object} opts
 * @api public
 */

function XHR (opts) {
  Polling.call(this, opts);
  this.requestTimeout = opts.requestTimeout;

  if (global.location) {
    var isSSL = 'https:' === location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    this.xd = opts.hostname !== global.location.hostname ||
      port !== opts.port;
    this.xs = opts.secure !== isSSL;
  } else {
    this.extraHeaders = opts.extraHeaders;
  }
}

/**
 * Inherits from Polling.
 */

inherit(XHR, Polling);

/**
 * XHR supports binary
 */

XHR.prototype.supportsBinary = true;

/**
 * Creates a request.
 *
 * @param {String} method
 * @api private
 */

XHR.prototype.request = function (opts) {
  opts = opts || {};
  opts.uri = this.uri();
  opts.xd = this.xd;
  opts.xs = this.xs;
  opts.agent = this.agent || false;
  opts.supportsBinary = this.supportsBinary;
  opts.enablesXDR = this.enablesXDR;

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;
  opts.requestTimeout = this.requestTimeout;

  // other options for Node.js client
  opts.extraHeaders = this.extraHeaders;

  return new Request(opts);
};

/**
 * Sends data.
 *
 * @param {String} data to send.
 * @param {Function} called upon flush.
 * @api private
 */

XHR.prototype.doWrite = function (data, fn) {
  var isBinary = typeof data !== 'string' && data !== undefined;
  var req = this.request({ method: 'POST', data: data, isBinary: isBinary });
  var self = this;
  req.on('success', fn);
  req.on('error', function (err) {
    self.onError('xhr post error', err);
  });
  this.sendXhr = req;
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

XHR.prototype.doPoll = function () {
  debug('xhr poll');
  var req = this.request();
  var self = this;
  req.on('data', function (data) {
    self.onData(data);
  });
  req.on('error', function (err) {
    self.onError('xhr poll error', err);
  });
  this.pollXhr = req;
};

/**
 * Request constructor
 *
 * @param {Object} options
 * @api public
 */

function Request (opts) {
  this.method = opts.method || 'GET';
  this.uri = opts.uri;
  this.xd = !!opts.xd;
  this.xs = !!opts.xs;
  this.async = false !== opts.async;
  this.data = undefined !== opts.data ? opts.data : null;
  this.agent = opts.agent;
  this.isBinary = opts.isBinary;
  this.supportsBinary = opts.supportsBinary;
  this.enablesXDR = opts.enablesXDR;
  this.requestTimeout = opts.requestTimeout;

  // SSL options for Node.js client
  this.pfx = opts.pfx;
  this.key = opts.key;
  this.passphrase = opts.passphrase;
  this.cert = opts.cert;
  this.ca = opts.ca;
  this.ciphers = opts.ciphers;
  this.rejectUnauthorized = opts.rejectUnauthorized;

  // other options for Node.js client
  this.extraHeaders = opts.extraHeaders;

  this.create();
}

/**
 * Mix in `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Creates the XHR object and sends the request.
 *
 * @api private
 */

Request.prototype.create = function () {
  var opts = { agent: this.agent, xdomain: this.xd, xscheme: this.xs, enablesXDR: this.enablesXDR };

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;

  var xhr = this.xhr = new XMLHttpRequest(opts);
  var self = this;

  try {
    debug('xhr open %s: %s', this.method, this.uri);
    xhr.open(this.method, this.uri, this.async);
    try {
      if (this.extraHeaders) {
        xhr.setDisableHeaderCheck(true);
        for (var i in this.extraHeaders) {
          if (this.extraHeaders.hasOwnProperty(i)) {
            xhr.setRequestHeader(i, this.extraHeaders[i]);
          }
        }
      }
    } catch (e) {}
    if (this.supportsBinary) {
      // This has to be done after open because Firefox is stupid
      // http://stackoverflow.com/questions/13216903/get-binary-data-with-xmlhttprequest-in-a-firefox-extension
      xhr.responseType = 'arraybuffer';
    }

    if ('POST' === this.method) {
      try {
        if (this.isBinary) {
          xhr.setRequestHeader('Content-type', 'application/octet-stream');
        } else {
          xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
        }
      } catch (e) {}
    }

    try {
      xhr.setRequestHeader('Accept', '*/*');
    } catch (e) {}

    // ie6 check
    if ('withCredentials' in xhr) {
      xhr.withCredentials = true;
    }

    if (this.requestTimeout) {
      xhr.timeout = this.requestTimeout;
    }

    if (this.hasXDR()) {
      xhr.onload = function () {
        self.onLoad();
      };
      xhr.onerror = function () {
        self.onError(xhr.responseText);
      };
    } else {
      xhr.onreadystatechange = function () {
        if (4 !== xhr.readyState) return;
        if (200 === xhr.status || 1223 === xhr.status) {
          self.onLoad();
        } else {
          // make sure the `error` event handler that's user-set
          // does not throw in the same tick and gets caught here
          setTimeout(function () {
            self.onError(xhr.status);
          }, 0);
        }
      };
    }

    debug('xhr data %s', this.data);
    xhr.send(this.data);
  } catch (e) {
    // Need to defer since .create() is called directly fhrom the constructor
    // and thus the 'error' event can only be only bound *after* this exception
    // occurs.  Therefore, also, we cannot throw here at all.
    setTimeout(function () {
      self.onError(e);
    }, 0);
    return;
  }

  if (global.document) {
    this.index = Request.requestsCount++;
    Request.requests[this.index] = this;
  }
};

/**
 * Called upon successful response.
 *
 * @api private
 */

Request.prototype.onSuccess = function () {
  this.emit('success');
  this.cleanup();
};

/**
 * Called if we have data.
 *
 * @api private
 */

Request.prototype.onData = function (data) {
  this.emit('data', data);
  this.onSuccess();
};

/**
 * Called upon error.
 *
 * @api private
 */

Request.prototype.onError = function (err) {
  this.emit('error', err);
  this.cleanup(true);
};

/**
 * Cleans up house.
 *
 * @api private
 */

Request.prototype.cleanup = function (fromError) {
  if ('undefined' === typeof this.xhr || null === this.xhr) {
    return;
  }
  // xmlhttprequest
  if (this.hasXDR()) {
    this.xhr.onload = this.xhr.onerror = empty;
  } else {
    this.xhr.onreadystatechange = empty;
  }

  if (fromError) {
    try {
      this.xhr.abort();
    } catch (e) {}
  }

  if (global.document) {
    delete Request.requests[this.index];
  }

  this.xhr = null;
};

/**
 * Called upon load.
 *
 * @api private
 */

Request.prototype.onLoad = function () {
  var data;
  try {
    var contentType;
    try {
      contentType = this.xhr.getResponseHeader('Content-Type').split(';')[0];
    } catch (e) {}
    if (contentType === 'application/octet-stream') {
      data = this.xhr.response || this.xhr.responseText;
    } else {
      if (!this.supportsBinary) {
        data = this.xhr.responseText;
      } else {
        try {
          data = String.fromCharCode.apply(null, new Uint8Array(this.xhr.response));
        } catch (e) {
          var ui8Arr = new Uint8Array(this.xhr.response);
          var dataArray = [];
          for (var idx = 0, length = ui8Arr.length; idx < length; idx++) {
            dataArray.push(ui8Arr[idx]);
          }

          data = String.fromCharCode.apply(null, dataArray);
        }
      }
    }
  } catch (e) {
    this.onError(e);
  }
  if (null != data) {
    this.onData(data);
  }
};

/**
 * Check if it has XDomainRequest.
 *
 * @api private
 */

Request.prototype.hasXDR = function () {
  return 'undefined' !== typeof global.XDomainRequest && !this.xs && this.enablesXDR;
};

/**
 * Aborts the request.
 *
 * @api public
 */

Request.prototype.abort = function () {
  this.cleanup();
};

/**
 * Aborts pending requests when unloading the window. This is needed to prevent
 * memory leaks (e.g. when using IE) and to ensure that no spurious error is
 * emitted.
 */

Request.requestsCount = 0;
Request.requests = {};

if (global.document) {
  if (global.attachEvent) {
    global.attachEvent('onunload', unloadHandler);
  } else if (global.addEventListener) {
    global.addEventListener('beforeunload', unloadHandler, false);
  }
}

function unloadHandler () {
  for (var i in Request.requests) {
    if (Request.requests.hasOwnProperty(i)) {
      Request.requests[i].abort();
    }
  }
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 283 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/**
 * Module dependencies.
 */

var Transport = __webpack_require__(34);
var parser = __webpack_require__(12);
var parseqs = __webpack_require__(39);
var inherit = __webpack_require__(24);
var yeast = __webpack_require__(199);
var debug = __webpack_require__(25)('engine.io-client:websocket');
var BrowserWebSocket = global.WebSocket || global.MozWebSocket;
var NodeWebSocket;
if (typeof window === 'undefined') {
  try {
    NodeWebSocket = __webpack_require__(398);
  } catch (e) { }
}

/**
 * Get either the `WebSocket` or `MozWebSocket` globals
 * in the browser or try to resolve WebSocket-compatible
 * interface exposed by `ws` for Node-like environment.
 */

var WebSocket = BrowserWebSocket;
if (!WebSocket && typeof window === 'undefined') {
  WebSocket = NodeWebSocket;
}

/**
 * Module exports.
 */

module.exports = WS;

/**
 * WebSocket transport constructor.
 *
 * @api {Object} connection options
 * @api public
 */

function WS (opts) {
  var forceBase64 = (opts && opts.forceBase64);
  if (forceBase64) {
    this.supportsBinary = false;
  }
  this.perMessageDeflate = opts.perMessageDeflate;
  this.usingBrowserWebSocket = BrowserWebSocket && !opts.forceNode;
  if (!this.usingBrowserWebSocket) {
    WebSocket = NodeWebSocket;
  }
  Transport.call(this, opts);
}

/**
 * Inherits from Transport.
 */

inherit(WS, Transport);

/**
 * Transport name.
 *
 * @api public
 */

WS.prototype.name = 'websocket';

/*
 * WebSockets support binary
 */

WS.prototype.supportsBinary = true;

/**
 * Opens socket.
 *
 * @api private
 */

WS.prototype.doOpen = function () {
  if (!this.check()) {
    // let probe timeout
    return;
  }

  var uri = this.uri();
  var protocols = void (0);
  var opts = {
    agent: this.agent,
    perMessageDeflate: this.perMessageDeflate
  };

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;
  if (this.extraHeaders) {
    opts.headers = this.extraHeaders;
  }
  if (this.localAddress) {
    opts.localAddress = this.localAddress;
  }

  try {
    this.ws = this.usingBrowserWebSocket ? new WebSocket(uri) : new WebSocket(uri, protocols, opts);
  } catch (err) {
    return this.emit('error', err);
  }

  if (this.ws.binaryType === undefined) {
    this.supportsBinary = false;
  }

  if (this.ws.supports && this.ws.supports.binary) {
    this.supportsBinary = true;
    this.ws.binaryType = 'nodebuffer';
  } else {
    this.ws.binaryType = 'arraybuffer';
  }

  this.addEventListeners();
};

/**
 * Adds event listeners to the socket
 *
 * @api private
 */

WS.prototype.addEventListeners = function () {
  var self = this;

  this.ws.onopen = function () {
    self.onOpen();
  };
  this.ws.onclose = function () {
    self.onClose();
  };
  this.ws.onmessage = function (ev) {
    self.onData(ev.data);
  };
  this.ws.onerror = function (e) {
    self.onError('websocket error', e);
  };
};

/**
 * Writes data to socket.
 *
 * @param {Array} array of packets.
 * @api private
 */

WS.prototype.write = function (packets) {
  var self = this;
  this.writable = false;

  // encodePacket efficient as it uses WS framing
  // no need for encodePayload
  var total = packets.length;
  for (var i = 0, l = total; i < l; i++) {
    (function (packet) {
      parser.encodePacket(packet, self.supportsBinary, function (data) {
        if (!self.usingBrowserWebSocket) {
          // always create a new object (GH-437)
          var opts = {};
          if (packet.options) {
            opts.compress = packet.options.compress;
          }

          if (self.perMessageDeflate) {
            var len = 'string' === typeof data ? global.Buffer.byteLength(data) : data.length;
            if (len < self.perMessageDeflate.threshold) {
              opts.compress = false;
            }
          }
        }

        // Sometimes the websocket has already been closed but the browser didn't
        // have a chance of informing us about it yet, in that case send will
        // throw an error
        try {
          if (self.usingBrowserWebSocket) {
            // TypeError is thrown when passing the second argument on Safari
            self.ws.send(data);
          } else {
            self.ws.send(data, opts);
          }
        } catch (e) {
          debug('websocket closed before onclose event');
        }

        --total || done();
      });
    })(packets[i]);
  }

  function done () {
    self.emit('flush');

    // fake drain
    // defer to next tick to allow Socket to clear writeBuffer
    setTimeout(function () {
      self.writable = true;
      self.emit('drain');
    }, 0);
  }
};

/**
 * Called upon close
 *
 * @api private
 */

WS.prototype.onClose = function () {
  Transport.prototype.onClose.call(this);
};

/**
 * Closes socket.
 *
 * @api private
 */

WS.prototype.doClose = function () {
  if (typeof this.ws !== 'undefined') {
    this.ws.close();
  }
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

WS.prototype.uri = function () {
  var query = this.query || {};
  var schema = this.secure ? 'wss' : 'ws';
  var port = '';

  // avoid port if default for schema
  if (this.port && (('wss' === schema && Number(this.port) !== 443) ||
    ('ws' === schema && Number(this.port) !== 80))) {
    port = ':' + this.port;
  }

  // append timestamp to URI
  if (this.timestampRequests) {
    query[this.timestampParam] = yeast();
  }

  // communicate binary support capabilities
  if (!this.supportsBinary) {
    query.b64 = 1;
  }

  query = parseqs.encode(query);

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  var ipv6 = this.hostname.indexOf(':') !== -1;
  return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
};

/**
 * Feature detection for WebSocket.
 *
 * @return {Boolean} whether this transport is available.
 * @api public
 */

WS.prototype.check = function () {
  return !!WebSocket && !('__initialize' in WebSocket && this.name === WS.prototype.name);
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 284 */
/***/ function(module, exports, __webpack_require__) {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug.debug = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = __webpack_require__(187);

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting
    args = exports.formatArgs.apply(self, args);

    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/[\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}


/***/ },
/* 285 */
/***/ function(module, exports) {


/**
 * Gets the keys for an object.
 *
 * @return {Array} keys
 * @api private
 */

module.exports = Object.keys || function keys (obj){
  var arr = [];
  var has = Object.prototype.hasOwnProperty;

  for (var i in obj) {
    if (has.call(obj, i)) {
      arr.push(i);
    }
  }
  return arr;
};


/***/ },
/* 286 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
// This file can be required in Browserify and Node.js for automatic polyfill
// To use it:  require('es6-promise/auto');

module.exports = __webpack_require__(42).polyfill();


/***/ },
/* 287 */,
/* 288 */
/***/ function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ },
/* 289 */
/***/ function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ },
/* 290 */
/***/ function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ },
/* 291 */
/***/ function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ },
/* 292 */
/***/ function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ },
/* 293 */
/***/ function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ },
/* 294 */
/***/ function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ },
/* 295 */
/***/ function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ },
/* 296 */
/***/ function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ },
/* 297 */
/***/ function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ },
/* 298 */
/***/ function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ },
/* 299 */
/***/ function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ },
/* 300 */
/***/ function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ },
/* 301 */
/***/ function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ },
/* 302 */
/***/ function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ },
/* 303 */,
/* 304 */,
/* 305 */,
/* 306 */,
/* 307 */,
/* 308 */
/***/ function(module, exports) {


/**
 * Module exports.
 *
 * Logic borrowed from Modernizr:
 *
 *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
 */

try {
  module.exports = typeof XMLHttpRequest !== 'undefined' &&
    'withCredentials' in new XMLHttpRequest();
} catch (err) {
  // if XMLHttp support is disabled in IE then it will throw
  // when trying to create
  module.exports = false;
}


/***/ },
/* 309 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var cookie = {
  create: function create(name, value, minutes, domain) {
    var expires = void 0;
    if (minutes) {
      var date = new Date();
      date.setTime(date.getTime() + minutes * 60 * 1000);
      expires = '; expires=' + date.toGMTString();
    } else expires = '';
    domain = domain ? 'domain=' + domain + ';' : '';
    document.cookie = name + '=' + value + expires + ';' + domain + 'path=/';
  },

  read: function read(name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  remove: function remove(name) {
    this.create(name, '', -1);
  }
};

exports.default = {
  name: 'cookie',

  lookup: function lookup(options) {
    var found = void 0;

    if (options.lookupCookie && typeof document !== 'undefined') {
      var c = cookie.read(options.lookupCookie);
      if (c) found = c;
    }

    return found;
  },
  cacheUserLanguage: function cacheUserLanguage(lng, options) {
    if (options.lookupCookie && typeof document !== 'undefined') {
      cookie.create(options.lookupCookie, lng, options.cookieMinutes, options.cookieDomain);
    }
  }
};

/***/ },
/* 310 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  name: 'htmlTag',

  lookup: function lookup(options) {
    var found = void 0;
    var htmlTag = options.htmlTag || (typeof document !== 'undefined' ? document.documentElement : null);

    if (htmlTag && typeof htmlTag.getAttribute === 'function') {
      found = htmlTag.getAttribute('lang');
    }

    return found;
  }
};

/***/ },
/* 311 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var hasLocalStorageSupport = void 0;
try {
  hasLocalStorageSupport = window !== 'undefined' && window.localStorage !== null;
  var testKey = 'i18next.translate.boo';
  window.localStorage.setItem(testKey, 'foo');
  window.localStorage.removeItem(testKey);
} catch (e) {
  hasLocalStorageSupport = false;
}

exports.default = {
  name: 'localStorage',

  lookup: function lookup(options) {
    var found = void 0;

    if (options.lookupLocalStorage && hasLocalStorageSupport) {
      var lng = window.localStorage.getItem(options.lookupLocalStorage);
      if (lng) found = lng;
    }

    return found;
  },
  cacheUserLanguage: function cacheUserLanguage(lng, options) {
    if (options.lookupLocalStorage && hasLocalStorageSupport) {
      window.localStorage.setItem(options.lookupLocalStorage, lng);
    }
  }
};

/***/ },
/* 312 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  name: 'navigator',

  lookup: function lookup(options) {
    var found = [];

    if (typeof navigator !== 'undefined') {
      if (navigator.languages) {
        // chrome only; not an array, so can't use .push.apply instead of iterating
        for (var i = 0; i < navigator.languages.length; i++) {
          found.push(navigator.languages[i]);
        }
      }
      if (navigator.userLanguage) {
        found.push(navigator.userLanguage);
      }
      if (navigator.language) {
        found.push(navigator.language);
      }
    }

    return found.length > 0 ? found : undefined;
  }
};

/***/ },
/* 313 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  name: 'querystring',

  lookup: function lookup(options) {
    var found = void 0;

    if (typeof window !== 'undefined') {
      var query = window.location.search.substring(1);
      var params = query.split('&');
      for (var i = 0; i < params.length; i++) {
        var pos = params[i].indexOf('=');
        if (pos > 0) {
          var key = params[i].substring(0, pos);
          if (key === options.lookupQuerystring) {
            found = params[i].substring(pos + 1);
          }
        }
      }
    }

    return found;
  }
};

/***/ },
/* 314 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = __webpack_require__(315);

var utils = _interopRequireWildcard(_utils);

var _cookie = __webpack_require__(309);

var _cookie2 = _interopRequireDefault(_cookie);

var _querystring = __webpack_require__(313);

var _querystring2 = _interopRequireDefault(_querystring);

var _localStorage = __webpack_require__(311);

var _localStorage2 = _interopRequireDefault(_localStorage);

var _navigator = __webpack_require__(312);

var _navigator2 = _interopRequireDefault(_navigator);

var _htmlTag = __webpack_require__(310);

var _htmlTag2 = _interopRequireDefault(_htmlTag);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function getDefaults() {
  return {
    order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
    lookupQuerystring: 'lng',
    lookupCookie: 'i18next',
    lookupLocalStorage: 'i18nextLng',

    // cache user language
    caches: ['localStorage']
    //cookieMinutes: 10,
    //cookieDomain: 'myDomain'
  };
}

var Browser = function () {
  function Browser(services) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Browser);

    this.type = 'languageDetector';
    this.detectors = {};

    this.init(services, options);
  }

  _createClass(Browser, [{
    key: 'init',
    value: function init(services) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var i18nOptions = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      this.services = services;
      this.options = utils.defaults(options, this.options || {}, getDefaults());
      this.i18nOptions = i18nOptions;

      this.addDetector(_cookie2.default);
      this.addDetector(_querystring2.default);
      this.addDetector(_localStorage2.default);
      this.addDetector(_navigator2.default);
      this.addDetector(_htmlTag2.default);
    }
  }, {
    key: 'addDetector',
    value: function addDetector(detector) {
      this.detectors[detector.name] = detector;
    }
  }, {
    key: 'detect',
    value: function detect(detectionOrder) {
      var _this = this;

      if (!detectionOrder) detectionOrder = this.options.order;

      var detected = [];
      detectionOrder.forEach(function (detectorName) {
        if (_this.detectors[detectorName]) {
          var lookup = _this.detectors[detectorName].lookup(_this.options);
          if (lookup && typeof lookup === 'string') lookup = [lookup];
          if (lookup) detected = detected.concat(lookup);
        }
      });

      var found = void 0;
      detected.forEach(function (lng) {
        if (found) return;
        var cleanedLng = _this.services.languageUtils.formatLanguageCode(lng);
        if (_this.services.languageUtils.isWhitelisted(cleanedLng)) found = cleanedLng;
      });

      return found || this.i18nOptions.fallbackLng[0];
    }
  }, {
    key: 'cacheUserLanguage',
    value: function cacheUserLanguage(lng, caches) {
      var _this2 = this;

      if (!caches) caches = this.options.caches;
      if (!caches) return;
      caches.forEach(function (cacheName) {
        if (_this2.detectors[cacheName]) _this2.detectors[cacheName].cacheUserLanguage(lng, _this2.options);
      });
    }
  }]);

  return Browser;
}();

Browser.type = 'languageDetector';

exports.default = Browser;

/***/ },
/* 315 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaults = defaults;
exports.extend = extend;
var arr = [];
var each = arr.forEach;
var slice = arr.slice;

function defaults(obj) {
  each.call(slice.call(arguments, 1), function (source) {
    if (source) {
      for (var prop in source) {
        if (obj[prop] === undefined) obj[prop] = source[prop];
      }
    }
  });
  return obj;
}

function extend(obj) {
  each.call(slice.call(arguments, 1), function (source) {
    if (source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    }
  });
  return obj;
}

/***/ },
/* 316 */
/***/ function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(314).default;


/***/ },
/* 317 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// https://gist.github.com/Xeoncross/7663273
function ajax(url, options, callback, data, cache) {
  // Must encode data
  if (data && (typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object') {
    var y = '',
        e = encodeURIComponent;
    for (var m in data) {
      y += '&' + e(m) + '=' + e(data[m]);
    }
    data = y.slice(1) + (!cache ? '&_t=' + new Date() : '');
  }

  try {
    var x = new (XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
    x.open(data ? 'POST' : 'GET', url, 1);
    if (!options.crossDomain) {
      x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    }
    x.withCredentials = !!options.withCredentials;
    if (data) {
      x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    x.onreadystatechange = function () {
      x.readyState > 3 && callback && callback(x.responseText, x);
    };
    x.send(data);
  } catch (e) {
    window.console && console.log(e);
  }
}

exports.default = ajax;

/***/ },
/* 318 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = __webpack_require__(319);

var utils = _interopRequireWildcard(_utils);

var _ajax = __webpack_require__(317);

var _ajax2 = _interopRequireDefault(_ajax);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function getDefaults() {
  return {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
    addPath: 'locales/add/{{lng}}/{{ns}}',
    allowMultiLoading: false,
    parse: JSON.parse,
    crossDomain: false,
    ajax: _ajax2.default
  };
}

var Backend = function () {
  function Backend(services) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Backend);

    this.init(services, options);

    this.type = 'backend';
  }

  _createClass(Backend, [{
    key: 'init',
    value: function init(services) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      this.services = services;
      this.options = utils.defaults(options, this.options || {}, getDefaults());
    }
  }, {
    key: 'readMulti',
    value: function readMulti(languages, namespaces, callback) {
      var loadPath = this.options.loadPath;
      if (typeof this.options.loadPath === 'function') {
        loadPath = this.options.loadPath(languages, namespaces);
      }

      var url = this.services.interpolator.interpolate(loadPath, { lng: languages.join('+'), ns: namespaces.join('+') });

      this.loadUrl(url, callback);
    }
  }, {
    key: 'read',
    value: function read(language, namespace, callback) {
      var loadPath = this.options.loadPath;
      if (typeof this.options.loadPath === 'function') {
        loadPath = this.options.loadPath([language], [namespace]);
      }

      var url = this.services.interpolator.interpolate(loadPath, { lng: language, ns: namespace });

      this.loadUrl(url, callback);
    }
  }, {
    key: 'loadUrl',
    value: function loadUrl(url, callback) {
      var _this = this;

      this.options.ajax(url, this.options, function (data, xhr) {
        if (xhr.status >= 500 && xhr.status < 600) return callback('failed loading ' + url, true /* retry */);
        if (xhr.status >= 400 && xhr.status < 500) return callback('failed loading ' + url, false /* no retry */);

        var ret = void 0,
            err = void 0;
        try {
          ret = _this.options.parse(data, url);
        } catch (e) {
          err = 'failed parsing ' + url + ' to json';
        }
        if (err) return callback(err, false);
        callback(null, ret);
      });
    }
  }, {
    key: 'create',
    value: function create(languages, namespace, key, fallbackValue) {
      var _this2 = this;

      if (typeof languages === 'string') languages = [languages];

      var payload = {};
      payload[key] = fallbackValue || '';

      languages.forEach(function (lng) {
        var url = _this2.services.interpolator.interpolate(_this2.options.addPath, { lng: lng, ns: namespace });

        _this2.options.ajax(url, _this2.options, function (data, xhr) {
          //const statusCode = xhr.status.toString();
          // TODO: if statusCode === 4xx do log
        }, payload);
      });
    }
  }]);

  return Backend;
}();

Backend.type = 'backend';

exports.default = Backend;

/***/ },
/* 319 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaults = defaults;
exports.extend = extend;
var arr = [];
var each = arr.forEach;
var slice = arr.slice;

function defaults(obj) {
  each.call(slice.call(arguments, 1), function (source) {
    if (source) {
      for (var prop in source) {
        if (obj[prop] === undefined) obj[prop] = source[prop];
      }
    }
  });
  return obj;
}

function extend(obj) {
  each.call(slice.call(arguments, 1), function (source) {
    if (source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    }
  });
  return obj;
}

/***/ },
/* 320 */
/***/ function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(318).default;


/***/ },
/* 321 */,
/* 322 */,
/* 323 */,
/* 324 */,
/* 325 */,
/* 326 */,
/* 327 */,
/* 328 */,
/* 329 */,
/* 330 */,
/* 331 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module, global) {var __WEBPACK_AMD_DEFINE_RESULT__;/*! JSON v3.3.2 | http://bestiejs.github.io/json3 | Copyright 2012-2014, Kit Cambridge | http://kit.mit-license.org */
;(function () {
  // Detect the `define` function exposed by asynchronous module loaders. The
  // strict `define` check is necessary for compatibility with `r.js`.
  var isLoader = "function" === "function" && __webpack_require__(396);

  // A set of types used to distinguish objects from primitives.
  var objectTypes = {
    "function": true,
    "object": true
  };

  // Detect the `exports` object exposed by CommonJS implementations.
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  // Use the `global` object exposed by Node (including Browserify via
  // `insert-module-globals`), Narwhal, and Ringo as the default context,
  // and the `window` object in browsers. Rhino exports a `global` function
  // instead.
  var root = objectTypes[typeof window] && window || this,
      freeGlobal = freeExports && objectTypes[typeof module] && module && !module.nodeType && typeof global == "object" && global;

  if (freeGlobal && (freeGlobal["global"] === freeGlobal || freeGlobal["window"] === freeGlobal || freeGlobal["self"] === freeGlobal)) {
    root = freeGlobal;
  }

  // Public: Initializes JSON 3 using the given `context` object, attaching the
  // `stringify` and `parse` functions to the specified `exports` object.
  function runInContext(context, exports) {
    context || (context = root["Object"]());
    exports || (exports = root["Object"]());

    // Native constructor aliases.
    var Number = context["Number"] || root["Number"],
        String = context["String"] || root["String"],
        Object = context["Object"] || root["Object"],
        Date = context["Date"] || root["Date"],
        SyntaxError = context["SyntaxError"] || root["SyntaxError"],
        TypeError = context["TypeError"] || root["TypeError"],
        Math = context["Math"] || root["Math"],
        nativeJSON = context["JSON"] || root["JSON"];

    // Delegate to the native `stringify` and `parse` implementations.
    if (typeof nativeJSON == "object" && nativeJSON) {
      exports.stringify = nativeJSON.stringify;
      exports.parse = nativeJSON.parse;
    }

    // Convenience aliases.
    var objectProto = Object.prototype,
        getClass = objectProto.toString,
        isProperty, forEach, undef;

    // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
    var isExtended = new Date(-3509827334573292);
    try {
      // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
      // results for certain dates in Opera >= 10.53.
      isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
        // Safari < 2.0.2 stores the internal millisecond time value correctly,
        // but clips the values returned by the date methods to the range of
        // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
        isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
    } catch (exception) {}

    // Internal: Determines whether the native `JSON.stringify` and `parse`
    // implementations are spec-compliant. Based on work by Ken Snyder.
    function has(name) {
      if (has[name] !== undef) {
        // Return cached feature test result.
        return has[name];
      }
      var isSupported;
      if (name == "bug-string-char-index") {
        // IE <= 7 doesn't support accessing string characters using square
        // bracket notation. IE 8 only supports this for primitives.
        isSupported = "a"[0] != "a";
      } else if (name == "json") {
        // Indicates whether both `JSON.stringify` and `JSON.parse` are
        // supported.
        isSupported = has("json-stringify") && has("json-parse");
      } else {
        var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
        // Test `JSON.stringify`.
        if (name == "json-stringify") {
          var stringify = exports.stringify, stringifySupported = typeof stringify == "function" && isExtended;
          if (stringifySupported) {
            // A test function object with a custom `toJSON` method.
            (value = function () {
              return 1;
            }).toJSON = value;
            try {
              stringifySupported =
                // Firefox 3.1b1 and b2 serialize string, number, and boolean
                // primitives as object literals.
                stringify(0) === "0" &&
                // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
                // literals.
                stringify(new Number()) === "0" &&
                stringify(new String()) == '""' &&
                // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
                // does not define a canonical JSON representation (this applies to
                // objects with `toJSON` properties as well, *unless* they are nested
                // within an object or array).
                stringify(getClass) === undef &&
                // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
                // FF 3.1b3 pass this test.
                stringify(undef) === undef &&
                // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
                // respectively, if the value is omitted entirely.
                stringify() === undef &&
                // FF 3.1b1, 2 throw an error if the given value is not a number,
                // string, array, object, Boolean, or `null` literal. This applies to
                // objects with custom `toJSON` methods as well, unless they are nested
                // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
                // methods entirely.
                stringify(value) === "1" &&
                stringify([value]) == "[1]" &&
                // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
                // `"[null]"`.
                stringify([undef]) == "[null]" &&
                // YUI 3.0.0b1 fails to serialize `null` literals.
                stringify(null) == "null" &&
                // FF 3.1b1, 2 halts serialization if an array contains a function:
                // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
                // elides non-JSON values from objects and arrays, unless they
                // define custom `toJSON` methods.
                stringify([undef, getClass, null]) == "[null,null,null]" &&
                // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
                // where character escape codes are expected (e.g., `\b` => `\u0008`).
                stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
                // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
                stringify(null, value) === "1" &&
                stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
                // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
                // serialize extended years.
                stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
                // The milliseconds are optional in ES 5, but required in 5.1.
                stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
                // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
                // four-digit years instead of six-digit years. Credits: @Yaffle.
                stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
                // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
                // values less than 1000. Credits: @Yaffle.
                stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
            } catch (exception) {
              stringifySupported = false;
            }
          }
          isSupported = stringifySupported;
        }
        // Test `JSON.parse`.
        if (name == "json-parse") {
          var parse = exports.parse;
          if (typeof parse == "function") {
            try {
              // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
              // Conforming implementations should also coerce the initial argument to
              // a string prior to parsing.
              if (parse("0") === 0 && !parse(false)) {
                // Simple parsing test.
                value = parse(serialized);
                var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
                if (parseSupported) {
                  try {
                    // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                    parseSupported = !parse('"\t"');
                  } catch (exception) {}
                  if (parseSupported) {
                    try {
                      // FF 4.0 and 4.0.1 allow leading `+` signs and leading
                      // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
                      // certain octal literals.
                      parseSupported = parse("01") !== 1;
                    } catch (exception) {}
                  }
                  if (parseSupported) {
                    try {
                      // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
                      // points. These environments, along with FF 3.1b1 and 2,
                      // also allow trailing commas in JSON objects and arrays.
                      parseSupported = parse("1.") !== 1;
                    } catch (exception) {}
                  }
                }
              }
            } catch (exception) {
              parseSupported = false;
            }
          }
          isSupported = parseSupported;
        }
      }
      return has[name] = !!isSupported;
    }

    if (!has("json")) {
      // Common `[[Class]]` name aliases.
      var functionClass = "[object Function]",
          dateClass = "[object Date]",
          numberClass = "[object Number]",
          stringClass = "[object String]",
          arrayClass = "[object Array]",
          booleanClass = "[object Boolean]";

      // Detect incomplete support for accessing string characters by index.
      var charIndexBuggy = has("bug-string-char-index");

      // Define additional utility methods if the `Date` methods are buggy.
      if (!isExtended) {
        var floor = Math.floor;
        // A mapping between the months of the year and the number of days between
        // January 1st and the first of the respective month.
        var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        // Internal: Calculates the number of days between the Unix epoch and the
        // first day of the given month.
        var getDay = function (year, month) {
          return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
        };
      }

      // Internal: Determines if a property is a direct property of the given
      // object. Delegates to the native `Object#hasOwnProperty` method.
      if (!(isProperty = objectProto.hasOwnProperty)) {
        isProperty = function (property) {
          var members = {}, constructor;
          if ((members.__proto__ = null, members.__proto__ = {
            // The *proto* property cannot be set multiple times in recent
            // versions of Firefox and SeaMonkey.
            "toString": 1
          }, members).toString != getClass) {
            // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
            // supports the mutable *proto* property.
            isProperty = function (property) {
              // Capture and break the object's prototype chain (see section 8.6.2
              // of the ES 5.1 spec). The parenthesized expression prevents an
              // unsafe transformation by the Closure Compiler.
              var original = this.__proto__, result = property in (this.__proto__ = null, this);
              // Restore the original prototype chain.
              this.__proto__ = original;
              return result;
            };
          } else {
            // Capture a reference to the top-level `Object` constructor.
            constructor = members.constructor;
            // Use the `constructor` property to simulate `Object#hasOwnProperty` in
            // other environments.
            isProperty = function (property) {
              var parent = (this.constructor || constructor).prototype;
              return property in this && !(property in parent && this[property] === parent[property]);
            };
          }
          members = null;
          return isProperty.call(this, property);
        };
      }

      // Internal: Normalizes the `for...in` iteration algorithm across
      // environments. Each enumerated key is yielded to a `callback` function.
      forEach = function (object, callback) {
        var size = 0, Properties, members, property;

        // Tests for bugs in the current environment's `for...in` algorithm. The
        // `valueOf` property inherits the non-enumerable flag from
        // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
        (Properties = function () {
          this.valueOf = 0;
        }).prototype.valueOf = 0;

        // Iterate over a new instance of the `Properties` class.
        members = new Properties();
        for (property in members) {
          // Ignore all properties inherited from `Object.prototype`.
          if (isProperty.call(members, property)) {
            size++;
          }
        }
        Properties = members = null;

        // Normalize the iteration algorithm.
        if (!size) {
          // A list of non-enumerable properties inherited from `Object.prototype`.
          members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
          // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
          // properties.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, length;
            var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;
            for (property in object) {
              // Gecko <= 1.0 enumerates the `prototype` property of functions under
              // certain conditions; IE does not.
              if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
                callback(property);
              }
            }
            // Manually invoke the callback for each non-enumerable property.
            for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
          };
        } else if (size == 2) {
          // Safari <= 2.0.4 enumerates shadowed properties twice.
          forEach = function (object, callback) {
            // Create a set of iterated properties.
            var members = {}, isFunction = getClass.call(object) == functionClass, property;
            for (property in object) {
              // Store each property name to prevent double enumeration. The
              // `prototype` property of functions is not enumerated due to cross-
              // environment inconsistencies.
              if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
                callback(property);
              }
            }
          };
        } else {
          // No bugs detected; use the standard `for...in` algorithm.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, isConstructor;
            for (property in object) {
              if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
                callback(property);
              }
            }
            // Manually invoke the callback for the `constructor` property due to
            // cross-environment inconsistencies.
            if (isConstructor || isProperty.call(object, (property = "constructor"))) {
              callback(property);
            }
          };
        }
        return forEach(object, callback);
      };

      // Public: Serializes a JavaScript `value` as a JSON string. The optional
      // `filter` argument may specify either a function that alters how object and
      // array members are serialized, or an array of strings and numbers that
      // indicates which properties should be serialized. The optional `width`
      // argument may be either a string or number that specifies the indentation
      // level of the output.
      if (!has("json-stringify")) {
        // Internal: A map of control characters and their escaped equivalents.
        var Escapes = {
          92: "\\\\",
          34: '\\"',
          8: "\\b",
          12: "\\f",
          10: "\\n",
          13: "\\r",
          9: "\\t"
        };

        // Internal: Converts `value` into a zero-padded string such that its
        // length is at least equal to `width`. The `width` must be <= 6.
        var leadingZeroes = "000000";
        var toPaddedString = function (width, value) {
          // The `|| 0` expression is necessary to work around a bug in
          // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
          return (leadingZeroes + (value || 0)).slice(-width);
        };

        // Internal: Double-quotes a string `value`, replacing all ASCII control
        // characters (characters with code unit values between 0 and 31) with
        // their escaped equivalents. This is an implementation of the
        // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
        var unicodePrefix = "\\u00";
        var quote = function (value) {
          var result = '"', index = 0, length = value.length, useCharIndex = !charIndexBuggy || length > 10;
          var symbols = useCharIndex && (charIndexBuggy ? value.split("") : value);
          for (; index < length; index++) {
            var charCode = value.charCodeAt(index);
            // If the character is a control character, append its Unicode or
            // shorthand escape sequence; otherwise, append the character as-is.
            switch (charCode) {
              case 8: case 9: case 10: case 12: case 13: case 34: case 92:
                result += Escapes[charCode];
                break;
              default:
                if (charCode < 32) {
                  result += unicodePrefix + toPaddedString(2, charCode.toString(16));
                  break;
                }
                result += useCharIndex ? symbols[index] : value.charAt(index);
            }
          }
          return result + '"';
        };

        // Internal: Recursively serializes an object. Implements the
        // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
        var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
          var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
          try {
            // Necessary for host object support.
            value = object[property];
          } catch (exception) {}
          if (typeof value == "object" && value) {
            className = getClass.call(value);
            if (className == dateClass && !isProperty.call(value, "toJSON")) {
              if (value > -1 / 0 && value < 1 / 0) {
                // Dates are serialized according to the `Date#toJSON` method
                // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
                // for the ISO 8601 date time string format.
                if (getDay) {
                  // Manually compute the year, month, date, hours, minutes,
                  // seconds, and milliseconds if the `getUTC*` methods are
                  // buggy. Adapted from @Yaffle's `date-shim` project.
                  date = floor(value / 864e5);
                  for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
                  for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
                  date = 1 + date - getDay(year, month);
                  // The `time` value specifies the time within the day (see ES
                  // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
                  // to compute `A modulo B`, as the `%` operator does not
                  // correspond to the `modulo` operation for negative numbers.
                  time = (value % 864e5 + 864e5) % 864e5;
                  // The hours, minutes, seconds, and milliseconds are obtained by
                  // decomposing the time within the day. See section 15.9.1.10.
                  hours = floor(time / 36e5) % 24;
                  minutes = floor(time / 6e4) % 60;
                  seconds = floor(time / 1e3) % 60;
                  milliseconds = time % 1e3;
                } else {
                  year = value.getUTCFullYear();
                  month = value.getUTCMonth();
                  date = value.getUTCDate();
                  hours = value.getUTCHours();
                  minutes = value.getUTCMinutes();
                  seconds = value.getUTCSeconds();
                  milliseconds = value.getUTCMilliseconds();
                }
                // Serialize extended years correctly.
                value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
                  "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
                  // Months, dates, hours, minutes, and seconds should have two
                  // digits; milliseconds should have three.
                  "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
                  // Milliseconds are optional in ES 5.0, but required in 5.1.
                  "." + toPaddedString(3, milliseconds) + "Z";
              } else {
                value = null;
              }
            } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
              // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
              // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
              // ignores all `toJSON` methods on these objects unless they are
              // defined directly on an instance.
              value = value.toJSON(property);
            }
          }
          if (callback) {
            // If a replacement function was provided, call it to obtain the value
            // for serialization.
            value = callback.call(object, property, value);
          }
          if (value === null) {
            return "null";
          }
          className = getClass.call(value);
          if (className == booleanClass) {
            // Booleans are represented literally.
            return "" + value;
          } else if (className == numberClass) {
            // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
            // `"null"`.
            return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
          } else if (className == stringClass) {
            // Strings are double-quoted and escaped.
            return quote("" + value);
          }
          // Recursively serialize objects and arrays.
          if (typeof value == "object") {
            // Check for cyclic structures. This is a linear search; performance
            // is inversely proportional to the number of unique nested objects.
            for (length = stack.length; length--;) {
              if (stack[length] === value) {
                // Cyclic structures cannot be serialized by `JSON.stringify`.
                throw TypeError();
              }
            }
            // Add the object to the stack of traversed objects.
            stack.push(value);
            results = [];
            // Save the current indentation level and indent one additional level.
            prefix = indentation;
            indentation += whitespace;
            if (className == arrayClass) {
              // Recursively serialize array elements.
              for (index = 0, length = value.length; index < length; index++) {
                element = serialize(index, value, callback, properties, whitespace, indentation, stack);
                results.push(element === undef ? "null" : element);
              }
              result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
            } else {
              // Recursively serialize object members. Members are selected from
              // either a user-specified list of property names, or the object
              // itself.
              forEach(properties || value, function (property) {
                var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
                if (element !== undef) {
                  // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                  // is not the empty string, let `member` {quote(property) + ":"}
                  // be the concatenation of `member` and the `space` character."
                  // The "`space` character" refers to the literal space
                  // character, not the `space` {width} argument provided to
                  // `JSON.stringify`.
                  results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
                }
              });
              result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
            }
            // Remove the object from the traversed object stack.
            stack.pop();
            return result;
          }
        };

        // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
        exports.stringify = function (source, filter, width) {
          var whitespace, callback, properties, className;
          if (objectTypes[typeof filter] && filter) {
            if ((className = getClass.call(filter)) == functionClass) {
              callback = filter;
            } else if (className == arrayClass) {
              // Convert the property names array into a makeshift set.
              properties = {};
              for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((className = getClass.call(value)), className == stringClass || className == numberClass) && (properties[value] = 1));
            }
          }
          if (width) {
            if ((className = getClass.call(width)) == numberClass) {
              // Convert the `width` to an integer and create a string containing
              // `width` number of space characters.
              if ((width -= width % 1) > 0) {
                for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
              }
            } else if (className == stringClass) {
              whitespace = width.length <= 10 ? width : width.slice(0, 10);
            }
          }
          // Opera <= 7.54u2 discards the values associated with empty string keys
          // (`""`) only if they are used directly within an object member list
          // (e.g., `!("" in { "": 1})`).
          return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
        };
      }

      // Public: Parses a JSON source string.
      if (!has("json-parse")) {
        var fromCharCode = String.fromCharCode;

        // Internal: A map of escaped control characters and their unescaped
        // equivalents.
        var Unescapes = {
          92: "\\",
          34: '"',
          47: "/",
          98: "\b",
          116: "\t",
          110: "\n",
          102: "\f",
          114: "\r"
        };

        // Internal: Stores the parser state.
        var Index, Source;

        // Internal: Resets the parser state and throws a `SyntaxError`.
        var abort = function () {
          Index = Source = null;
          throw SyntaxError();
        };

        // Internal: Returns the next token, or `"$"` if the parser has reached
        // the end of the source string. A token may be a string, number, `null`
        // literal, or Boolean literal.
        var lex = function () {
          var source = Source, length = source.length, value, begin, position, isSigned, charCode;
          while (Index < length) {
            charCode = source.charCodeAt(Index);
            switch (charCode) {
              case 9: case 10: case 13: case 32:
                // Skip whitespace tokens, including tabs, carriage returns, line
                // feeds, and space characters.
                Index++;
                break;
              case 123: case 125: case 91: case 93: case 58: case 44:
                // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
                // the current position.
                value = charIndexBuggy ? source.charAt(Index) : source[Index];
                Index++;
                return value;
              case 34:
                // `"` delimits a JSON string; advance to the next character and
                // begin parsing the string. String tokens are prefixed with the
                // sentinel `@` character to distinguish them from punctuators and
                // end-of-string tokens.
                for (value = "@", Index++; Index < length;) {
                  charCode = source.charCodeAt(Index);
                  if (charCode < 32) {
                    // Unescaped ASCII control characters (those with a code unit
                    // less than the space character) are not permitted.
                    abort();
                  } else if (charCode == 92) {
                    // A reverse solidus (`\`) marks the beginning of an escaped
                    // control character (including `"`, `\`, and `/`) or Unicode
                    // escape sequence.
                    charCode = source.charCodeAt(++Index);
                    switch (charCode) {
                      case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
                        // Revive escaped control characters.
                        value += Unescapes[charCode];
                        Index++;
                        break;
                      case 117:
                        // `\u` marks the beginning of a Unicode escape sequence.
                        // Advance to the first character and validate the
                        // four-digit code point.
                        begin = ++Index;
                        for (position = Index + 4; Index < position; Index++) {
                          charCode = source.charCodeAt(Index);
                          // A valid sequence comprises four hexdigits (case-
                          // insensitive) that form a single hexadecimal value.
                          if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                            // Invalid Unicode escape sequence.
                            abort();
                          }
                        }
                        // Revive the escaped character.
                        value += fromCharCode("0x" + source.slice(begin, Index));
                        break;
                      default:
                        // Invalid escape sequence.
                        abort();
                    }
                  } else {
                    if (charCode == 34) {
                      // An unescaped double-quote character marks the end of the
                      // string.
                      break;
                    }
                    charCode = source.charCodeAt(Index);
                    begin = Index;
                    // Optimize for the common case where a string is valid.
                    while (charCode >= 32 && charCode != 92 && charCode != 34) {
                      charCode = source.charCodeAt(++Index);
                    }
                    // Append the string as-is.
                    value += source.slice(begin, Index);
                  }
                }
                if (source.charCodeAt(Index) == 34) {
                  // Advance to the next character and return the revived string.
                  Index++;
                  return value;
                }
                // Unterminated string.
                abort();
              default:
                // Parse numbers and literals.
                begin = Index;
                // Advance past the negative sign, if one is specified.
                if (charCode == 45) {
                  isSigned = true;
                  charCode = source.charCodeAt(++Index);
                }
                // Parse an integer or floating-point value.
                if (charCode >= 48 && charCode <= 57) {
                  // Leading zeroes are interpreted as octal literals.
                  if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
                    // Illegal octal literal.
                    abort();
                  }
                  isSigned = false;
                  // Parse the integer component.
                  for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
                  // Floats cannot contain a leading decimal point; however, this
                  // case is already accounted for by the parser.
                  if (source.charCodeAt(Index) == 46) {
                    position = ++Index;
                    // Parse the decimal component.
                    for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal trailing decimal.
                      abort();
                    }
                    Index = position;
                  }
                  // Parse exponents. The `e` denoting the exponent is
                  // case-insensitive.
                  charCode = source.charCodeAt(Index);
                  if (charCode == 101 || charCode == 69) {
                    charCode = source.charCodeAt(++Index);
                    // Skip past the sign following the exponent, if one is
                    // specified.
                    if (charCode == 43 || charCode == 45) {
                      Index++;
                    }
                    // Parse the exponential component.
                    for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal empty exponent.
                      abort();
                    }
                    Index = position;
                  }
                  // Coerce the parsed value to a JavaScript number.
                  return +source.slice(begin, Index);
                }
                // A negative sign may only precede numbers.
                if (isSigned) {
                  abort();
                }
                // `true`, `false`, and `null` literals.
                if (source.slice(Index, Index + 4) == "true") {
                  Index += 4;
                  return true;
                } else if (source.slice(Index, Index + 5) == "false") {
                  Index += 5;
                  return false;
                } else if (source.slice(Index, Index + 4) == "null") {
                  Index += 4;
                  return null;
                }
                // Unrecognized token.
                abort();
            }
          }
          // Return the sentinel `$` character if the parser has reached the end
          // of the source string.
          return "$";
        };

        // Internal: Parses a JSON `value` token.
        var get = function (value) {
          var results, hasMembers;
          if (value == "$") {
            // Unexpected end of input.
            abort();
          }
          if (typeof value == "string") {
            if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
              // Remove the sentinel `@` character.
              return value.slice(1);
            }
            // Parse object and array literals.
            if (value == "[") {
              // Parses a JSON array, returning a new JavaScript array.
              results = [];
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing square bracket marks the end of the array literal.
                if (value == "]") {
                  break;
                }
                // If the array literal contains elements, the current token
                // should be a comma separating the previous element from the
                // next.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "]") {
                      // Unexpected trailing `,` in array literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each array element.
                    abort();
                  }
                }
                // Elisions and leading commas are not permitted.
                if (value == ",") {
                  abort();
                }
                results.push(get(value));
              }
              return results;
            } else if (value == "{") {
              // Parses a JSON object, returning a new JavaScript object.
              results = {};
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing curly brace marks the end of the object literal.
                if (value == "}") {
                  break;
                }
                // If the object literal contains members, the current token
                // should be a comma separator.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "}") {
                      // Unexpected trailing `,` in object literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each object member.
                    abort();
                  }
                }
                // Leading commas are not permitted, object property names must be
                // double-quoted strings, and a `:` must separate each property
                // name and value.
                if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                  abort();
                }
                results[value.slice(1)] = get(lex());
              }
              return results;
            }
            // Unexpected token encountered.
            abort();
          }
          return value;
        };

        // Internal: Updates a traversed object member.
        var update = function (source, property, callback) {
          var element = walk(source, property, callback);
          if (element === undef) {
            delete source[property];
          } else {
            source[property] = element;
          }
        };

        // Internal: Recursively traverses a parsed JSON object, invoking the
        // `callback` function for each value. This is an implementation of the
        // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
        var walk = function (source, property, callback) {
          var value = source[property], length;
          if (typeof value == "object" && value) {
            // `forEach` can't be used to traverse an array in Opera <= 8.54
            // because its `Object#hasOwnProperty` implementation returns `false`
            // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
            if (getClass.call(value) == arrayClass) {
              for (length = value.length; length--;) {
                update(value, length, callback);
              }
            } else {
              forEach(value, function (property) {
                update(value, property, callback);
              });
            }
          }
          return callback.call(source, property, value);
        };

        // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
        exports.parse = function (source, callback) {
          var result, value;
          Index = 0;
          Source = "" + source;
          result = get(lex());
          // If a JSON string contains multiple tokens, it is invalid.
          if (lex() != "$") {
            abort();
          }
          // Reset the parser state.
          Index = Source = null;
          return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
        };
      }
    }

    exports["runInContext"] = runInContext;
    return exports;
  }

  if (freeExports && !isLoader) {
    // Export for CommonJS environments.
    runInContext(root, freeExports);
  } else {
    // Export for web browsers and JavaScript engines.
    var nativeJSON = root.JSON,
        previousJSON = root["JSON3"],
        isRestored = false;

    var JSON3 = runInContext(root, (root["JSON3"] = {
      // Public: Restores the original value of the global `JSON` object and
      // returns a reference to the `JSON3` object.
      "noConflict": function () {
        if (!isRestored) {
          isRestored = true;
          root.JSON = nativeJSON;
          root["JSON3"] = previousJSON;
          nativeJSON = previousJSON = null;
        }
        return JSON3;
      }
    }));

    root.JSON = {
      "parse": JSON3.parse,
      "stringify": JSON3.stringify
    };
  }

  // Export for asynchronous module loaders.
  if (isLoader) {
    !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
      return JSON3;
    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  }
}).call(this);

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)(module), __webpack_require__(1)))

/***/ },
/* 332 */,
/* 333 */,
/* 334 */,
/* 335 */,
/* 336 */,
/* 337 */,
/* 338 */,
/* 339 */,
/* 340 */,
/* 341 */,
/* 342 */,
/* 343 */,
/* 344 */,
/* 345 */,
/* 346 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/**
 * marked - a markdown parser
 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

;(function() {

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  nptable: noop,
  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: noop,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
  ('def', '\\n+(?=' + block.def.source + ')')
  ();

block.blockquote = replace(block.blockquote)
  ('def', block.def)
  ();

block._tag = '(?!(?:'
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

block.html = replace(block.html)
  ('comment', /<!--[\s\S]*?-->/)
  ('closed', /<(tag)[\s\S]+?<\/\1>/)
  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
  (/tag/g, block._tag)
  ();

block.paragraph = replace(block.paragraph)
  ('hr', block.hr)
  ('heading', block.heading)
  ('lheading', block.lheading)
  ('blockquote', block.blockquote)
  ('tag', '<' + block._tag)
  ('def', block.def)
  ();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
  fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/,
  paragraph: /^/,
  heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
});

block.gfm.paragraph = replace(block.paragraph)
  ('(?!', '(?!'
    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
    + block.list.source.replace('\\1', '\\3') + '|')
  ();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

/**
 * Block Lexer
 */

function Lexer(options) {
  this.tokens = [];
  this.tokens.links = {};
  this.options = options || marked.defaults;
  this.rules = block.normal;

  if (this.options.gfm) {
    if (this.options.tables) {
      this.rules = block.tables;
    } else {
      this.rules = block.gfm;
    }
  }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.lex = function(src, options) {
  var lexer = new Lexer(options);
  return lexer.lex(src);
};

/**
 * Preprocessing
 */

Lexer.prototype.lex = function(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function(src, top, bq) {
  var src = src.replace(/^ +$/gm, '')
    , next
    , loose
    , cap
    , bull
    , b
    , item
    , space
    , i
    , l;

  while (src) {
    // newline
    if (cap = this.rules.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        this.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this.tokens.push({
        type: 'code',
        text: !this.options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3] || ''
      });
      continue;
    }

    // heading
    if (cap = this.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // table no leading pipe (gfm)
    if (top && (cap = this.rules.nptable.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i].split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // lheading
    if (cap = this.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = this.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this.token(cap, top, true);

      this.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this.rules.list.exec(src)) {
      src = src.substring(cap[0].length);
      bull = cap[2];

      this.tokens.push({
        type: 'list_start',
        ordered: bull.length > 1
      });

      // Get each top-level item.
      cap = cap[0].match(this.rules.item);

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (this.options.smartLists && i !== l - 1) {
          b = block.bullet.exec(cap[i + 1])[0];
          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item.charAt(item.length - 1) === '\n';
          if (!loose) loose = next;
        }

        this.tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        this.token(item, false, bq);

        this.tokens.push({
          type: 'list_item_end'
        });
      }

      this.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = this.rules.html.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: this.options.sanitize
          ? 'paragraph'
          : 'html',
        pre: !this.options.sanitizer
          && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
        text: cap[0]
      });
      continue;
    }

    // def
    if ((!bq && top) && (cap = this.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // table (gfm)
    if (top && (cap = this.rules.table.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i]
          .replace(/^ *\| *| *\| *$/g, '')
          .split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // top-level paragraph
    if (top && (cap = this.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'paragraph',
        text: cap[1].charAt(cap[1].length - 1) === '\n'
          ? cap[1].slice(0, -1)
          : cap[1]
      });
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._inside)
  ('href', inline._href)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._inside)
  ();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: replace(inline.escape)('])', '~|])')(),
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: replace(inline.text)
    (']|', '~]|')
    ('|', '|https?://|')
    ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
  br: replace(inline.br)('{2,}', '*')(),
  text: replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, options) {
  this.options = options || marked.defaults;
  this.links = links;
  this.rules = inline.normal;
  this.renderer = this.options.renderer || new Renderer;
  this.renderer.options = this.options;

  if (!this.links) {
    throw new
      Error('Tokens array requires a `links` property.');
  }

  if (this.options.gfm) {
    if (this.options.breaks) {
      this.rules = inline.breaks;
    } else {
      this.rules = inline.gfm;
    }
  } else if (this.options.pedantic) {
    this.rules = inline.pedantic;
  }
}

/**
 * Expose Inline Rules
 */

InlineLexer.rules = inline;

/**
 * Static Lexing/Compiling Method
 */

InlineLexer.output = function(src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.output(src);
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function(src) {
  var out = ''
    , link
    , text
    , href
    , cap;

  while (src) {
    // escape
    if (cap = this.rules.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += cap[1];
      continue;
    }

    // autolink
    if (cap = this.rules.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = cap[1].charAt(6) === ':'
          ? this.mangle(cap[1].substring(7))
          : this.mangle(cap[1]);
        href = this.mangle('mailto:') + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += this.renderer.link(href, null, text);
      continue;
    }

    // url (gfm)
    if (!this.inLink && (cap = this.rules.url.exec(src))) {
      src = src.substring(cap[0].length);
      text = escape(cap[1]);
      href = text;
      out += this.renderer.link(href, null, text);
      continue;
    }

    // tag
    if (cap = this.rules.tag.exec(src)) {
      if (!this.inLink && /^<a /i.test(cap[0])) {
        this.inLink = true;
      } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
        this.inLink = false;
      }
      src = src.substring(cap[0].length);
      out += this.options.sanitize
        ? this.options.sanitizer
          ? this.options.sanitizer(cap[0])
          : escape(cap[0])
        : cap[0]
      continue;
    }

    // link
    if (cap = this.rules.link.exec(src)) {
      src = src.substring(cap[0].length);
      this.inLink = true;
      out += this.outputLink(cap, {
        href: cap[2],
        title: cap[3]
      });
      this.inLink = false;
      continue;
    }

    // reflink, nolink
    if ((cap = this.rules.reflink.exec(src))
        || (cap = this.rules.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = this.links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0].charAt(0);
        src = cap[0].substring(1) + src;
        continue;
      }
      this.inLink = true;
      out += this.outputLink(cap, link);
      this.inLink = false;
      continue;
    }

    // strong
    if (cap = this.rules.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.strong(this.output(cap[2] || cap[1]));
      continue;
    }

    // em
    if (cap = this.rules.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.em(this.output(cap[2] || cap[1]));
      continue;
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.codespan(escape(cap[2], true));
      continue;
    }

    // br
    if (cap = this.rules.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.br();
      continue;
    }

    // del (gfm)
    if (cap = this.rules.del.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.del(this.output(cap[1]));
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.text(escape(this.smartypants(cap[0])));
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return out;
};

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function(cap, link) {
  var href = escape(link.href)
    , title = link.title ? escape(link.title) : null;

  return cap[0].charAt(0) !== '!'
    ? this.renderer.link(href, title, this.output(cap[1]))
    : this.renderer.image(href, title, escape(cap[1]));
};

/**
 * Smartypants Transformations
 */

InlineLexer.prototype.smartypants = function(text) {
  if (!this.options.smartypants) return text;
  return text
    // em-dashes
    .replace(/---/g, '\u2014')
    // en-dashes
    .replace(/--/g, '\u2013')
    // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
    // closing singles & apostrophes
    .replace(/'/g, '\u2019')
    // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
    // closing doubles
    .replace(/"/g, '\u201d')
    // ellipses
    .replace(/\.{3}/g, '\u2026');
};

/**
 * Mangle Links
 */

InlineLexer.prototype.mangle = function(text) {
  if (!this.options.mangle) return text;
  var out = ''
    , l = text.length
    , i = 0
    , ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
};

/**
 * Renderer
 */

function Renderer(options) {
  this.options = options || {};
}

Renderer.prototype.code = function(code, lang, escaped) {
  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre><code>'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>';
  }

  return '<pre><code class="'
    + this.options.langPrefix
    + escape(lang, true)
    + '">'
    + (escaped ? code : escape(code, true))
    + '\n</code></pre>\n';
};

Renderer.prototype.blockquote = function(quote) {
  return '<blockquote>\n' + quote + '</blockquote>\n';
};

Renderer.prototype.html = function(html) {
  return html;
};

Renderer.prototype.heading = function(text, level, raw) {
  return '<h'
    + level
    + ' id="'
    + this.options.headerPrefix
    + raw.toLowerCase().replace(/[^\w]+/g, '-')
    + '">'
    + text
    + '</h'
    + level
    + '>\n';
};

Renderer.prototype.hr = function() {
  return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
};

Renderer.prototype.list = function(body, ordered) {
  var type = ordered ? 'ol' : 'ul';
  return '<' + type + '>\n' + body + '</' + type + '>\n';
};

Renderer.prototype.listitem = function(text) {
  return '<li>' + text + '</li>\n';
};

Renderer.prototype.paragraph = function(text) {
  return '<p>' + text + '</p>\n';
};

Renderer.prototype.table = function(header, body) {
  return '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n';
};

Renderer.prototype.tablerow = function(content) {
  return '<tr>\n' + content + '</tr>\n';
};

Renderer.prototype.tablecell = function(content, flags) {
  var type = flags.header ? 'th' : 'td';
  var tag = flags.align
    ? '<' + type + ' style="text-align:' + flags.align + '">'
    : '<' + type + '>';
  return tag + content + '</' + type + '>\n';
};

// span level renderer
Renderer.prototype.strong = function(text) {
  return '<strong>' + text + '</strong>';
};

Renderer.prototype.em = function(text) {
  return '<em>' + text + '</em>';
};

Renderer.prototype.codespan = function(text) {
  return '<code>' + text + '</code>';
};

Renderer.prototype.br = function() {
  return this.options.xhtml ? '<br/>' : '<br>';
};

Renderer.prototype.del = function(text) {
  return '<del>' + text + '</del>';
};

Renderer.prototype.link = function(href, title, text) {
  if (this.options.sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase();
    } catch (e) {
      return '';
    }
    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
      return '';
    }
  }
  var out = '<a href="' + href + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>' + text + '</a>';
  return out;
};

Renderer.prototype.image = function(href, title, text) {
  var out = '<img src="' + href + '" alt="' + text + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += this.options.xhtml ? '/>' : '>';
  return out;
};

Renderer.prototype.text = function(text) {
  return text;
};

/**
 * Parsing & Compiling
 */

function Parser(options) {
  this.tokens = [];
  this.token = null;
  this.options = options || marked.defaults;
  this.options.renderer = this.options.renderer || new Renderer;
  this.renderer = this.options.renderer;
  this.renderer.options = this.options;
}

/**
 * Static Parse Method
 */

Parser.parse = function(src, options, renderer) {
  var parser = new Parser(options, renderer);
  return parser.parse(src);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function(src) {
  this.inline = new InlineLexer(src.links, this.options, this.renderer);
  this.tokens = src.reverse();

  var out = '';
  while (this.next()) {
    out += this.tok();
  }

  return out;
};

/**
 * Next Token
 */

Parser.prototype.next = function() {
  return this.token = this.tokens.pop();
};

/**
 * Preview Next Token
 */

Parser.prototype.peek = function() {
  return this.tokens[this.tokens.length - 1] || 0;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function() {
  var body = this.token.text;

  while (this.peek().type === 'text') {
    body += '\n' + this.next().text;
  }

  return this.inline.output(body);
};

/**
 * Parse Current Token
 */

Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return this.renderer.hr();
    }
    case 'heading': {
      return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.depth,
        this.token.text);
    }
    case 'code': {
      return this.renderer.code(this.token.text,
        this.token.lang,
        this.token.escaped);
    }
    case 'table': {
      var header = ''
        , body = ''
        , i
        , row
        , cell
        , flags
        , j;

      // header
      cell = '';
      for (i = 0; i < this.token.header.length; i++) {
        flags = { header: true, align: this.token.align[i] };
        cell += this.renderer.tablecell(
          this.inline.output(this.token.header[i]),
          { header: true, align: this.token.align[i] }
        );
      }
      header += this.renderer.tablerow(cell);

      for (i = 0; i < this.token.cells.length; i++) {
        row = this.token.cells[i];

        cell = '';
        for (j = 0; j < row.length; j++) {
          cell += this.renderer.tablecell(
            this.inline.output(row[j]),
            { header: false, align: this.token.align[j] }
          );
        }

        body += this.renderer.tablerow(cell);
      }
      return this.renderer.table(header, body);
    }
    case 'blockquote_start': {
      var body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this.tok();
      }

      return this.renderer.blockquote(body);
    }
    case 'list_start': {
      var body = ''
        , ordered = this.token.ordered;

      while (this.next().type !== 'list_end') {
        body += this.tok();
      }

      return this.renderer.list(body, ordered);
    }
    case 'list_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.token.type === 'text'
          ? this.parseText()
          : this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'loose_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'html': {
      var html = !this.token.pre && !this.options.pedantic
        ? this.inline.output(this.token.text)
        : this.token.text;
      return this.renderer.html(html);
    }
    case 'paragraph': {
      return this.renderer.paragraph(this.inline.output(this.token.text));
    }
    case 'text': {
      return this.renderer.paragraph(this.parseText());
    }
  }
};

/**
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unescape(html) {
	// explicitly match decimal, hex, and named HTML entities 
  return html.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/g, function(_, n) {
    n = n.toLowerCase();
    if (n === 'colon') return ':';
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1));
    }
    return '';
  });
}

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function noop() {}
noop.exec = noop;

function merge(obj) {
  var i = 1
    , target
    , key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}


/**
 * Marked
 */

function marked(src, opt, callback) {
  if (callback || typeof opt === 'function') {
    if (!callback) {
      callback = opt;
      opt = null;
    }

    opt = merge({}, marked.defaults, opt || {});

    var highlight = opt.highlight
      , tokens
      , pending
      , i = 0;

    try {
      tokens = Lexer.lex(src, opt)
    } catch (e) {
      return callback(e);
    }

    pending = tokens.length;

    var done = function(err) {
      if (err) {
        opt.highlight = highlight;
        return callback(err);
      }

      var out;

      try {
        out = Parser.parse(tokens, opt);
      } catch (e) {
        err = e;
      }

      opt.highlight = highlight;

      return err
        ? callback(err)
        : callback(null, out);
    };

    if (!highlight || highlight.length < 3) {
      return done();
    }

    delete opt.highlight;

    if (!pending) return done();

    for (; i < tokens.length; i++) {
      (function(token) {
        if (token.type !== 'code') {
          return --pending || done();
        }
        return highlight(token.text, token.lang, function(err, code) {
          if (err) return done(err);
          if (code == null || code === token.text) {
            return --pending || done();
          }
          token.text = code;
          token.escaped = true;
          --pending || done();
        });
      })(tokens[i]);
    }

    return;
  }
  try {
    if (opt) opt = merge({}, marked.defaults, opt);
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/chjj/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occured:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  return marked;
};

marked.defaults = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  sanitizer: null,
  mangle: true,
  smartLists: false,
  silent: false,
  highlight: null,
  langPrefix: 'lang-',
  smartypants: false,
  headerPrefix: '',
  renderer: new Renderer,
  xhtml: false
};

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Renderer = Renderer;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.parse = marked;

if (true) {
  module.exports = marked;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return marked; });
} else {
  this.marked = marked;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 347 */,
/* 348 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/**
 * JSON parse.
 *
 * @see Based on jQuery#parseJSON (MIT) and JSON2
 * @api private
 */

var rvalidchars = /^[\],:{}\s]*$/;
var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
var rtrimLeft = /^\s+/;
var rtrimRight = /\s+$/;

module.exports = function parsejson(data) {
  if ('string' != typeof data || !data) {
    return null;
  }

  data = data.replace(rtrimLeft, '').replace(rtrimRight, '');

  // Attempt to parse using the native JSON parser first
  if (global.JSON && JSON.parse) {
    return JSON.parse(data);
  }

  if (rvalidchars.test(data.replace(rvalidescape, '@')
      .replace(rvalidtokens, ']')
      .replace(rvalidbraces, ''))) {
    return (new Function('return ' + data))();
  }
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 349 */,
/* 350 */,
/* 351 */,
/* 352 */,
/* 353 */
/***/ function(module, exports, __webpack_require__) {


/**
 * Module dependencies.
 */

var url = __webpack_require__(354);
var parser = __webpack_require__(40);
var Manager = __webpack_require__(192);
var debug = __webpack_require__(27)('socket.io-client');

/**
 * Module exports.
 */

module.exports = exports = lookup;

/**
 * Managers cache.
 */

var cache = exports.managers = {};

/**
 * Looks up an existing `Manager` for multiplexing.
 * If the user summons:
 *
 *   `io('http://localhost/a');`
 *   `io('http://localhost/b');`
 *
 * We reuse the existing instance based on same scheme/port/host,
 * and we initialize sockets for each namespace.
 *
 * @api public
 */

function lookup (uri, opts) {
  if (typeof uri === 'object') {
    opts = uri;
    uri = undefined;
  }

  opts = opts || {};

  var parsed = url(uri);
  var source = parsed.source;
  var id = parsed.id;
  var path = parsed.path;
  var sameNamespace = cache[id] && path in cache[id].nsps;
  var newConnection = opts.forceNew || opts['force new connection'] ||
                      false === opts.multiplex || sameNamespace;

  var io;

  if (newConnection) {
    debug('ignoring socket cache for %s', source);
    io = Manager(source, opts);
  } else {
    if (!cache[id]) {
      debug('new io instance for %s', source);
      cache[id] = Manager(source, opts);
    }
    io = cache[id];
  }
  if (parsed.query && !opts.query) {
    opts.query = parsed.query;
  } else if (opts && 'object' === typeof opts.query) {
    opts.query = encodeQueryString(opts.query);
  }
  return io.socket(parsed.path, opts);
}
/**
 *  Helper method to parse query objects to string.
 * @param {object} query
 * @returns {string}
 */
function encodeQueryString (obj) {
  var str = [];
  for (var p in obj) {
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
    }
  }
  return str.join('&');
}
/**
 * Protocol version.
 *
 * @api public
 */

exports.protocol = parser.protocol;

/**
 * `connect`.
 *
 * @param {String} uri
 * @api public
 */

exports.connect = lookup;

/**
 * Expose constructors for standalone build.
 *
 * @api public
 */

exports.Manager = __webpack_require__(192);
exports.Socket = __webpack_require__(194);


/***/ },
/* 354 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {
/**
 * Module dependencies.
 */

var parseuri = __webpack_require__(188);
var debug = __webpack_require__(27)('socket.io-client:url');

/**
 * Module exports.
 */

module.exports = url;

/**
 * URL parser.
 *
 * @param {String} url
 * @param {Object} An object meant to mimic window.location.
 *                 Defaults to window.location.
 * @api public
 */

function url (uri, loc) {
  var obj = uri;

  // default to window.location
  loc = loc || global.location;
  if (null == uri) uri = loc.protocol + '//' + loc.host;

  // relative path support
  if ('string' === typeof uri) {
    if ('/' === uri.charAt(0)) {
      if ('/' === uri.charAt(1)) {
        uri = loc.protocol + uri;
      } else {
        uri = loc.host + uri;
      }
    }

    if (!/^(https?|wss?):\/\//.test(uri)) {
      debug('protocol-less url %s', uri);
      if ('undefined' !== typeof loc) {
        uri = loc.protocol + '//' + uri;
      } else {
        uri = 'https://' + uri;
      }
    }

    // parse
    debug('parse %s', uri);
    obj = parseuri(uri);
  }

  // make sure we treat `localhost:80` and `localhost` equally
  if (!obj.port) {
    if (/^(http|ws)$/.test(obj.protocol)) {
      obj.port = '80';
    } else if (/^(http|ws)s$/.test(obj.protocol)) {
      obj.port = '443';
    }
  }

  obj.path = obj.path || '/';

  var ipv6 = obj.host.indexOf(':') !== -1;
  var host = ipv6 ? '[' + obj.host + ']' : obj.host;

  // define unique id
  obj.id = obj.protocol + '://' + host + ':' + obj.port;
  // define href
  obj.href = obj.protocol + '://' + host + (loc && loc.port === obj.port ? '' : (':' + obj.port));

  return obj;
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 355 */
/***/ function(module, exports, __webpack_require__) {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug.debug = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = __webpack_require__(187);

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting
    args = exports.formatArgs.apply(self, args);

    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/[\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}


/***/ },
/* 356 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/*global Blob,File*/

/**
 * Module requirements
 */

var isArray = __webpack_require__(68);
var isBuf = __webpack_require__(195);

/**
 * Replaces every Buffer | ArrayBuffer in packet with a numbered placeholder.
 * Anything with blobs or files should be fed through removeBlobs before coming
 * here.
 *
 * @param {Object} packet - socket.io event packet
 * @return {Object} with deconstructed packet and list of buffers
 * @api public
 */

exports.deconstructPacket = function(packet){
  var buffers = [];
  var packetData = packet.data;

  function _deconstructPacket(data) {
    if (!data) return data;

    if (isBuf(data)) {
      var placeholder = { _placeholder: true, num: buffers.length };
      buffers.push(data);
      return placeholder;
    } else if (isArray(data)) {
      var newData = new Array(data.length);
      for (var i = 0; i < data.length; i++) {
        newData[i] = _deconstructPacket(data[i]);
      }
      return newData;
    } else if ('object' == typeof data && !(data instanceof Date)) {
      var newData = {};
      for (var key in data) {
        newData[key] = _deconstructPacket(data[key]);
      }
      return newData;
    }
    return data;
  }

  var pack = packet;
  pack.data = _deconstructPacket(packetData);
  pack.attachments = buffers.length; // number of binary 'attachments'
  return {packet: pack, buffers: buffers};
};

/**
 * Reconstructs a binary packet from its placeholder packet and buffers
 *
 * @param {Object} packet - event packet with placeholders
 * @param {Array} buffers - binary buffers to put in placeholder positions
 * @return {Object} reconstructed packet
 * @api public
 */

exports.reconstructPacket = function(packet, buffers) {
  var curPlaceHolder = 0;

  function _reconstructPacket(data) {
    if (data && data._placeholder) {
      var buf = buffers[data.num]; // appropriate buffer (should be natural order anyway)
      return buf;
    } else if (isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        data[i] = _reconstructPacket(data[i]);
      }
      return data;
    } else if (data && 'object' == typeof data) {
      for (var key in data) {
        data[key] = _reconstructPacket(data[key]);
      }
      return data;
    }
    return data;
  }

  packet.data = _reconstructPacket(packet.data);
  packet.attachments = undefined; // no longer useful
  return packet;
};

/**
 * Asynchronously removes Blobs or Files from data via
 * FileReader's readAsArrayBuffer method. Used before encoding
 * data as msgpack. Calls callback with the blobless data.
 *
 * @param {Object} data
 * @param {Function} callback
 * @api private
 */

exports.removeBlobs = function(data, callback) {
  function _removeBlobs(obj, curKey, containingObject) {
    if (!obj) return obj;

    // convert any blob
    if ((global.Blob && obj instanceof Blob) ||
        (global.File && obj instanceof File)) {
      pendingBlobs++;

      // async filereader
      var fileReader = new FileReader();
      fileReader.onload = function() { // this.result == arraybuffer
        if (containingObject) {
          containingObject[curKey] = this.result;
        }
        else {
          bloblessData = this.result;
        }

        // if nothing pending its callback time
        if(! --pendingBlobs) {
          callback(bloblessData);
        }
      };

      fileReader.readAsArrayBuffer(obj); // blob -> arraybuffer
    } else if (isArray(obj)) { // handle array
      for (var i = 0; i < obj.length; i++) {
        _removeBlobs(obj[i], i, obj);
      }
    } else if (obj && 'object' == typeof obj && !isBuf(obj)) { // and object
      for (var key in obj) {
        _removeBlobs(obj[key], key, obj);
      }
    }
  }

  var pendingBlobs = 0;
  var bloblessData = data;
  _removeBlobs(bloblessData);
  if (!pendingBlobs) {
    callback(bloblessData);
  }
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 357 */
/***/ function(module, exports) {


/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};


/***/ },
/* 358 */,
/* 359 */
/***/ function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(273);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(358)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!./../../css-loader/index.js!./toastr.css", function() {
			var newContent = require("!!./../../css-loader/index.js!./toastr.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ },
/* 360 */,
/* 361 */,
/* 362 */
/***/ function(module, exports) {

module.exports = toArray

function toArray(list, index) {
    var array = []

    index = index || 0

    for (var i = index || 0; i < list.length; i++) {
        array[i - index] = list[i]
    }

    return array
}


/***/ },
/* 363 */
/***/ function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!function(e){!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(28)], __WEBPACK_AMD_DEFINE_RESULT__ = function(e){return function(){function t(e,t,n){return g({type:O.error,iconClass:m().iconClasses.error,message:e,optionsOverride:n,title:t})}function n(t,n){return t||(t=m()),v=e("#"+t.containerId),v.length?v:(n&&(v=u(t)),v)}function i(e,t,n){return g({type:O.info,iconClass:m().iconClasses.info,message:e,optionsOverride:n,title:t})}function o(e){w=e}function s(e,t,n){return g({type:O.success,iconClass:m().iconClasses.success,message:e,optionsOverride:n,title:t})}function a(e,t,n){return g({type:O.warning,iconClass:m().iconClasses.warning,message:e,optionsOverride:n,title:t})}function r(e,t){var i=m();v||n(i),l(e,i,t)||d(i)}function c(t){var i=m();return v||n(i),t&&0===e(":focus",t).length?void h(t):void(v.children().length&&v.remove())}function d(t){for(var n=v.children(),i=n.length-1;i>=0;i--)l(e(n[i]),t)}function l(t,n,i){var o=i&&i.force?i.force:!1;return t&&(o||0===e(":focus",t).length)?(t[n.hideMethod]({duration:n.hideDuration,easing:n.hideEasing,complete:function(){h(t)}}),!0):!1}function u(t){return v=e("<div/>").attr("id",t.containerId).addClass(t.positionClass).attr("aria-live","polite").attr("role","alert"),v.appendTo(e(t.target)),v}function p(){return{tapToDismiss:!0,toastClass:"toast",containerId:"toast-container",debug:!1,showMethod:"fadeIn",showDuration:300,showEasing:"swing",onShown:void 0,hideMethod:"fadeOut",hideDuration:1e3,hideEasing:"swing",onHidden:void 0,closeMethod:!1,closeDuration:!1,closeEasing:!1,extendedTimeOut:1e3,iconClasses:{error:"toast-error",info:"toast-info",success:"toast-success",warning:"toast-warning"},iconClass:"toast-info",positionClass:"toast-top-right",timeOut:5e3,titleClass:"toast-title",messageClass:"toast-message",escapeHtml:!1,target:"body",closeHtml:'<button type="button">&times;</button>',newestOnTop:!0,preventDuplicates:!1,progressBar:!1}}function f(e){w&&w(e)}function g(t){function i(e){return null==e&&(e=""),new String(e).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function o(){r(),d(),l(),u(),p(),c()}function s(){y.hover(b,O),!x.onclick&&x.tapToDismiss&&y.click(w),x.closeButton&&k&&k.click(function(e){e.stopPropagation?e.stopPropagation():void 0!==e.cancelBubble&&e.cancelBubble!==!0&&(e.cancelBubble=!0),w(!0)}),x.onclick&&y.click(function(e){x.onclick(e),w()})}function a(){y.hide(),y[x.showMethod]({duration:x.showDuration,easing:x.showEasing,complete:x.onShown}),x.timeOut>0&&(H=setTimeout(w,x.timeOut),q.maxHideTime=parseFloat(x.timeOut),q.hideEta=(new Date).getTime()+q.maxHideTime,x.progressBar&&(q.intervalId=setInterval(D,10)))}function r(){t.iconClass&&y.addClass(x.toastClass).addClass(E)}function c(){x.newestOnTop?v.prepend(y):v.append(y)}function d(){t.title&&(I.append(x.escapeHtml?i(t.title):t.title).addClass(x.titleClass),y.append(I))}function l(){t.message&&(M.append(x.escapeHtml?i(t.message):t.message).addClass(x.messageClass),y.append(M))}function u(){x.closeButton&&(k.addClass("toast-close-button").attr("role","button"),y.prepend(k))}function p(){x.progressBar&&(B.addClass("toast-progress"),y.prepend(B))}function g(e,t){if(e.preventDuplicates){if(t.message===C)return!0;C=t.message}return!1}function w(t){var n=t&&x.closeMethod!==!1?x.closeMethod:x.hideMethod,i=t&&x.closeDuration!==!1?x.closeDuration:x.hideDuration,o=t&&x.closeEasing!==!1?x.closeEasing:x.hideEasing;return!e(":focus",y).length||t?(clearTimeout(q.intervalId),y[n]({duration:i,easing:o,complete:function(){h(y),x.onHidden&&"hidden"!==j.state&&x.onHidden(),j.state="hidden",j.endTime=new Date,f(j)}})):void 0}function O(){(x.timeOut>0||x.extendedTimeOut>0)&&(H=setTimeout(w,x.extendedTimeOut),q.maxHideTime=parseFloat(x.extendedTimeOut),q.hideEta=(new Date).getTime()+q.maxHideTime)}function b(){clearTimeout(H),q.hideEta=0,y.stop(!0,!0)[x.showMethod]({duration:x.showDuration,easing:x.showEasing})}function D(){var e=(q.hideEta-(new Date).getTime())/q.maxHideTime*100;B.width(e+"%")}var x=m(),E=t.iconClass||x.iconClass;if("undefined"!=typeof t.optionsOverride&&(x=e.extend(x,t.optionsOverride),E=t.optionsOverride.iconClass||E),!g(x,t)){T++,v=n(x,!0);var H=null,y=e("<div/>"),I=e("<div/>"),M=e("<div/>"),B=e("<div/>"),k=e(x.closeHtml),q={intervalId:null,hideEta:null,maxHideTime:null},j={toastId:T,state:"visible",startTime:new Date,options:x,map:t};return o(),a(),s(),f(j),x.debug&&console&&console.log(j),y}}function m(){return e.extend({},p(),b.options)}function h(e){v||(v=n()),e.is(":visible")||(e.remove(),e=null,0===v.children().length&&(v.remove(),C=void 0))}var v,w,C,T=0,O={error:"error",info:"info",success:"success",warning:"warning"},b={clear:r,remove:c,error:t,getContainer:n,info:i,options:{},subscribe:o,success:s,version:"2.1.2",warning:a};return b}()}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))}(__webpack_require__(197));
//# sourceMappingURL=toastr.js.map

/***/ },
/* 364 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(289)

/* script */
__vue_exports__ = __webpack_require__(254)

/* template */
var __vue_template__ = __webpack_require__(381)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "d:\\Work\\vue-express-mongo-boilerplate\\client\\app\\core\\App.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-0cab33cd", __vue_options__)
  } else {
    hotAPI.reload("data-v-0cab33cd", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] App.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 365 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(296)

/* script */
__vue_exports__ = __webpack_require__(255)

/* template */
var __vue_template__ = __webpack_require__(389)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "d:\\Work\\vue-express-mongo-boilerplate\\client\\app\\core\\DefaultAdminPage.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns
__vue_options__._scopeId = "data-v-8c07cb7e"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-8c07cb7e", __vue_options__)
  } else {
    hotAPI.reload("data-v-8c07cb7e", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] DefaultAdminPage.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 366 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(294)

/* script */
__vue_exports__ = __webpack_require__(256)

/* template */
var __vue_template__ = __webpack_require__(386)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "d:\\Work\\vue-express-mongo-boilerplate\\client\\app\\core\\components\\header\\dropdowns\\messages.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-5c16e09a", __vue_options__)
  } else {
    hotAPI.reload("data-v-5c16e09a", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] messages.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 367 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(298)

/* script */
__vue_exports__ = __webpack_require__(257)

/* template */
var __vue_template__ = __webpack_require__(391)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "d:\\Work\\vue-express-mongo-boilerplate\\client\\app\\core\\components\\header\\dropdowns\\notifications.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-bb9409de", __vue_options__)
  } else {
    hotAPI.reload("data-v-bb9409de", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] notifications.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 368 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(300)

/* script */
__vue_exports__ = __webpack_require__(258)

/* template */
var __vue_template__ = __webpack_require__(393)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "d:\\Work\\vue-express-mongo-boilerplate\\client\\app\\core\\components\\header\\dropdowns\\user.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-d5e33b9c", __vue_options__)
  } else {
    hotAPI.reload("data-v-d5e33b9c", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] user.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 369 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(297)

/* script */
__vue_exports__ = __webpack_require__(259)

/* template */
var __vue_template__ = __webpack_require__(390)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "d:\\Work\\vue-express-mongo-boilerplate\\client\\app\\core\\components\\header\\index.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-94698cd6", __vue_options__)
  } else {
    hotAPI.reload("data-v-94698cd6", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] index.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 370 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(292)

/* script */
__vue_exports__ = __webpack_require__(260)

/* template */
var __vue_template__ = __webpack_require__(384)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "d:\\Work\\vue-express-mongo-boilerplate\\client\\app\\core\\components\\header\\logo.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-46658238", __vue_options__)
  } else {
    hotAPI.reload("data-v-46658238", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] logo.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 371 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(295)

/* script */
__vue_exports__ = __webpack_require__(261)

/* template */
var __vue_template__ = __webpack_require__(388)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "d:\\Work\\vue-express-mongo-boilerplate\\client\\app\\core\\components\\header\\search-box.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-751a1f73", __vue_options__)
  } else {
    hotAPI.reload("data-v-751a1f73", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] search-box.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 372 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(302)

/* script */
__vue_exports__ = __webpack_require__(262)

/* template */
var __vue_template__ = __webpack_require__(395)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "d:\\Work\\vue-express-mongo-boilerplate\\client\\app\\core\\components\\header\\user-box.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-de058854", __vue_options__)
  } else {
    hotAPI.reload("data-v-de058854", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] user-box.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 373 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(291)

/* script */
__vue_exports__ = __webpack_require__(263)

/* template */
var __vue_template__ = __webpack_require__(383)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "d:\\Work\\vue-express-mongo-boilerplate\\client\\app\\core\\components\\sidebar\\index.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-43662120", __vue_options__)
  } else {
    hotAPI.reload("data-v-43662120", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] index.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 374 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(293)

/* script */
__vue_exports__ = __webpack_require__(264)

/* template */
var __vue_template__ = __webpack_require__(385)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "d:\\Work\\vue-express-mongo-boilerplate\\client\\app\\core\\dataTable.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns
__vue_options__._scopeId = "data-v-51dc5790"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-51dc5790", __vue_options__)
  } else {
    hotAPI.reload("data-v-51dc5790", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] dataTable.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 375 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(299)

/* script */
__vue_exports__ = __webpack_require__(265)

/* template */
var __vue_template__ = __webpack_require__(392)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "d:\\Work\\vue-express-mongo-boilerplate\\client\\app\\modules\\counter\\index.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns
__vue_options__._scopeId = "data-v-cc3417b8"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-cc3417b8", __vue_options__)
  } else {
    hotAPI.reload("data-v-cc3417b8", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] index.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 376 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* script */
__vue_exports__ = __webpack_require__(266)

/* template */
var __vue_template__ = __webpack_require__(387)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "d:\\Work\\vue-express-mongo-boilerplate\\client\\app\\modules\\devices\\index.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-6cd63476", __vue_options__)
  } else {
    hotAPI.reload("data-v-6cd63476", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] index.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 377 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(290)

/* script */
__vue_exports__ = __webpack_require__(267)

/* template */
var __vue_template__ = __webpack_require__(382)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "d:\\Work\\vue-express-mongo-boilerplate\\client\\app\\modules\\home\\index.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns
__vue_options__._scopeId = "data-v-1adbeb5a"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1adbeb5a", __vue_options__)
  } else {
    hotAPI.reload("data-v-1adbeb5a", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] index.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 378 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(288)

/* script */
__vue_exports__ = __webpack_require__(268)

/* template */
var __vue_template__ = __webpack_require__(380)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "d:\\Work\\vue-express-mongo-boilerplate\\client\\app\\modules\\posts\\index.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns
__vue_options__._scopeId = "data-v-09ec17bb"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-09ec17bb", __vue_options__)
  } else {
    hotAPI.reload("data-v-09ec17bb", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] index.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 379 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(301)

/* script */
__vue_exports__ = __webpack_require__(269)

/* template */
var __vue_template__ = __webpack_require__(394)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "d:\\Work\\vue-express-mongo-boilerplate\\client\\app\\modules\\profile\\index.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns
__vue_options__._scopeId = "data-v-d87398de"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-d87398de", __vue_options__)
  } else {
    hotAPI.reload("data-v-d87398de", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] index.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 380 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "container"
  }, [_c('h2', {
    staticClass: "title"
  }, [_vm._v(_vm._s(_vm._('Posts')))]), _c('div', {
    staticClass: "header flex row justify-space-between"
  }, [_c('div', {
    staticClass: "group sort"
  }, [_c('a', {
    staticClass: "link",
    class: {
      active: _vm.sort == '-votes'
    },
    on: {
      "click": function($event) {
        _vm.changeSort('-votes')
      }
    }
  }, [_vm._v(_vm._s(_vm._("Hot")))]), _c('a', {
    staticClass: "link",
    class: {
      active: _vm.sort == '-views'
    },
    on: {
      "click": function($event) {
        _vm.changeSort('-views')
      }
    }
  }, [_vm._v(_vm._s(_vm._("MostViewed")))]), _c('a', {
    staticClass: "link",
    class: {
      active: _vm.sort == '-createdAt'
    },
    on: {
      "click": function($event) {
        _vm.changeSort('-createdAt')
      }
    }
  }, [_vm._v(_vm._s(_vm._("New")))])]), _c('button', {
    staticClass: "button primary",
    on: {
      "click": _vm.newPost
    }
  }, [_vm._m(0), _c('span', [_vm._v(_vm._s(_vm._("NewPost")))])]), _c('div', {
    staticClass: "group filter"
  }, [_c('a', {
    staticClass: "link",
    class: {
      active: _vm.viewMode == 'all'
    },
    on: {
      "click": function($event) {
        _vm.changeViewMode('all')
      }
    }
  }, [_vm._v(_vm._s(_vm._("AllPosts")))]), _c('a', {
    staticClass: "link",
    class: {
      active: _vm.viewMode == 'my'
    },
    on: {
      "click": function($event) {
        _vm.changeViewMode('my')
      }
    }
  }, [_vm._v(_vm._s(_vm._("MyPosts")))])])]), (_vm.showForm) ? _c('div', {
    staticClass: "postForm"
  }, [_c('vue-form-generator', {
    ref: "form",
    attrs: {
      "schema": _vm.schema,
      "model": _vm.model,
      "options": {},
      "multiple": false,
      "is-new-model": _vm.isNewPost
    }
  }), _c('div', {
    staticClass: "group buttons"
  }, [_c('button', {
    staticClass: "button primary",
    on: {
      "click": _vm.savePost
    }
  }, [_vm._v(_vm._s(_vm._("Save")))]), _c('button', {
    staticClass: "button",
    on: {
      "click": _vm.cancelPost
    }
  }, [_vm._v(_vm._s(_vm._("Cancel")))])])], 1) : _vm._e(), _c('transition-group', {
    staticClass: "posts",
    attrs: {
      "name": "post",
      "tag": "ul"
    }
  }, _vm._l((_vm.posts), function(post) {
    return _c('li', {
      key: post.code
    }, [_c('article', {
      staticClass: "media"
    }, [_c('div', {
      staticClass: "media-left"
    }, [_c('img', {
      staticClass: "avatar",
      attrs: {
        "src": post.author.avatar
      }
    }), _c('div', {
      staticClass: "votes",
      class: {
        voted: _vm.iVoted(post)
      }
    }, [_c('div', {
      staticClass: "count text-center"
    }, [_vm._v(_vm._s(post.votes))]), _c('div', {
      staticClass: "thumb text-center",
      on: {
        "click": function($event) {
          _vm.toggleVote(post)
        }
      }
    }, [_c('i', {
      staticClass: "fa fa-thumbs-o-up"
    })])])]), _c('div', {
      staticClass: "media-content"
    }, [_c('h3', [_vm._v(_vm._s(post.title))]), _c('p', {
      staticClass: "content",
      domProps: {
        "innerHTML": _vm._s(_vm.markdown(post.content))
      }
    }), _c('hr', {
      staticClass: "full"
    }), _c('div', {
      staticClass: "row"
    }, [_c('div', {
      staticClass: "functions left"
    }, [_c('a', {
      attrs: {
        "title": _vm._('EditPost')
      },
      on: {
        "click": function($event) {
          _vm.editPost(post)
        }
      }
    }, [_c('i', {
      staticClass: "fa fa-pencil"
    })]), _c('a', {
      attrs: {
        "title": _vm._('DeletePost')
      },
      on: {
        "click": function($event) {
          _vm.deletePost(post)
        }
      }
    }, [_c('i', {
      staticClass: "fa fa-trash"
    })])]), _c('div', {
      staticClass: "voters left",
      attrs: {
        "title": _vm._('Voters')
      }
    }, [_vm._l((_vm.lastVoters(post)), function(voter) {
      return [_c('img', {
        attrs: {
          "src": voter.avatar,
          "title": voter.fullName + ' (' + voter.username + ')'
        }
      })]
    })], 2), _c('div', {
      staticClass: "right text-right"
    }, [(post.editedAt) ? [_c('small', {
      staticClass: "text-muted"
    }, [_vm._v(_vm._s(_vm.editedAgo(post)))]), _c('br')] : _vm._e(), _c('small', {
      staticClass: "text-muted"
    }, [_vm._v(_vm._s(_vm.createdAgo(post)))])], 2)])])])])
  })), (_vm.hasMore) ? _c('div', {
    staticClass: "loadMore text-center"
  }, [_c('button', {
    staticClass: "button outline",
    class: {
      'loading': _vm.fetching
    },
    on: {
      "click": _vm.loadMoreRows
    }
  }, [_vm._v(_vm._s(_vm._("LoadMore")))])]) : _vm._e(), (!_vm.hasMore) ? _c('div', {
    staticClass: "noMore text-center"
  }, [_c('span', {
    staticClass: "text-muted"
  }, [_vm._v("You reached the end of the list.")])]) : _vm._e(), _c('hr')], 1)
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('span', {
    staticClass: "icon"
  }, [_c('i', {
    staticClass: "fa fa-plus"
  })])
}]}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-09ec17bb", module.exports)
  }
}

/***/ },
/* 381 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('page-header', {
    attrs: {
      "toggle-sidebar": _vm.toggleSidebar
    }
  }), _c('sidebar', {
    attrs: {
      "minimized": _vm.miniSidebar
    }
  }), _c('section', {
    staticClass: "app-main",
    class: {
      miniSidebar: _vm.miniSidebar
    }
  }, [_c('router-view', {
    attrs: {
      "keep-alive": "keep-alive"
    }
  })], 1)], 1)
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-0cab33cd", module.exports)
  }
}

/***/ },
/* 382 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "container"
  }, [_c('h1', [_vm._v("Style guide")]), _c('div', {
    staticClass: "guide"
  }, [_vm._m(0), _c('section', [_vm._m(1), _c('div', {
    staticClass: "content typo"
  }, [_c('div', {
    staticClass: "headers"
  }, [_c('h1', [_vm._v("Heading #1 - " + _vm._s(_vm.getTypographyInfo("h1")))]), _c('h2', [_vm._v("Heading #2 -  " + _vm._s(_vm.getTypographyInfo("h2")))]), _c('h3', [_vm._v("Heading #3 -  " + _vm._s(_vm.getTypographyInfo("h3")))]), _c('h4', [_vm._v("Heading #4 -  " + _vm._s(_vm.getTypographyInfo("h4")))]), _c('h5', [_vm._v("Heading #5 -  " + _vm._s(_vm.getTypographyInfo("h5")))]), _c('h5', [_vm._v("ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 éáűőúöüóí ÉÁŰŐÚÖÜÓÍ ")])]), _c('hr'), _c('div', {
    staticClass: "paragraph"
  }, [_c('p', [_vm._v("Paragraph - " + _vm._s(_vm.getTypographyInfo("p")))]), _c('p', [_vm._v("ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 éáűőúöüóí ÉÁŰŐÚÖÜÓÍ")]), _vm._m(2), _vm._m(3), _vm._m(4)])])]), _vm._m(5), _vm._m(6), _vm._m(7), _c('section', [_vm._m(8), _c('div', {
    staticClass: "content tables"
  }, [_c('table', {
    staticClass: "table stripped bordered"
  }, [_vm._m(9), _vm._m(10), _c('tfoot', [_c('tr', [_c('td', [_vm._v("4")]), _c('td'), _c('td'), _c('td'), _c('td', {
    staticClass: "text-right"
  }, [_vm._v("$15,500.00")]), _c('td', {
    staticClass: "text-right"
  })])])], 1)])]), _vm._m(11), _vm._m(12), _vm._m(13), _vm._m(14)])])
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('section', [_c('h2', [_c('span', {
    staticClass: "number"
  }, [_vm._v("1.")]), _c('span', {
    staticClass: "text"
  }, [_vm._v("Color palette")])]), _c('div', {
    staticClass: "content flex align-center justify-space-around colors"
  }, [_c('div', {
    staticClass: "box box1"
  }, [_c('div', {
    staticClass: "caption"
  }, [_vm._v("Color #1")]), _c('div', {
    staticClass: "main"
  }), _c('div', {
    staticClass: "light"
  }), _c('div', {
    staticClass: "dark"
  }), _c('div', {
    staticClass: "code"
  })]), _c('div', {
    staticClass: "box box2"
  }, [_c('div', {
    staticClass: "caption"
  }, [_vm._v("Color #2")]), _c('div', {
    staticClass: "main"
  }), _c('div', {
    staticClass: "light"
  }), _c('div', {
    staticClass: "dark"
  }), _c('div', {
    staticClass: "code"
  })]), _c('div', {
    staticClass: "box box3"
  }, [_c('div', {
    staticClass: "caption"
  }, [_vm._v("Color #3")]), _c('div', {
    staticClass: "main"
  }), _c('div', {
    staticClass: "light"
  }), _c('div', {
    staticClass: "dark"
  }), _c('div', {
    staticClass: "code"
  })]), _c('div', {
    staticClass: "box box4"
  }, [_c('div', {
    staticClass: "caption"
  }, [_vm._v("Color #4")]), _c('div', {
    staticClass: "main"
  }), _c('div', {
    staticClass: "light"
  }), _c('div', {
    staticClass: "dark"
  }), _c('div', {
    staticClass: "code"
  })]), _c('div', {
    staticClass: "box box5"
  }, [_c('div', {
    staticClass: "caption"
  }, [_vm._v("Color #5")]), _c('div', {
    staticClass: "main"
  }), _c('div', {
    staticClass: "light"
  }), _c('div', {
    staticClass: "dark"
  }), _c('div', {
    staticClass: "code"
  })])])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('h2', [_c('span', {
    staticClass: "number"
  }, [_vm._v("2.")]), _c('span', {
    staticClass: "text"
  }, [_vm._v("Typography")])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('p', [_vm._v("An example paragraph with "), _c('strong', [_vm._v("strong text")]), _vm._v(" and "), _c('em', [_vm._v("emphasized text")]), _vm._v(", spanning "), _c('br'), _vm._v("multiple lines so you can see the line-height.")])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('p', {
    staticClass: "text-justify"
  }, [_vm._v("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec varius ipsum tortor, eget convallis ante sagittis ac. Nulla eget bibendum dolor. Praesent at ipsum bibendum, malesuada quam tincidunt, lobortis purus. Donec vel mi mollis, sagittis libero non, ultrices elit. Nulla non mauris in sapien mattis scelerisque. Vivamus maximus tincidunt mi, interdum pellentesque urna feugiat sed. Suspendisse vulputate metus leo, nec hendrerit sapien tincidunt ac. Vivamus non libero luctus, suscipit libero ut, elementum enim. "), _c('a', {
    staticClass: "link",
    attrs: {
      "href": "#"
    }
  }, [_vm._v("Read more")])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('p', [_vm._v("Fusce aliquam sem lorem, in porttitor orci dignissim at. Sed non dolor at orci dignissim bibendum a non nibh. Duis nec vestibulum dui, sit amet lobortis ligula. Sed aliquam mauris nunc, eu sodales est faucibus vitae. Ut sed accumsan lectus. Interdum et "), _c('a', {
    staticClass: "link",
    attrs: {
      "href": "#"
    }
  }, [_vm._v("malesuada")]), _vm._v(" fames ac ante ipsum primis in faucibus. Aenean dignissim odio vehicula ligula varius, ac ullamcorper tortor molestie. Phasellus dolor dui, egestas id ornare in, suscipit et dolor.")])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('section', [_c('h2', [_c('span', {
    staticClass: "number"
  }, [_vm._v("3.")]), _c('span', {
    staticClass: "text"
  }, [_vm._v("Buttons")])]), _c('fieldset', [_c('legend', [_vm._v("Normal buttons")]), _c('div', {
    staticClass: "content flex align-center justify-space-around buttons"
  }, [_c('button', {
    staticClass: "button"
  }, [_vm._v("Normal")]), _c('button', {
    staticClass: "button primary"
  }, [_vm._v("Primary")]), _c('button', {
    staticClass: "button success"
  }, [_c('i', {
    staticClass: "icon fa fa-check"
  }), _vm._v("Success")]), _c('button', {
    staticClass: "button warning"
  }, [_vm._v("Warning")]), _c('button', {
    staticClass: "button danger"
  }, [_vm._v("Danger")]), _c('button', {
    staticClass: "button outline"
  }, [_vm._v("Outline")]), _c('button', {
    staticClass: "button loading"
  }, [_vm._v("Loading")])])]), _c('fieldset', [_c('legend', [_vm._v("Large buttons")]), _c('div', {
    staticClass: "content flex align-center justify-space-around buttons"
  }, [_c('button', {
    staticClass: "button large"
  }, [_vm._v("Normal")]), _c('button', {
    staticClass: "button large primary"
  }, [_vm._v("Primary")]), _c('button', {
    staticClass: "button large success"
  }, [_c('i', {
    staticClass: "icon fa fa-check"
  }), _vm._v("Success")]), _c('button', {
    staticClass: "button large warning"
  }, [_vm._v("Warning")]), _c('button', {
    staticClass: "button large danger"
  }, [_vm._v("Danger")]), _c('button', {
    staticClass: "button large outline"
  }, [_vm._v("Outline")]), _c('button', {
    staticClass: "button large loading"
  }, [_vm._v("Loading")])])]), _c('fieldset', [_c('legend', [_vm._v("Small buttons")]), _c('div', {
    staticClass: "content flex align-center justify-space-around buttons"
  }, [_c('button', {
    staticClass: "button small"
  }, [_vm._v("Normal")]), _c('button', {
    staticClass: "button small primary"
  }, [_vm._v("Primary")]), _c('button', {
    staticClass: "button small success"
  }, [_c('i', {
    staticClass: "icon fa fa-check"
  }), _vm._v("Success")]), _c('button', {
    staticClass: "button small warning"
  }, [_vm._v("Warning")]), _c('button', {
    staticClass: "button small danger"
  }, [_vm._v("Danger")]), _c('button', {
    staticClass: "button small outline"
  }, [_vm._v("Outline")]), _c('button', {
    staticClass: "button small loading"
  }, [_vm._v("Loading")])])]), _c('fieldset', [_c('legend', [_vm._v("Disabled buttons")]), _c('div', {
    staticClass: "content flex align-center justify-space-around buttons"
  }, [_c('button', {
    staticClass: "button",
    attrs: {
      "disabled": "disabled"
    }
  }, [_vm._v("Normal")]), _c('button', {
    staticClass: "button primary",
    attrs: {
      "disabled": "disabled"
    }
  }, [_vm._v("Primary")]), _c('button', {
    staticClass: "button success",
    attrs: {
      "disabled": "disabled"
    }
  }, [_c('i', {
    staticClass: "icon fa fa-check"
  }), _vm._v("Success")]), _c('button', {
    staticClass: "button warning",
    attrs: {
      "disabled": "disabled"
    }
  }, [_vm._v("Warning")]), _c('button', {
    staticClass: "button danger",
    attrs: {
      "disabled": "disabled"
    }
  }, [_vm._v("Danger")]), _c('button', {
    staticClass: "button outline",
    attrs: {
      "disabled": "disabled"
    }
  }, [_vm._v("Outline")])])]), _c('fieldset', [_c('legend', [_vm._v("Icon buttons")]), _c('div', {
    staticClass: "content flex align-center justify-space-around buttons"
  }, [_c('button', {
    staticClass: "button"
  }, [_c('i', {
    staticClass: "fa fa-home"
  })]), _c('button', {
    staticClass: "button primary"
  }, [_c('i', {
    staticClass: "fa fa-tasks"
  })]), _c('button', {
    staticClass: "button success"
  }, [_c('i', {
    staticClass: "fa fa-cogs"
  })]), _c('button', {
    staticClass: "button warning"
  }, [_c('i', {
    staticClass: "fa fa-comments"
  })]), _c('button', {
    staticClass: "button danger"
  }, [_c('i', {
    staticClass: "fa fa-trash"
  })]), _c('button', {
    staticClass: "button outline"
  }, [_c('i', {
    staticClass: "fa fa-pencil"
  })])])]), _c('fieldset', [_c('legend', [_vm._v("Floating buttons")]), _c('div', {
    staticClass: "content flex align-center justify-space-around buttons"
  }, [_c('button', {
    staticClass: "button fab"
  }, [_c('i', {
    staticClass: "icon fa fa-plus"
  }), _vm._v("Normal")]), _c('button', {
    staticClass: "button fab large primary"
  }, [_c('i', {
    staticClass: "icon fa fa-plus"
  }), _vm._v("Primary")]), _c('button', {
    staticClass: "button fab success"
  }, [_c('i', {
    staticClass: "icon fa fa-check"
  }), _vm._v("Success")]), _c('button', {
    staticClass: "button fab warning",
    attrs: {
      "disabled": "disabled"
    }
  }, [_c('i', {
    staticClass: "icon fa fa-comments"
  }), _vm._v("Warning")]), _c('button', {
    staticClass: "button fab danger"
  }, [_c('i', {
    staticClass: "icon fa fa-trash"
  }), _vm._v("Danger")]), _c('button', {
    staticClass: "button fab outline"
  }, [_c('i', {
    staticClass: "icon fa fa-bars"
  }), _vm._v("Outline\t\t\t\t")])])]), _c('fieldset', [_c('legend', [_vm._v("Button group")]), _c('div', {
    staticClass: "content flex align-center justify-space-around buttons"
  }, [_c('div', {
    staticClass: "button-group"
  }, [_c('button', {
    staticClass: "button"
  }, [_c('i', {
    staticClass: "icon fa fa-align-left"
  }), _vm._v("Left")]), _c('button', {
    staticClass: "button"
  }, [_c('i', {
    staticClass: "icon fa fa-align-center"
  }), _vm._v("Middle")]), _c('button', {
    staticClass: "button"
  }, [_c('i', {
    staticClass: "icon fa fa-align-right"
  }), _vm._v("Right")])])])]), _c('hr')])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('section', [_c('h2', [_c('span', {
    staticClass: "number"
  }, [_vm._v("4.")]), _c('span', {
    staticClass: "text"
  }, [_vm._v("Form elements")])]), _c('div', {
    staticClass: "content forms"
  }, [_c('form', {
    attrs: {
      "action": "#"
    }
  }, [_c('fieldset', [_c('legend', [_vm._v("Input fields")]), _c('div', {
    staticClass: "form-group"
  }, [_c('label', {
    attrs: {
      "for": "text1"
    }
  }, [_vm._v("Label")]), _c('input', {
    staticClass: "form-control",
    attrs: {
      "id": "text1",
      "type": "text",
      "placeholder": "Placeholder"
    }
  })]), _c('div', {
    staticClass: "form-group"
  }, [_c('label', {
    attrs: {
      "for": "text2"
    }
  }, [_vm._v("Label with hint")]), _c('input', {
    staticClass: "form-control",
    attrs: {
      "id": "text2",
      "type": "text",
      "placeholder": "Placeholder"
    }
  }), _c('div', {
    staticClass: "hint"
  }, [_vm._v("Maxium 100 characters")])]), _c('div', {
    staticClass: "form-group has-icon valid"
  }, [_c('label', {
    attrs: {
      "for": "text3"
    }
  }, [_vm._v("Label for valid input")]), _c('input', {
    staticClass: "form-control",
    attrs: {
      "id": "text3",
      "type": "text",
      "placeholder": "Placeholder"
    }
  }), _c('i', {
    staticClass: "icon fa fa-check"
  })]), _c('div', {
    staticClass: "form-group has-icon error"
  }, [_c('label', {
    attrs: {
      "for": "text4"
    }
  }, [_vm._v("Label for invalid input with error messages")]), _c('input', {
    staticClass: "form-control",
    attrs: {
      "id": "text4",
      "type": "text",
      "placeholder": "Placeholder"
    }
  }), _c('i', {
    staticClass: "icon fa fa-exclamation-triangle"
  }), _c('div', {
    staticClass: "errors"
  }, [_c('span', [_vm._v("Too short!")]), _c('span', [_vm._v("Invalid text content!")])])]), _c('div', {
    staticClass: "form-group"
  }, [_c('label', {
    attrs: {
      "for": "text5"
    }
  }, [_vm._v("Label for textarea")]), _c('textarea', {
    staticClass: "form-control",
    attrs: {
      "id": "text5",
      "type": "text",
      "placeholder": "Placeholder",
      "rows": "5"
    }
  })])]), _c('fieldset', [_c('legend', [_vm._v("Selections")]), _c('div', {
    staticClass: "form-group"
  }, [_c('label', {
    attrs: {
      "for": "select1"
    }
  }, [_vm._v("Label for select")]), _c('select', {
    staticClass: "form-control",
    attrs: {
      "id": "select1"
    }
  }, [_c('option', [_vm._v("Option 1")]), _c('option', [_vm._v("Option 2")]), _c('option', [_vm._v("Option 3 ")]), _c('option', [_vm._v("Option 4")])])])]), _c('fieldset', [_c('legend', [_vm._v("Radio buttons")]), _c('div', {
    staticClass: "form-option"
  }, [_c('input', {
    attrs: {
      "id": "radio1",
      "type": "radio",
      "name": "radio"
    }
  }), _c('label', {
    attrs: {
      "for": "radio1"
    }
  }, [_vm._v("Option one")])]), _c('div', {
    staticClass: "form-option"
  }, [_c('input', {
    attrs: {
      "id": "radio2",
      "type": "radio",
      "name": "radio"
    }
  }), _c('label', {
    attrs: {
      "for": "radio2"
    }
  }, [_vm._v("Option two")])])]), _c('fieldset', [_c('legend', [_vm._v("Checkboxes")]), _c('div', {
    staticClass: "form-option"
  }, [_c('input', {
    attrs: {
      "id": "check1",
      "type": "checkbox"
    }
  }), _c('label', {
    attrs: {
      "for": "check1"
    }
  }, [_vm._v("Option one")])]), _c('div', {
    staticClass: "form-option"
  }, [_c('input', {
    attrs: {
      "id": "check2",
      "type": "checkbox"
    }
  }), _c('label', {
    attrs: {
      "for": "check2"
    }
  }, [_vm._v("Option two")])])])])])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('section', [_c('h2', [_c('span', {
    staticClass: "number"
  }, [_vm._v("5.")]), _c('span', {
    staticClass: "text"
  }, [_vm._v("Alerts")])]), _c('div', {
    staticClass: "content alerts"
  }, [_c('div', {
    staticClass: "alert"
  }, [_c('i', {
    staticClass: "icon fa fa-info-circle"
  }), _vm._v("This is a neutral alert.\t\t\t\t\t\t")]), _c('div', {
    staticClass: "alert alert-success"
  }, [_c('i', {
    staticClass: "icon fa fa-check"
  }), _vm._v("This is a success alert."), _c('a', {
    staticClass: "alert-close",
    attrs: {
      "href": "x"
    }
  }, [_vm._v("×")])]), _c('div', {
    staticClass: "alert alert-warning"
  }, [_c('i', {
    staticClass: "icon fa fa-exclamation-triangle"
  }), _vm._v("This is a warning alert."), _c('a', {
    staticClass: "alert-close",
    attrs: {
      "href": "x"
    }
  }, [_vm._v("×\t\t\t\t")])]), _c('div', {
    staticClass: "alert alert-error"
  }, [_c('i', {
    staticClass: "icon fa fa-times-circle"
  }), _c('strong', [_vm._v("Error!")]), _vm._v("This is an error alert."), _c('a', {
    staticClass: "alert-close",
    attrs: {
      "href": "x"
    }
  }, [_vm._v("×\t\t")])]), _c('div', {
    staticClass: "alert alert-success"
  }, [_c('h4', [_vm._v("Well done!")]), _c('p', [_vm._v("Aww yeah, you successfully read this important alert message. This example text is going to run a bit longer so that you can see how spacing within an alert works with this kind of content.")])])])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('h2', [_c('span', {
    staticClass: "number"
  }, [_vm._v("6.")]), _c('span', {
    staticClass: "text"
  }, [_vm._v("Tables")])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('thead', [_c('tr', [_c('th', [_vm._v("#")]), _c('th', {
    staticClass: "sortable"
  }, [_vm._v("Name")]), _c('th', {
    staticClass: "sortable"
  }, [_c('i', {
    staticClass: "fa fa-envelope"
  }), _vm._v("Mail")]), _c('th', {
    staticClass: "sortable"
  }, [_c('i', {
    staticClass: "fa fa-phone"
  }), _vm._v("Phone")]), _c('th', {
    staticClass: "sortable text-right"
  }, [_vm._v("Outstanding")]), _c('th', {
    staticClass: "text-right"
  }, [_vm._v("Functions")])])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('tbody', [_c('tr', [_c('td', [_vm._v("1")]), _c('td', [_vm._v("Johnny Avlony")]), _c('td', [_vm._v("info@johnnyavlony.com")]), _c('td', [_vm._v("(740) 841-7566")]), _c('td', {
    staticClass: "text-right"
  }, [_vm._v("$2,400.00")]), _c('td', {
    staticClass: "text-right"
  }, [_c('button', {
    staticClass: "button small"
  }, [_vm._v("Edit")]), _c('button', {
    staticClass: "button small danger"
  }, [_c('i', {
    staticClass: "icon fa fa-trash"
  }), _vm._v("Delete")])])]), _c('tr', [_c('td', [_vm._v("2")]), _c('td', [_vm._v("Johnny Avlony")]), _c('td', [_vm._v("info@johnnyavlony.com")]), _c('td', [_vm._v("(740) 841-7566")]), _c('td', {
    staticClass: "text-right"
  }, [_vm._v("$2,400.00")]), _c('td', {
    staticClass: "text-right"
  }, [_c('button', {
    staticClass: "button small"
  }, [_vm._v("Edit")]), _c('button', {
    staticClass: "button small danger"
  }, [_c('i', {
    staticClass: "icon fa fa-trash"
  }), _vm._v("Delete")])])]), _c('tr', {
    staticClass: "selected"
  }, [_c('td', [_vm._v("3")]), _c('td', [_vm._v("Johnny Avlony")]), _c('td', [_vm._v("info@johnnyavlony.com")]), _c('td', [_vm._v("(740) 841-7566")]), _c('td', {
    staticClass: "text-right"
  }, [_vm._v("$2,400.00")]), _c('td', {
    staticClass: "text-right"
  }, [_c('button', {
    staticClass: "button small"
  }, [_vm._v("Edit")]), _c('button', {
    staticClass: "button small danger"
  }, [_c('i', {
    staticClass: "icon fa fa-trash"
  }), _vm._v("Delete")])])]), _c('tr', {
    staticClass: "inactive"
  }, [_c('td', [_vm._v("4")]), _c('td', [_vm._v("Johnny Avlony")]), _c('td', [_vm._v("info@johnnyavlony.com")]), _c('td', [_vm._v("(740) 841-7566")]), _c('td', {
    staticClass: "text-right"
  }, [_vm._v("$2,400.00")]), _c('td', {
    staticClass: "text-right"
  }, [_c('button', {
    staticClass: "button small"
  }, [_vm._v("Edit")]), _c('button', {
    staticClass: "button small danger"
  }, [_c('i', {
    staticClass: "icon fa fa-trash"
  }), _vm._v("Delete")])])])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('section', [_c('h2', [_c('span', {
    staticClass: "number"
  }, [_vm._v("7.")]), _c('span', {
    staticClass: "text"
  }, [_vm._v("Tags / badges")])]), _c('fieldset', [_c('legend', [_vm._v("Tags")]), _c('div', {
    staticClass: "content flex align-center justify-space-around buttons"
  }, [_c('div', {
    staticClass: "tag"
  }, [_vm._v("Normal")]), _c('div', {
    staticClass: "tag primary"
  }, [_vm._v("Primary")]), _c('div', {
    staticClass: "tag success"
  }, [_vm._v("Success")]), _c('div', {
    staticClass: "tag warning"
  }, [_vm._v("Warning")]), _c('div', {
    staticClass: "tag danger"
  }, [_vm._v("Danger")]), _c('div', {
    staticClass: "tag outline"
  }, [_vm._v("Outline")])])]), _c('fieldset', [_c('legend', [_vm._v("Number tags")]), _c('div', {
    staticClass: "content flex align-center justify-space-around buttons"
  }, [_c('div', {
    staticClass: "tag pill"
  }, [_vm._v("15")]), _c('div', {
    staticClass: "tag pill primary"
  }, [_vm._v("5")]), _c('div', {
    staticClass: "tag pill success"
  }, [_vm._v("100+")]), _c('div', {
    staticClass: "tag pill warning"
  }, [_vm._v("45")]), _c('div', {
    staticClass: "tag pill danger"
  }, [_vm._v("0")]), _c('div', {
    staticClass: "tag pill outline"
  }, [_vm._v("8")])])])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('section', [_c('h2', [_c('span', {
    staticClass: "number"
  }, [_vm._v("8.")]), _c('span', {
    staticClass: "text"
  }, [_vm._v("Progress bars")])]), _c('fieldset', [_c('legend', [_vm._v("Normal")]), _c('div', {
    staticClass: "content buttons"
  }, [_c('div', {
    staticClass: "progressbar"
  }, [_c('div', {
    staticClass: "progress",
    staticStyle: {
      "width": "15%"
    }
  })]), _c('br'), _c('div', {
    staticClass: "progressbar success"
  }, [_c('div', {
    staticClass: "progress",
    staticStyle: {
      "width": "40%"
    }
  }, [_vm._v("40% complete...")])]), _c('br'), _c('div', {
    staticClass: "progressbar warning"
  }, [_c('div', {
    staticClass: "progress",
    staticStyle: {
      "width": "60%"
    }
  }, [_vm._v("60%")])]), _c('br'), _c('div', {
    staticClass: "progressbar danger"
  }, [_c('div', {
    staticClass: "progress",
    staticStyle: {
      "width": "70%"
    }
  })])])]), _c('fieldset', [_c('legend', [_vm._v("Stripped")]), _c('div', {
    staticClass: "content buttons"
  }, [_c('div', {
    staticClass: "progressbar stripped success"
  }, [_c('div', {
    staticClass: "progress",
    staticStyle: {
      "width": "40%"
    }
  }, [_vm._v("40% complete...")])]), _c('br'), _c('div', {
    staticClass: "progressbar stripped danger"
  }, [_c('div', {
    staticClass: "progress",
    staticStyle: {
      "width": "70%"
    }
  })])])]), _c('fieldset', [_c('legend', [_vm._v("Animated")]), _c('div', {
    staticClass: "content buttons"
  }, [_c('div', {
    staticClass: "progressbar stripped animate success"
  }, [_c('div', {
    staticClass: "progress",
    staticStyle: {
      "width": "80%"
    }
  }, [_vm._v("80% complete...")])]), _c('br'), _c('div', {
    staticClass: "progressbar stripped animate warning"
  }, [_c('div', {
    staticClass: "progress",
    staticStyle: {
      "width": "34%"
    }
  })])])]), _c('fieldset', [_c('legend', [_vm._v("Small")]), _c('div', {
    staticClass: "content buttons"
  }, [_c('div', {
    staticClass: "progressbar small"
  }, [_c('div', {
    staticClass: "progress",
    staticStyle: {
      "width": "15%"
    }
  })]), _c('br'), _c('div', {
    staticClass: "progressbar small success stripped"
  }, [_c('div', {
    staticClass: "progress",
    staticStyle: {
      "width": "40%"
    }
  }, [_vm._v("40% complete...")])]), _c('br'), _c('div', {
    staticClass: "progressbar small warning stripped animate"
  }, [_c('div', {
    staticClass: "progress",
    staticStyle: {
      "width": "60%"
    }
  }, [_vm._v("60%")])])])]), _c('fieldset', [_c('legend', [_vm._v("Large")]), _c('div', {
    staticClass: "content buttons"
  }, [_c('div', {
    staticClass: "progressbar large"
  }, [_c('div', {
    staticClass: "progress",
    staticStyle: {
      "width": "15%"
    }
  })]), _c('br'), _c('div', {
    staticClass: "progressbar large success stripped"
  }, [_c('div', {
    staticClass: "progress",
    staticStyle: {
      "width": "40%"
    }
  }, [_vm._v("40% complete...")])]), _c('br'), _c('div', {
    staticClass: "progressbar large warning stripped animate"
  }, [_c('div', {
    staticClass: "progress",
    staticStyle: {
      "width": "60%"
    }
  }, [_vm._v("60%")])])])])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('section', [_c('h2', [_c('span', {
    staticClass: "number"
  }, [_vm._v("9.")]), _c('span', {
    staticClass: "text"
  }, [_vm._v("Panels & Cards")])]), _c('fieldset', [_c('legend', [_vm._v("Normal Panels")]), _c('div', {
    staticClass: "content flex align-center justify-space-around panels"
  }, [_c('div', {
    staticClass: "panel"
  }, [_c('div', {
    staticClass: "header"
  }, [_vm._v("Panel normal")]), _c('div', {
    staticClass: "body"
  }, [_c('p', [_vm._v("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur dicta cumque assumenda culpa maiores omnis totam obcaecati voluptas eligendi sapiente enim debitis, illo dolore facilis, in, nihil perspiciatis, et perferendis.")])])]), _c('div', {
    staticClass: "panel primary"
  }, [_c('div', {
    staticClass: "ribbon right red"
  }, [_c('span', [_vm._v("Primary")])]), _c('div', {
    staticClass: "header"
  }, [_vm._v("Panel primary")]), _c('div', {
    staticClass: "body"
  }, [_c('p', [_vm._v("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur dicta cumque assumenda culpa maiores omnis totam obcaecati voluptas eligendi sapiente enim debitis, illo dolore facilis, in, nihil perspiciatis, et perferendis.")])])]), _c('div', {
    staticClass: "panel success",
    staticStyle: {
      "height": "332px"
    }
  }, [_c('div', {
    staticClass: "header"
  }, [_vm._v("Panel success with list")]), _c('div', {
    staticClass: "body"
  }, [_c('div', {
    staticClass: "list"
  }, [_c('div', {
    staticClass: "item"
  }, [_c('img', {
    staticClass: "avatar",
    attrs: {
      "src": "https://s3.amazonaws.com/uifaces/faces/twitter/kolage/73.jpg"
    }
  }), _c('div', {
    staticClass: "body"
  }, [_c('strong', [_vm._v("Message title "), _c('small', {
    staticClass: "text-muted"
  }, [_vm._v("John Doe")])]), _c('p', {
    staticClass: "text-justify"
  }, [_vm._v("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Facilis eligendi mollitia ratione fugiat earum qui sit vero nisi pariatur eaque quasi reprehenderit possimus consequatur commodi cum quod, amet sed cupiditate?")])]), _c('div', {
    staticClass: "footer text-right"
  }, [_c('small', {
    staticClass: "text-muted"
  }, [_vm._v("1 min ago")])])]), _c('div', {
    staticClass: "item"
  }, [_c('img', {
    staticClass: "avatar",
    attrs: {
      "src": "https://s3.amazonaws.com/uifaces/faces/twitter/kolage/73.jpg"
    }
  }), _c('div', {
    staticClass: "body"
  }, [_c('strong', [_vm._v("Message title "), _c('small', {
    staticClass: "text-muted"
  }, [_vm._v("John Doe")])]), _c('p', {
    staticClass: "text-justify"
  }, [_vm._v("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Facilis eligendi mollitia ratione fugiat earum qui sit vero nisi pariatur eaque quasi reprehenderit possimus consequatur commodi cum quod, amet sed cupiditate? Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eum perferendis sapiente non atque qui quis pariatur impedit ea cupiditate culpa repellat voluptate, ipsam id illo incidunt nam commodi optio? Quasi.")])]), _c('div', {
    staticClass: "footer text-right"
  }, [_c('small', {
    staticClass: "text-muted"
  }, [_vm._v("3 min ago")])])]), _c('div', {
    staticClass: "item"
  }, [_c('img', {
    staticClass: "avatar",
    attrs: {
      "src": "https://s3.amazonaws.com/uifaces/faces/twitter/kolage/73.jpg"
    }
  }), _c('div', {
    staticClass: "body"
  }, [_c('strong', [_vm._v("Message title "), _c('small', {
    staticClass: "text-muted"
  }, [_vm._v("John Doe")])]), _c('p', {
    staticClass: "text-justify"
  }, [_vm._v("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Facilis eligendi mollitia ratione fugiat earum qui sit vero nisi.")])]), _c('div', {
    staticClass: "footer text-right"
  }, [_c('small', {
    staticClass: "text-muted"
  }, [_vm._v("15 min ago")])])]), _c('div', {
    staticClass: "item"
  }, [_c('img', {
    staticClass: "avatar",
    attrs: {
      "src": "https://s3.amazonaws.com/uifaces/faces/twitter/kolage/73.jpg"
    }
  }), _c('div', {
    staticClass: "body"
  }, [_c('strong', [_vm._v("Message title "), _c('small', {
    staticClass: "text-muted"
  }, [_vm._v("John Doe")])]), _c('p', {
    staticClass: "text-justify"
  }, [_vm._v("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Facilis eligendi mollitia ratione fugiat earum qui sit vero nisi pariatur eaque quasi reprehenderit possimus consequatur commodi cum quod, amet sed cupiditate?")])]), _c('div', {
    staticClass: "footer text-right"
  }, [_c('small', {
    staticClass: "text-muted"
  }, [_vm._v("3 hours ago")])])]), _c('div', {
    staticClass: "item"
  }, [_c('img', {
    staticClass: "avatar",
    attrs: {
      "src": "https://s3.amazonaws.com/uifaces/faces/twitter/kolage/73.jpg"
    }
  }), _c('div', {
    staticClass: "body"
  }, [_c('strong', [_vm._v("Message title "), _c('small', {
    staticClass: "text-muted"
  }, [_vm._v("John Doe")])]), _c('p', {
    staticClass: "text-justify"
  }, [_vm._v("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Facilis eligendi mollitia ratione fugiat earum qui sit vero nisi pariatur eaque quasi reprehenderit possimus consequatur commodi cum quod, amet sed cupiditate? Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nemo officia, nulla ad quae. Possimus, necessitatibus excepturi ad vel aspernatur ipsam molestiae. Blanditiis assumenda, doloribus tenetur inventore, earum fugiat! Ducimus, recusandae.")])]), _c('div', {
    staticClass: "footer text-right"
  }, [_c('small', {
    staticClass: "text-muted"
  }, [_vm._v("1 day ago")])])])])])])]), _c('div', {
    staticClass: "content flex align-center justify-space-around panels"
  }, [_c('div', {
    staticClass: "panel warning",
    staticStyle: {
      "max-height": "280px",
      "max-width": "600px"
    }
  }, [_c('div', {
    staticClass: "header"
  }, [_vm._v("Panel warning with scroll")]), _c('div', {
    staticClass: "body"
  }, [_c('p', [_vm._v("Duis ex nulla eu ex quis consectetur amet voluptate qui ipsum aliqua nisi commodo cupidatat. Reprehenderit aliqua sint magna ad eiusmod magna non esse. Ex tempor ex duis dolore commodo labore aliquip ad dolor nulla est. Ex eiusmod labore deserunt velit ad consequat elit. Quis elit cupidatat culpa pariatur excepteur. Elit nulla nisi ut nulla cupidatat ipsum officia sint consectetur in laboris.")]), _c('p', [_vm._v("Voluptate anim in et esse. Voluptate ad est irure eiusmod sit enim pariatur adipisicing. Dolore officia nulla reprehenderit ipsum do aliquip incididunt eiusmod cupidatat exercitation consectetur incididunt.")])]), _c('div', {
    staticClass: "footer"
  }, [_vm._v("Panel footer")])]), _c('div', {
    staticClass: "panel danger"
  }, [_c('div', {
    staticClass: "header"
  }, [_vm._v("Panel danger")]), _c('div', {
    staticClass: "body"
  }, [_c('p', [_vm._v("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur dicta cumque.")])]), _c('div', {
    staticClass: "footer"
  }, [_vm._v("Panel footer")])]), _c('div', {
    staticClass: "panel outline"
  }, [_c('div', {
    staticClass: "header"
  }, [_vm._v("Panel outline")]), _c('div', {
    staticClass: "body"
  }, [_c('p', [_vm._v("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur dicta cumque assumenda culpa maiores omnis totam obcaecati voluptas eligendi sapiente enim debitis, illo dolore facilis, in, nihil perspiciatis, et perferendis.")])])])])]), _c('fieldset', [_c('legend', [_vm._v("Normal cards")]), _c('div', {
    staticClass: "content flex align-center justify-space-around panels"
  }, [_c('div', {
    staticClass: "card"
  }, [_c('div', {
    staticClass: "block"
  }, [_c('div', {
    staticClass: "title"
  }, [_vm._v("Simple Card")]), _c('p', [_vm._v("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur dicta cumque assumenda culpa maiores omnis totam obcaecati voluptas eligendi sapiente enim debitis, illo dolore facilis, in, nihil perspiciatis, et perferendis.")])]), _c('div', {
    staticClass: "block"
  }, [_c('small', {
    staticClass: "text-muted"
  }, [_vm._v("Last updated 5 mins ago")])])]), _c('div', {
    staticClass: "card"
  }, [_c('div', {
    staticClass: "ribbon right orange"
  }, [_c('span', [_vm._v("-20%")])]), _c('img', {
    staticClass: "img",
    attrs: {
      "src": "http://lorempixel.com/350/150/city"
    }
  }), _c('div', {
    staticClass: "block"
  }, [_c('div', {
    staticClass: "title"
  }, [_vm._v("Card with image")]), _c('p', [_vm._v("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur dicta cumque assumenda culpa maiores omnis totam obcaecati voluptas eligendi sapiente enim debitis, illo dolore facilis, in, nihil perspiciatis, et perferendis.")])]), _c('div', {
    staticClass: "block"
  }, [_c('button', {
    staticClass: "button success"
  }, [_vm._v("Checkout")])])]), _c('div', {
    staticClass: "card"
  }, [_c('div', {
    staticClass: "ribbon left primary"
  }, [_c('span', [_vm._v("Brand new")])]), _c('img', {
    staticClass: "img",
    attrs: {
      "src": "http://placehold.it/350x150"
    }
  }), _c('div', {
    staticClass: "block"
  }, [_c('div', {
    staticClass: "title"
  }, [_vm._v("Card Title wih ribbon")]), _c('p', [_vm._v("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur dicta cumque assumenda culpa maiores omnis totam obcaecati voluptas eligendi sapiente enim debitis, illo dolore facilis, in, nihil perspiciatis, et perferendis.")])]), _c('div', {
    staticClass: "block text-right"
  }, [_c('button', {
    staticClass: "button danger"
  }, [_vm._v("DELETE")]), _c('button', {
    staticClass: "button outline"
  }, [_vm._v("Close")])])])])]), _c('fieldset', [_c('legend', [_vm._v("Cards in columns")]), _c('div', {
    staticClass: "content card-columns"
  }, [_c('div', {
    staticClass: "card"
  }, [_c('div', {
    staticClass: "block"
  }, [_c('div', {
    staticClass: "title"
  }, [_vm._v("Small Card 1")]), _c('p', [_vm._v(" Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos repellendus architecto molestiae iure enim labore dolores similique, quia consequatur culpa, at cumque ad tenetur nemo vitae dolorem ipsum repellat optio! "), _c('a', {
    staticClass: "link",
    attrs: {
      "href": "https://twitter.com/Icebobcsi"
    }
  }, [_vm._v("@Icebobcsi")])])]), _c('div', {
    staticClass: "block"
  }, [_c('small', {
    staticClass: "text-muted"
  }, [_vm._v("08:45 PM - 14 Jun 2016")])])]), _c('div', {
    staticClass: "card"
  }, [_c('div', {
    staticClass: "block"
  }, [_c('div', {
    staticClass: "title"
  }, [_vm._v("Small Card 2")]), _c('p', [_vm._v(" Lorem ipsum dolor sit amet, consectetur adipisicing elit. Porro voluptate, neque voluptatibus mollitia aliquid, harum in laborum non amet cupiditate ea nisi necessitatibus quis! Earum architecto corporis molestiae nihil molestias? Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ut, voluptate. Eaque nisi alias consectetur ipsum eveniet qui esse repellat voluptas mollitia, obcaecati corporis a modi officia, architecto commodi eius sint! "), _c('a', {
    staticClass: "link",
    attrs: {
      "href": "https://twitter.com/Icebobcsi"
    }
  }, [_vm._v("@Icebobcsi")])])]), _c('div', {
    staticClass: "block"
  }, [_c('small', {
    staticClass: "text-muted"
  }, [_vm._v("08:45 PM - 14 Jun 2016")])])]), _c('div', {
    staticClass: "card"
  }, [_c('div', {
    staticClass: "block"
  }, [_c('div', {
    staticClass: "title"
  }, [_vm._v("Small Card 3")]), _c('p', [_vm._v(" Lorem ipsum dolor sit amet, consectetur adipisicing elit.  "), _c('a', {
    staticClass: "link",
    attrs: {
      "href": "https://twitter.com/Icebobcsi"
    }
  }, [_vm._v("@Icebobcsi")])])]), _c('div', {
    staticClass: "block"
  }, [_c('small', {
    staticClass: "text-muted"
  }, [_vm._v("08:45 PM - 14 Jun 2016")])])]), _c('div', {
    staticClass: "card"
  }, [_c('img', {
    staticClass: "img",
    attrs: {
      "src": "http://lorempixel.com/600/300/city"
    }
  }), _c('div', {
    staticClass: "block"
  }, [_c('div', {
    staticClass: "title"
  }, [_vm._v("Small Card 4")]), _c('p', [_vm._v("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur dicta cumque assumenda culpa")])]), _c('div', {
    staticClass: "block"
  }, [_c('small', {
    staticClass: "text-muted"
  }, [_vm._v("08:45 PM - 14 Jun 2016")])])]), _c('div', {
    staticClass: "card"
  }, [_c('div', {
    staticClass: "block"
  }, [_c('div', {
    staticClass: "title"
  }, [_vm._v("Small Card 5")]), _c('p', [_vm._v("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur dicta cumque assumenda culpa "), _c('a', {
    staticClass: "link",
    attrs: {
      "href": "https://twitter.com/Icebobcsi"
    }
  }, [_vm._v("@Icebobcsi")])])]), _c('div', {
    staticClass: "block"
  }, [_c('small', {
    staticClass: "text-muted"
  }, [_vm._v("08:45 PM - 14 Jun 2016")])]), _c('div', {
    staticClass: "block"
  }, [_c('button', {
    staticClass: "button success"
  }, [_vm._v("Checkout")])])]), _c('div', {
    staticClass: "card"
  }, [_c('div', {
    staticClass: "block"
  }, [_c('div', {
    staticClass: "title"
  }, [_vm._v("Small Card 6")]), _c('p', [_vm._v("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur dicta cumque assumenda culpa ")]), _c('p', [_vm._v("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Incidunt voluptatum quos autem magnam doloribus sunt. Atque quas accusamus repellat, odio dolore sapiente voluptatibus nemo numquam eum odit tempore, similique natus! "), _c('a', {
    staticClass: "link",
    attrs: {
      "href": "https://twitter.com/Icebobcsi"
    }
  }, [_vm._v("@Icebobcsi")])])]), _c('div', {
    staticClass: "block"
  }, [_c('small', {
    staticClass: "text-muted"
  }, [_vm._v("08:45 PM - 14 Jun 2016")])])]), _c('div', {
    staticClass: "card"
  }, [_c('div', {
    staticClass: "block"
  }, [_c('div', {
    staticClass: "title"
  }, [_vm._v("Small Card 7")]), _c('p', [_vm._v(" Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur dicta cumque assumenda culpa "), _c('a', {
    staticClass: "link",
    attrs: {
      "href": "https://twitter.com/Icebobcsi"
    }
  }, [_vm._v("@Icebobcsi")])])]), _c('div', {
    staticClass: "block"
  }, [_c('small', {
    staticClass: "text-muted"
  }, [_vm._v("08:45 PM - 14 Jun 2016")])])]), _c('div', {
    staticClass: "card"
  }, [_c('div', {
    staticClass: "block"
  }, [_c('div', {
    staticClass: "title"
  }, [_vm._v("Small Card 8")]), _c('p', [_vm._v(" Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur dicta cumque assumenda culpa "), _c('a', {
    staticClass: "link",
    attrs: {
      "href": "https://twitter.com/Icebobcsi"
    }
  }, [_vm._v("@Icebobcsi")])])]), _c('div', {
    staticClass: "block"
  }, [_c('small', {
    staticClass: "text-muted"
  }, [_vm._v("08:45 PM - 14 Jun 2016")])])])])])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('section', [_c('h2', [_c('span', {
    staticClass: "number"
  }, [_vm._v("10.")]), _c('span', {
    staticClass: "text"
  }, [_vm._v("Media")])]), _c('fieldset', [_c('legend', [_vm._v("Normal media")]), _c('div', {
    staticClass: "content list"
  }, [_c('div', {
    staticClass: "media"
  }, [_c('div', {
    staticClass: "media-left"
  }, [_c('img', {
    staticClass: "avatar",
    attrs: {
      "src": "https://s3.amazonaws.com/uifaces/faces/twitter/kolage/73.jpg"
    }
  })]), _c('div', {
    staticClass: "media-content"
  }, [_c('strong', [_vm._v("John Doe")]), _c('small', {
    staticClass: "text-muted"
  }, [_vm._v("@johndoe - 31m ago")]), _c('p', [_vm._v("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur dicta cumque assumenda culpa maiores omnis totam obcaecati voluptas eligendi sapiente enim debitis, illo dolore facilis, in, nihil perspiciatis, et perferendis. ")]), _c('p', [_vm._v("Elit ex id excepteur aliqua sint et culpa nisi laborum. Cupidatat anim aliqua nisi tempor nisi sint mollit non elit laboris consequat. Ut sint mollit voluptate quis sunt magna voluptate incididunt amet voluptate aute occaecat nulla. Nostrud ut eiusmod duis consequat sunt proident in aute esse adipisicing cupidatat commodo consequat dolor. Irure minim consectetur est duis nulla aliqua fugiat culpa proident cupidatat elit magna. Dolor esse magna pariatur sint adipisicing cupidatat veniam excepteur aliquip. Qui fugiat non eiusmod do sunt excepteur enim aliquip reprehenderit ullamco."), _c('a', {
    staticClass: "link",
    attrs: {
      "href": "#"
    }
  }, [_vm._v(" Read more...")])]), _c('div', {
    staticClass: "functions"
  }, [_c('a', {
    attrs: {
      "href": "#"
    }
  }, [_c('i', {
    staticClass: "fa fa-reply"
  })]), _c('a', {
    attrs: {
      "href": "#"
    }
  }, [_c('i', {
    staticClass: "fa fa-heart"
  })]), _c('a', {
    attrs: {
      "href": "#"
    }
  }, [_c('i', {
    staticClass: "fa fa-trash"
  })])])]), _c('div', {
    staticClass: "media-right"
  }, [_c('a', {
    staticClass: "close",
    attrs: {
      "href": "#",
      "title": "Close"
    }
  })])]), _c('div', {
    staticClass: "media primary"
  }, [_c('div', {
    staticClass: "media-left"
  }, [_c('img', {
    staticClass: "avatar",
    attrs: {
      "src": "https://s3.amazonaws.com/uifaces/faces/twitter/kolage/73.jpg"
    }
  })]), _c('div', {
    staticClass: "media-content"
  }, [_c('strong', [_vm._v("John Doe")]), _c('small', {
    staticClass: "text-muted"
  }, [_vm._v("@johndoe - 31m ago")]), _c('p', [_vm._v("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur dicta cumque assumenda culpa maiores omnis totam obcaecati voluptas eligendi sapiente enim debitis, illo dolore facilis, in, nihil perspiciatis, et perferendis. "), _c('a', {
    staticClass: "link",
    attrs: {
      "href": "#"
    }
  }, [_vm._v("Read more...")])]), _c('div', {
    staticClass: "functions"
  }, [_c('a', {
    attrs: {
      "href": "#"
    }
  }, [_c('i', {
    staticClass: "fa fa-reply"
  })]), _c('a', {
    attrs: {
      "href": "#"
    }
  }, [_c('i', {
    staticClass: "fa fa-heart"
  })]), _c('a', {
    attrs: {
      "href": "#"
    }
  }, [_c('i', {
    staticClass: "fa fa-trash"
  })])])]), _c('div', {
    staticClass: "media-right"
  }, [_c('a', {
    staticClass: "close",
    attrs: {
      "href": "#",
      "title": "Close"
    }
  })])]), _c('div', {
    staticClass: "media success"
  }, [_c('div', {
    staticClass: "media-left"
  }, [_c('img', {
    staticClass: "avatar",
    attrs: {
      "src": "https://s3.amazonaws.com/uifaces/faces/twitter/kolage/73.jpg"
    }
  })]), _c('div', {
    staticClass: "media-content"
  }, [_c('strong', [_vm._v("John Doe")]), _c('small', {
    staticClass: "text-muted"
  }, [_vm._v("@johndoe - 31m ago")]), _c('p', [_vm._v("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur dicta cumque assumenda culpa maiores omnis totam obcaecati voluptas eligendi sapiente enim debitis, illo dolore facilis, in, nihil perspiciatis, et perferendis. "), _c('a', {
    staticClass: "link",
    attrs: {
      "href": "#"
    }
  }, [_vm._v("Read more...")])]), _c('div', {
    staticClass: "functions"
  }, [_c('a', {
    attrs: {
      "href": "#"
    }
  }, [_c('i', {
    staticClass: "fa fa-reply"
  })]), _c('a', {
    attrs: {
      "href": "#"
    }
  }, [_c('i', {
    staticClass: "fa fa-heart"
  })]), _c('a', {
    attrs: {
      "href": "#"
    }
  }, [_c('i', {
    staticClass: "fa fa-trash"
  })])])]), _c('div', {
    staticClass: "media-right"
  }, [_c('a', {
    staticClass: "close",
    attrs: {
      "href": "#",
      "title": "Close"
    }
  })])]), _c('div', {
    staticClass: "media warning"
  }, [_c('div', {
    staticClass: "media-left"
  }, [_c('img', {
    staticClass: "avatar",
    attrs: {
      "src": "https://s3.amazonaws.com/uifaces/faces/twitter/kolage/73.jpg"
    }
  })]), _c('div', {
    staticClass: "media-content"
  }, [_c('strong', [_vm._v("John Doe")]), _c('small', {
    staticClass: "text-muted"
  }, [_vm._v("@johndoe - 31m ago")]), _c('p', [_vm._v("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur dicta cumque assumenda culpa maiores omnis totam obcaecati voluptas eligendi sapiente enim debitis, illo dolore facilis, in, nihil perspiciatis, et perferendis. "), _c('a', {
    staticClass: "link",
    attrs: {
      "href": "#"
    }
  }, [_vm._v("Read more...")])]), _c('div', {
    staticClass: "functions"
  }, [_c('a', {
    attrs: {
      "href": "#"
    }
  }, [_c('i', {
    staticClass: "fa fa-reply"
  })]), _c('a', {
    attrs: {
      "href": "#"
    }
  }, [_c('i', {
    staticClass: "fa fa-heart"
  })]), _c('a', {
    attrs: {
      "href": "#"
    }
  }, [_c('i', {
    staticClass: "fa fa-trash"
  })])])]), _c('div', {
    staticClass: "media-right"
  }, [_c('a', {
    staticClass: "close",
    attrs: {
      "href": "#",
      "title": "Close"
    }
  })])]), _c('div', {
    staticClass: "media danger"
  }, [_c('div', {
    staticClass: "media-left"
  }, [_c('img', {
    staticClass: "avatar",
    attrs: {
      "src": "https://s3.amazonaws.com/uifaces/faces/twitter/kolage/73.jpg"
    }
  })]), _c('div', {
    staticClass: "media-content"
  }, [_c('strong', [_vm._v("John Doe")]), _c('small', {
    staticClass: "text-muted"
  }, [_vm._v("@johndoe - 31m ago")]), _c('p', [_vm._v("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur dicta cumque assumenda culpa maiores omnis totam obcaecati voluptas eligendi sapiente enim debitis, illo dolore facilis, in, nihil perspiciatis, et perferendis. "), _c('a', {
    staticClass: "link",
    attrs: {
      "href": "#"
    }
  }, [_vm._v("Read more...")])]), _c('div', {
    staticClass: "functions"
  }, [_c('a', {
    attrs: {
      "href": "#"
    }
  }, [_c('i', {
    staticClass: "fa fa-reply"
  })]), _c('a', {
    attrs: {
      "href": "#"
    }
  }, [_c('i', {
    staticClass: "fa fa-heart"
  })]), _c('a', {
    attrs: {
      "href": "#"
    }
  }, [_c('i', {
    staticClass: "fa fa-trash"
  })])])]), _c('div', {
    staticClass: "media-right"
  }, [_c('a', {
    staticClass: "close",
    attrs: {
      "href": "#",
      "title": "Close"
    }
  })])]), _c('div', {
    staticClass: "media outline"
  }, [_c('div', {
    staticClass: "media-left"
  }, [_c('img', {
    staticClass: "avatar",
    attrs: {
      "src": "https://s3.amazonaws.com/uifaces/faces/twitter/kolage/73.jpg"
    }
  })]), _c('div', {
    staticClass: "media-content"
  }, [_c('strong', [_vm._v("John Doe")]), _c('small', {
    staticClass: "text-muted"
  }, [_vm._v("@johndoe - 31m ago")]), _c('p', [_vm._v("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur dicta cumque assumenda culpa maiores omnis totam obcaecati voluptas eligendi sapiente enim debitis, illo dolore facilis, in, nihil perspiciatis, et perferendis. "), _c('a', {
    staticClass: "link",
    attrs: {
      "href": "#"
    }
  }, [_vm._v("Read more...")])]), _c('div', {
    staticClass: "functions"
  }, [_c('a', {
    attrs: {
      "href": "#"
    }
  }, [_c('i', {
    staticClass: "fa fa-reply"
  })]), _c('a', {
    attrs: {
      "href": "#"
    }
  }, [_c('i', {
    staticClass: "fa fa-heart"
  })]), _c('a', {
    attrs: {
      "href": "#"
    }
  }, [_c('i', {
    staticClass: "fa fa-trash"
  })])])]), _c('div', {
    staticClass: "media-right"
  }, [_c('a', {
    staticClass: "close",
    attrs: {
      "href": "#",
      "title": "Close"
    }
  })])])])])])
}]}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-1adbeb5a", module.exports)
  }
}

/***/ },
/* 383 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('aside', {
    staticClass: "nav",
    class: {
      mini: _vm.minimized
    }
  }, [_c('div', {
    staticClass: "menu"
  }, [_c('div', {
    staticClass: "title"
  }, [_vm._v(_vm._s(_vm._f("i18n")("General")))]), _c('ul', [_c('router-link', {
    attrs: {
      "tag": "li",
      "to": "/"
    }
  }, [_c('a', {
    attrs: {
      "title": _vm._('Home')
    }
  }, [_c('span', {
    staticClass: "icon"
  }, [_c('i', {
    staticClass: "fa fa-home"
  })]), _c('span', {
    staticClass: "label"
  }, [_vm._v(_vm._s(_vm._f("i18n")("Home")))])])]), _c('router-link', {
    attrs: {
      "tag": "li",
      "to": "/counter"
    }
  }, [_c('a', {
    attrs: {
      "title": _vm._('Demo')
    }
  }, [_c('span', {
    staticClass: "icon"
  }, [_c('i', {
    staticClass: "fa fa-tasks"
  })]), _c('span', {
    staticClass: "label"
  }, [_vm._v(_vm._s(_vm._f("i18n")("Demo")))])])]), _c('router-link', {
    attrs: {
      "tag": "li",
      "to": "/devices"
    }
  }, [_c('a', {
    attrs: {
      "title": _vm._('Devices')
    }
  }, [_c('span', {
    staticClass: "icon"
  }, [_c('i', {
    staticClass: "fa fa-tablet"
  })]), _c('span', {
    staticClass: "label"
  }, [_vm._v(_vm._s(_vm._f("i18n")("Devices")))])])]), _c('router-link', {
    attrs: {
      "tag": "li",
      "to": "/posts"
    }
  }, [_c('a', {
    attrs: {
      "title": _vm._('Posts')
    }
  }, [_c('span', {
    staticClass: "icon"
  }, [_c('i', {
    staticClass: "fa fa-comments"
  })]), _c('span', {
    staticClass: "label"
  }, [_vm._v(_vm._s(_vm._f("i18n")("Posts")))])])])], 1), _c('div', {
    staticClass: "title"
  }, [_vm._v(_vm._s(_vm._f("i18n")("Profile")))]), _c('ul', [_c('li', [_c('a', {
    attrs: {
      "href": "/logout",
      "title": _vm._('Logout')
    }
  }, [_vm._m(0), _c('span', {
    staticClass: "label"
  }, [_vm._v(_vm._s(_vm._f("i18n")("Logout")))])])])])]), _vm._m(1)])
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('span', {
    staticClass: "icon"
  }, [_c('i', {
    staticClass: "fa fa-sign-out"
  })])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "footer"
  }, [_c('div', {
    staticClass: "social"
  }, [_c('a', {
    attrs: {
      "href": "",
      "target": "_blank"
    }
  }, [_c('i', {
    staticClass: "fa fa-facebook"
  })]), _c('a', {
    attrs: {
      "href": "https://twitter.com/Icebobcsi",
      "target": "_blank"
    }
  }, [_c('i', {
    staticClass: "fa fa-twitter"
  })]), _c('a', {
    attrs: {
      "href": "https://github.com/icebob/vue-express-mongo-boilerplate",
      "target": "_blank"
    }
  }, [_c('i', {
    staticClass: "fa fa-github"
  })])]), _c('div', {
    staticClass: "copyright"
  }, [_vm._v("© Copyright, 2016")])])
}]}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-43662120", module.exports)
  }
}

/***/ },
/* 384 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _vm._m(0)
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "logo"
  }, [_c('a', {
    staticClass: "nav-item",
    attrs: {
      "href": "#"
    }
  }, [_c('span', [_c('strong', [_vm._v("VEM")]), _vm._v("App")])])])
}]}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-46658238", module.exports)
  }
}

/***/ },
/* 385 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('table', {
    staticClass: "table stripped"
  }, [_c('thead', [_c('tr', [(_vm.schema.multiSelect) ? _c('th', {
    staticClass: "selector",
    attrs: {
      "width": "20px"
    },
    on: {
      "click": _vm.selectAll
    }
  }, [_c('i', {
    staticClass: "fa fa-square-o"
  })]) : _vm._e(), _vm._l((_vm.schema.columns), function(col) {
    return _c('th', {
      staticClass: "sortable",
      class: {
        sorted: col.field == _vm.order.field, 'desc': col.field == _vm.order.field && _vm.order.direction == -1
      },
      attrs: {
        "width": col.width || 'auto'
      },
      on: {
        "click": function($event) {
          _vm.changeSort(col)
        }
      }
    }, [_vm._v(_vm._s(col.title))])
  })], 2)]), _c('tbody', _vm._l((_vm.filteredOrderedRows), function(row) {
    return _c('tr', {
      class: _vm.getRowClasses(row),
      on: {
        "click": function($event) {
          _vm.select($event, row)
        }
      }
    }, [(_vm.schema.multiSelect) ? _c('td', {
      staticClass: "selector",
      attrs: {
        "width": "20px"
      },
      on: {
        "click": function($event) {
          $event.stopPropagation();
          $event.preventDefault();
          _vm.select($event, row, true)
        }
      }
    }, [_c('i', {
      staticClass: "fa fa-square-o"
    })]) : _vm._e(), _vm._l((_vm.schema.columns), function(col) {
      return _c('td', {
        class: _vm.getCellClasses(row, col)
      }, [_c('span', {
        domProps: {
          "innerHTML": _vm._s(_vm.getCellValue(row, col))
        }
      }), (col.labels != null) ? _c('span', {
        staticClass: "labels"
      }, _vm._l((col.labels(row)), function(label) {
        return _c('div', {
          staticClass: "label",
          class: 'label-' + label.type
        }, [_vm._v(_vm._s(label.caption))])
      })) : _vm._e()])
    })], 2)
  })), _c('tfoot', [_c('tr', [_c('td'), _vm._l((_vm.schema.columns), function(col) {
    return _c('td', [_vm._v(" ")])
  })], 2)])], 1)
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-51dc5790", module.exports)
  }
}

/***/ },
/* 386 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "messages-dropdown",
    class: {
      'visible': _vm.visible
    }
  }, [_c('div', {
    staticClass: "panel"
  }, [_c('div', {
    staticClass: "header"
  }, [_c('div', {
    staticClass: "left"
  }, [_vm._v(_vm._s(_vm._f("i18n")("Messages")))]), _c('div', {
    staticClass: "right"
  }, [_c('a', {
    staticClass: "link",
    attrs: {
      "href": "#"
    }
  }, [_c('small', [_vm._v(_vm._s(_vm._f("i18n")("MarkAllAsRead")))])])])]), _vm._m(0), _c('div', {
    staticClass: "footer text-center"
  }, [_c('a', {
    staticClass: "link",
    attrs: {
      "href": "#"
    }
  }, [_vm._v(_vm._s(_vm._f("i18n")("SeeAllMessages")))])])])])
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "body"
  }, [_c('div', {
    staticClass: "list"
  }, [_c('div', {
    staticClass: "item"
  }, [_c('img', {
    staticClass: "avatar",
    attrs: {
      "src": "https://s3.amazonaws.com/uifaces/faces/twitter/dustin/73.jpg"
    }
  }), _c('div', {
    staticClass: "body"
  }, [_c('strong', [_vm._v("Message title "), _c('small', {
    staticClass: "text-muted"
  }, [_vm._v("John Doe")])]), _c('p', {
    staticClass: "text-justify"
  }, [_vm._v("Cupidatat eiusmod commodo excepteur velit magna. Aliqua eu tempor officia officia et ipsum magna sint cillum Lorem reprehenderit.")])]), _c('div', {
    staticClass: "footer text-right"
  }, [_c('small', {
    staticClass: "text-muted"
  }, [_vm._v("1 min ago")])])]), _c('div', {
    staticClass: "item"
  }, [_c('img', {
    staticClass: "avatar",
    attrs: {
      "src": "https://s3.amazonaws.com/uifaces/faces/twitter/connor_gaunt/73.jpg"
    }
  }), _c('div', {
    staticClass: "body"
  }, [_c('strong', [_vm._v("Message title "), _c('small', {
    staticClass: "text-muted"
  }, [_vm._v("John Doe")])]), _c('p', {
    staticClass: "text-justify"
  }, [_vm._v("Laborum laboris nulla nisi labore.")])]), _c('div', {
    staticClass: "footer text-right"
  }, [_c('small', {
    staticClass: "text-muted"
  }, [_vm._v("3 min ago")])])])])])
}]}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-5c16e09a", module.exports)
  }
}

/***/ },
/* 387 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('admin-page', {
    attrs: {
      "schema": _vm.schema,
      "selected": _vm.selected,
      "rows": _vm.devices
    }
  })
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-6cd63476", module.exports)
  }
}

/***/ },
/* 388 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "search-box"
  }, [_c('i', {
    staticClass: "fa fa-search"
  }), _c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.text),
      expression: "text"
    }],
    attrs: {
      "type": "search",
      "placeholder": _vm._('Search3dots')
    },
    domProps: {
      "value": _vm._s(_vm.text)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.text = $event.target.value
      }
    }
  })])
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-751a1f73", module.exports)
  }
}

/***/ },
/* 389 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "container"
  }, [_c('h3', {
    staticClass: "title"
  }, [_vm._v(_vm._s(_vm.schema.title))]), _c('div', {
    staticClass: "flex align-center justify-space-around"
  }, [(_vm.enabledNew) ? _c('div', {
    staticClass: "left"
  }, [_c('button', {
    staticClass: "button is-primary",
    on: {
      "click": _vm.newModel
    }
  }, [_c('i', {
    staticClass: "icon fa fa-plus"
  }), _vm._v(_vm._s(_vm.schema.resources.addCaption || _vm._("Add")))])]) : _vm._e(), _c('div', {
    staticClass: "right"
  }, [_vm._v(_vm._s(_vm._("SelectedOfAll", {
    selected: _vm.selected.length,
    all: _vm.rows.length
  })))])]), _c('data-table', {
    attrs: {
      "schema": _vm.schema.table,
      "rows": _vm.rows,
      "order": _vm.order,
      "search": _vm.search,
      "selected": _vm.selected,
      "select": _vm.select,
      "select-all": _vm.selectAll
    }
  }), (_vm.model) ? _c('div', {
    staticClass: "form"
  }, [_c('vue-form-generator', {
    ref: "form",
    attrs: {
      "schema": _vm.schema.form,
      "model": _vm.model,
      "options": _vm.options,
      "multiple": _vm.selected.length > 1,
      "is-new-model": _vm.isNewModel
    }
  }), _c('div', {
    staticClass: "errors text-center"
  }, _vm._l((_vm.validationErrors), function(item, index) {
    return _c('div', {
      key: index,
      staticClass: "alert alert-danger"
    }, [_vm._v(_vm._s(item.field.label) + ": "), _c('strong', [_vm._v(_vm._s(item.error))])])
  })), _c('div', {
    staticClass: "buttons flex justify-space-around"
  }, [_c('button', {
    staticClass: "button primary",
    attrs: {
      "disabled": !_vm.enabledSave
    },
    on: {
      "click": _vm.saveModel
    }
  }, [_c('i', {
    staticClass: "icon fa fa-save"
  }), _vm._v(_vm._s(_vm.schema.resources.saveCaption || _vm._("Save")))]), _c('button', {
    staticClass: "button outline",
    attrs: {
      "disabled": !_vm.enabledClone
    },
    on: {
      "click": _vm.cloneModel
    }
  }, [_c('i', {
    staticClass: "icon fa fa-copy"
  }), _vm._v(_vm._s(_vm.schema.resources.cloneCaption || _vm._("Clone")))]), _c('button', {
    staticClass: "button danger",
    attrs: {
      "disabled": !_vm.enabledDelete
    },
    on: {
      "click": _vm.deleteModel
    }
  }, [_c('i', {
    staticClass: "icon fa fa-trash"
  }), _vm._v(_vm._s(_vm.schema.resources.deleteCaption || _vm._("Delete")))])])], 1) : _vm._e()], 1)
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-8c07cb7e", module.exports)
  }
}

/***/ },
/* 390 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('section', {
    staticClass: "page-header"
  }, [_c('logo', {
    staticClass: "left"
  }), _c('div', {
    staticClass: "menu-toggle left",
    on: {
      "click": function($event) {
        _vm.toggleSidebar()
      }
    }
  }, [_c('i', {
    staticClass: "fa fa-bars"
  })]), _c('search-box', {
    staticClass: "left"
  }), _c('user-box', {
    staticClass: "right"
  })], 1)
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-94698cd6", module.exports)
  }
}

/***/ },
/* 391 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "notification-dropdown",
    class: {
      'visible': _vm.visible
    }
  }, [_c('div', {
    staticClass: "panel"
  }, [_c('div', {
    staticClass: "header"
  }, [_c('div', {
    staticClass: "left"
  }, [_vm._v(_vm._s(_vm._f("i18n")("Notifications")))]), _c('div', {
    staticClass: "right"
  }, [_c('a', {
    staticClass: "link",
    attrs: {
      "href": "#"
    }
  }, [_c('small', [_vm._v(_vm._s(_vm._f("i18n")("MarkAllAsRead")))])])])]), _vm._m(0), _c('div', {
    staticClass: "footer text-center"
  }, [_c('a', {
    staticClass: "link",
    attrs: {
      "href": "#"
    }
  }, [_vm._v(_vm._s(_vm._f("i18n")("SeeAllNotifications")))])])])])
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "body"
  }, [_c('div', {
    staticClass: "list"
  }, [_c('div', {
    staticClass: "item"
  }, [_c('img', {
    staticClass: "avatar",
    attrs: {
      "src": "https://s3.amazonaws.com/uifaces/faces/twitter/dustin/73.jpg"
    }
  }), _c('div', {
    staticClass: "body"
  }, [_c('p', {
    staticClass: "text-justify"
  }, [_c('strong', [_vm._v("Thomas ")]), _vm._v("posted a new article")])]), _c('div', {
    staticClass: "footer text-right"
  }, [_c('small', {
    staticClass: "text-muted"
  }, [_vm._v("1 min ago")])])]), _c('div', {
    staticClass: "item"
  }, [_c('img', {
    staticClass: "avatar",
    attrs: {
      "src": "https://s3.amazonaws.com/uifaces/faces/twitter/connor_gaunt/73.jpg"
    }
  }), _c('div', {
    staticClass: "body"
  }, [_c('p', {
    staticClass: "text-justify"
  }, [_c('strong', [_vm._v("Adam ")]), _vm._v("changed his contact information")])]), _c('div', {
    staticClass: "footer text-right"
  }, [_c('small', {
    staticClass: "text-muted"
  }, [_vm._v("3 min ago")])])]), _c('div', {
    staticClass: "item"
  }, [_c('img', {
    staticClass: "avatar",
    attrs: {
      "src": "https://s3.amazonaws.com/uifaces/faces/twitter/adellecharles/73.jpg"
    }
  }), _c('div', {
    staticClass: "body"
  }, [_c('p', {
    staticClass: "text-justify"
  }, [_c('strong', [_vm._v("Samantha ")]), _vm._v("replied to your comment")])]), _c('div', {
    staticClass: "footer text-right"
  }, [_c('small', {
    staticClass: "text-muted"
  }, [_vm._v("15 min ago")])])]), _c('div', {
    staticClass: "item"
  }, [_c('img', {
    staticClass: "avatar",
    attrs: {
      "src": "https://s3.amazonaws.com/uifaces/faces/twitter/ritu/73.jpg"
    }
  }), _c('div', {
    staticClass: "body"
  }, [_c('p', {
    staticClass: "text-justify"
  }, [_c('strong', [_vm._v("Bill ")]), _vm._v("bought a new TV")])]), _c('div', {
    staticClass: "footer text-right"
  }, [_c('small', {
    staticClass: "text-muted"
  }, [_vm._v("3 hours ago")])])]), _c('div', {
    staticClass: "item"
  }, [_c('img', {
    staticClass: "avatar",
    attrs: {
      "src": "https://s3.amazonaws.com/uifaces/faces/twitter/sauro/73.jpg"
    }
  }), _c('div', {
    staticClass: "body"
  }, [_c('p', {
    staticClass: "text-justify"
  }, [_c('strong', [_vm._v("Chris ")]), _vm._v("posted a new blog post")])]), _c('div', {
    staticClass: "footer text-right"
  }, [_c('small', {
    staticClass: "text-muted"
  }, [_vm._v("1 day ago")])])])])])
}]}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-bb9409de", module.exports)
  }
}

/***/ },
/* 392 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "container"
  }, [_c('h2', {
    staticClass: "title"
  }, [_vm._v(_vm._s(_vm._f("i18n")("Demo")))]), _c('h3', [_vm._v(_vm._s(_vm.count))]), _c('button', {
    staticClass: "button success",
    on: {
      "click": _vm.inc
    }
  }, [_vm._m(0), _c('span', [_vm._v(_vm._s(_vm._f("i18n")("Increment")))])]), _c('br'), _c('br'), _c('button', {
    staticClass: "button warning",
    on: {
      "click": _vm.dec
    }
  }, [_vm._m(1), _c('span', [_vm._v(_vm._s(_vm._f("i18n")("Decrement")))])])])
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('span', {
    staticClass: "icon"
  }, [_c('i', {
    staticClass: "fa fa-arrow-up"
  })])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('span', [_c('i', {
    staticClass: "fa fa-arrow-up"
  })])
}]}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-cc3417b8", module.exports)
  }
}

/***/ },
/* 393 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('ul', {
    staticClass: "dropdown-menu user-menu",
    class: {
      'visible': _vm.visible
    }
  }, [_c('router-link', {
    attrs: {
      "tag": "li",
      "to": "/profile"
    }
  }, [_c('a', [_c('div', {
    staticClass: "icon"
  }, [_c('i', {
    staticClass: "fa fa-user"
  })]), _vm._v(_vm._s(_vm._f("i18n")("MyAccount")))])]), _c('router-link', {
    attrs: {
      "tag": "li",
      "to": "/settings"
    }
  }, [_c('a', [_c('div', {
    staticClass: "icon"
  }, [_c('i', {
    staticClass: "fa fa-cog"
  })]), _vm._v(_vm._s(_vm._f("i18n")("Settings")))])]), _c('li', {
    staticClass: "separator"
  }), _c('li', [_c('a', {
    attrs: {
      "href": "/logout"
    }
  }, [_vm._m(0), _vm._v(_vm._s(_vm._f("i18n")("Logout")))])])], 1)
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "icon"
  }, [_c('i', {
    staticClass: "fa fa-power-off"
  })])
}]}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-d5e33b9c", module.exports)
  }
}

/***/ },
/* 394 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "container"
  }, [_c('div', {
    staticClass: "profile flex row align-stretch"
  }, [_c('img', {
    staticClass: "avatar",
    attrs: {
      "src": _vm.profile.avatar
    }
  }), _c('div', {
    staticClass: "details flex-item-1"
  }, [_c('div', {
    staticClass: "name"
  }, [_vm._v(_vm._s(_vm.profile.fullName)), _c('span', {
    staticClass: "text-muted username"
  }, [_vm._v("(" + _vm._s(_vm.profile.username) + ")")])]), _vm._m(0), _c('div', {
    staticClass: "description"
  }, [(_vm.profile.profile && _vm.profile.profile.location) ? _c('div', {
    staticClass: "info-row"
  }, [_c('i', {
    staticClass: "fa fa-map-marker"
  }), _c('span', {
    staticClass: "caption"
  }, [_vm._v("Location:")]), _c('span', {
    staticClass: "value"
  }, [_vm._v(_vm._s(_vm.profile.profile.location))])]) : _vm._e(), _vm._m(1), _c('div', {
    staticClass: "info-row"
  }, [_c('i', {
    staticClass: "fa fa-calendar"
  }), _c('span', {
    staticClass: "caption"
  }, [_vm._v("Joined:")]), _c('span', {
    staticClass: "value"
  }, [_vm._v(_vm._s(_vm._f("ago")(_vm.profile.createdAt)) + "\t\t\t\t\t\t\t")])])]), _c('hr', {
    staticClass: "full"
  })])]), _c('pre', {
    domProps: {
      "innerHTML": _vm._s(this.$options.filters.prettyJSON(_vm.profile))
    }
  })])
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "tags"
  }, [_c('div', {
    staticClass: "tag primary"
  }, [_vm._v("!Role name!")]), _c('div', {
    staticClass: "tag danger"
  }, [_vm._v("!Administrator!")]), _c('div', {
    staticClass: "tag success"
  }, [_vm._v("!Online!")])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "info-row"
  }, [_c('i', {
    staticClass: "fa fa-clock-o"
  }), _c('span', {
    staticClass: "caption"
  }, [_vm._v("Last login:")]), _c('span', {
    staticClass: "value"
  }, [_vm._v("!Online!")])])
}]}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-d87398de", module.exports)
  }
}

/***/ },
/* 395 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return (_vm.me) ? _c('div', {
    staticClass: "user-box"
  }, [_c('div', {
    staticClass: "user-info right",
    on: {
      "click": function($event) {
        _vm.toggleUserMenu()
      }
    }
  }, [_c('img', {
    staticClass: "avatar",
    attrs: {
      "src": _vm.me.avatar
    }
  }), _c('div', {
    staticClass: "username"
  }, [_vm._v(_vm._s(_vm.me.fullName))]), _c('i', {
    staticClass: "fa fa-chevron-down"
  })]), _c('user-dropdown', {
    attrs: {
      "visible": _vm.expandedUserMenu
    }
  }), _c('div', {
    staticClass: "notification-box right"
  }, [_c('ul', {
    staticClass: "icons"
  }, [_c('li', {
    class: {
      active: _vm.notifications.length > 0
    },
    on: {
      "click": function($event) {
        _vm.toggleNotifications()
      }
    }
  }, [_c('i', {
    staticClass: "fa fa-bell-o"
  }), _c('span', [_vm._v(_vm._s(_vm.notifications.length))]), _c('div', {
    staticClass: "ring"
  })]), _c('li', {
    class: {
      active: _vm.messages.length > 0
    },
    on: {
      "click": function($event) {
        _vm.toggleMessages()
      }
    }
  }, [_c('i', {
    staticClass: "fa fa-envelope-o"
  }), _c('span', [_vm._v(_vm._s(_vm.messages.length))]), _c('div', {
    staticClass: "ring"
  })])]), _c('notifications-dropdown', {
    attrs: {
      "visible": _vm.expandedNotifications
    }
  }), _c('messages-dropdown', {
    attrs: {
      "visible": _vm.expandedMessages
    }
  })], 1)], 1) : _vm._e()
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-de058854", module.exports)
  }
}

/***/ },
/* 396 */
/***/ function(module, exports) {

/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {module.exports = __webpack_amd_options__;

/* WEBPACK VAR INJECTION */}.call(exports, {}))

/***/ },
/* 397 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module, global) {var __WEBPACK_AMD_DEFINE_RESULT__;/*! https://mths.be/wtf8 v1.0.0 by @mathias */
;(function(root) {

	// Detect free variables `exports`
	var freeExports = typeof exports == 'object' && exports;

	// Detect free variable `module`
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code,
	// and use it as `root`
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	var stringFromCharCode = String.fromCharCode;

	// Taken from https://mths.be/punycode
	function ucs2decode(string) {
		var output = [];
		var counter = 0;
		var length = string.length;
		var value;
		var extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	// Taken from https://mths.be/punycode
	function ucs2encode(array) {
		var length = array.length;
		var index = -1;
		var value;
		var output = '';
		while (++index < length) {
			value = array[index];
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
		}
		return output;
	}

	/*--------------------------------------------------------------------------*/

	function createByte(codePoint, shift) {
		return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
	}

	function encodeCodePoint(codePoint) {
		if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
			return stringFromCharCode(codePoint);
		}
		var symbol = '';
		if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
			symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
		}
		else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
			symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
			symbol += createByte(codePoint, 6);
		}
		else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
			symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
			symbol += createByte(codePoint, 12);
			symbol += createByte(codePoint, 6);
		}
		symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
		return symbol;
	}

	function wtf8encode(string) {
		var codePoints = ucs2decode(string);
		var length = codePoints.length;
		var index = -1;
		var codePoint;
		var byteString = '';
		while (++index < length) {
			codePoint = codePoints[index];
			byteString += encodeCodePoint(codePoint);
		}
		return byteString;
	}

	/*--------------------------------------------------------------------------*/

	function readContinuationByte() {
		if (byteIndex >= byteCount) {
			throw Error('Invalid byte index');
		}

		var continuationByte = byteArray[byteIndex] & 0xFF;
		byteIndex++;

		if ((continuationByte & 0xC0) == 0x80) {
			return continuationByte & 0x3F;
		}

		// If we end up here, it’s not a continuation byte.
		throw Error('Invalid continuation byte');
	}

	function decodeSymbol() {
		var byte1;
		var byte2;
		var byte3;
		var byte4;
		var codePoint;

		if (byteIndex > byteCount) {
			throw Error('Invalid byte index');
		}

		if (byteIndex == byteCount) {
			return false;
		}

		// Read the first byte.
		byte1 = byteArray[byteIndex] & 0xFF;
		byteIndex++;

		// 1-byte sequence (no continuation bytes)
		if ((byte1 & 0x80) == 0) {
			return byte1;
		}

		// 2-byte sequence
		if ((byte1 & 0xE0) == 0xC0) {
			var byte2 = readContinuationByte();
			codePoint = ((byte1 & 0x1F) << 6) | byte2;
			if (codePoint >= 0x80) {
				return codePoint;
			} else {
				throw Error('Invalid continuation byte');
			}
		}

		// 3-byte sequence (may include unpaired surrogates)
		if ((byte1 & 0xF0) == 0xE0) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			codePoint = ((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3;
			if (codePoint >= 0x0800) {
				return codePoint;
			} else {
				throw Error('Invalid continuation byte');
			}
		}

		// 4-byte sequence
		if ((byte1 & 0xF8) == 0xF0) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			byte4 = readContinuationByte();
			codePoint = ((byte1 & 0x0F) << 0x12) | (byte2 << 0x0C) |
				(byte3 << 0x06) | byte4;
			if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
				return codePoint;
			}
		}

		throw Error('Invalid WTF-8 detected');
	}

	var byteArray;
	var byteCount;
	var byteIndex;
	function wtf8decode(byteString) {
		byteArray = ucs2decode(byteString);
		byteCount = byteArray.length;
		byteIndex = 0;
		var codePoints = [];
		var tmp;
		while ((tmp = decodeSymbol()) !== false) {
			codePoints.push(tmp);
		}
		return ucs2encode(codePoints);
	}

	/*--------------------------------------------------------------------------*/

	var wtf8 = {
		'version': '1.0.0',
		'encode': wtf8encode,
		'decode': wtf8decode
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		true
	) {
		!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
			return wtf8;
		}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = wtf8;
		} else { // in Narwhal or RingoJS v0.7.0-
			var object = {};
			var hasOwnProperty = object.hasOwnProperty;
			for (var key in wtf8) {
				hasOwnProperty.call(wtf8, key) && (freeExports[key] = wtf8[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.wtf8 = wtf8;
	}

}(this));

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)(module), __webpack_require__(1)))

/***/ },
/* 398 */
/***/ function(module, exports) {

/* (ignored) */

/***/ },
/* 399 */,
/* 400 */
/***/ function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(200);


/***/ }
],[400]);