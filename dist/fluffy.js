(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Fluffy = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var audio = require('./lib/audio');

module.exports = function() {

  this.playing = false;

  this.audio = audio;
  //this.currentTime = audio.currentTime;
  //this.duration = audio.duration;
  
  this.play = function(src) {
    if (src != audio.src) { audio.src = src; }
    audio.play();
    this.playing = src;
  }

  this.pause = function() {
    audio.pause();
    this.playing = false;
  }

  this.playPause = function(src) {
    if (src != this.playing) {
      this.play(src);
    } else {
      this.pause();
    }
  }

  this.seek = function(e) {
    if (!audio.readyState) return false;
    var percent = e.offsetX / e.target.offsetWidth || (e.layerX - e.target.offsetLeft) / e.target.offsetWidth;
    var time = percent * audio.duration || 0;
    audio.currentTime = time;
  }

  this.init = function() {
    // Potentially add audio event listeners
    return this;
  }

  return this.init();

};


},{"./lib/audio":2}],2:[function(require,module,exports){
(function (global){
// Audio element

var audio = global.audio || document.createElement('audio');

module.exports = audio;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){

module.exports = function(n, options) {

  var options = options || {};

  var hours = Math.floor(n / 3600),
    mins = '0' + Math.floor((n % 3600) / 60),
    secs = '0' + Math.floor((n % 60));

  mins = mins.substr(mins.length - 2);
  secs = secs.substr(secs.length - 2);

  if(!isNaN(secs)){
    if (hours){
      return hours+':'+mins+':'+secs;  
    } else {
      return mins+':'+secs;  
    };
  } else {
    return '00:00';
  };

};


},{}],4:[function(require,module,exports){

var qs = require('query-string');
var corslite = require('corslite');
var jsonp = require('browser-jsonp');


var endpoint = 'https://api.soundcloud.com/resolve.json';

module.exports = function(params) {

  var params = params || {};
  var options;
  var callback;

  if (typeof arguments[1] === 'object') {
    options = arguments[1];
    callback = arguments[2];
  } else {
    options = {};
    callback = arguments[1];
  }

  var url = endpoint + '?' + qs.stringify(params);

  corslite(url, function(err, res) {
    try {
      if (err) throw err;
      if (!err) {
        res = JSON.parse(res.response) || res;
        callback(err, res);
      }
    } catch(e) {
      jsonp({
        url: url,
        error: function(err) {
          callback(err);
        },
        success: function(res) {
          callback(null, res);
        }
      });
    }
  }, true);

};


},{"browser-jsonp":5,"corslite":6,"query-string":7}],5:[function(require,module,exports){
(function() {
  var JSONP, computedUrl, createElement, encode, noop, objectToURI, random, randomString;

  createElement = function(tag) {
    return window.document.createElement(tag);
  };

  encode = window.encodeURIComponent;

  random = Math.random;

  JSONP = function(options) {
    var callback, done, head, params, script;
    options = options ? options : {};
    params = {
      data: options.data || {},
      error: options.error || noop,
      success: options.success || noop,
      beforeSend: options.beforeSend || noop,
      complete: options.complete || noop,
      url: options.url || ''
    };
    params.computedUrl = computedUrl(params);
    if (params.url.length === 0) {
      throw new Error('MissingUrl');
    }
    done = false;
    if (params.beforeSend({}, params) !== false) {
      callback = params.data[options.callbackName || 'callback'] = 'jsonp_' + randomString(15);
      window[callback] = function(data) {
        params.success(data, params);
        params.complete(data, params);
        try {
          return delete window[callback];
        } catch (_error) {
          window[callback] = void 0;
          return void 0;
        }
      };
      script = createElement('script');
      script.src = computedUrl(params);
      script.async = true;
      script.onerror = function(evt) {
        params.error({
          url: script.src,
          event: evt
        });
        return params.complete({
          url: script.src,
          event: evt
        }, params);
      };
      script.onload = script.onreadystatechange = function() {
        if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
          done = true;
          script.onload = script.onreadystatechange = null;
          if (script && script.parentNode) {
            script.parentNode.removeChild(script);
          }
          return script = null;
        }
      };
      head = head || window.document.getElementsByTagName('head')[0] || window.document.documentElement;
      return head.insertBefore(script, head.firstChild);
    }
  };

  noop = function() {
    return void 0;
  };

  computedUrl = function(params) {
    var url;
    url = params.url;
    url += params.url.indexOf('?') < 0 ? '?' : '&';
    url += objectToURI(params.data);
    return url;
  };

  randomString = function(length) {
    var str;
    str = '';
    while (str.length < length) {
      str += random().toString(36)[2];
    }
    return str;
  };

  objectToURI = function(obj) {
    var data, key, value;
    data = [];
    for (key in obj) {
      value = obj[key];
      data.push(encode(key) + '=' + encode(value));
    }
    return data.join('&');
  };

  if ((typeof define !== "undefined" && define !== null) && define.amd) {
    define(function() {
      return JSONP;
    });
  } else if ((typeof module !== "undefined" && module !== null) && module.exports) {
    module.exports = JSONP;
  } else {
    this.JSONP = JSONP;
  }

}).call(this);

},{}],6:[function(require,module,exports){
function corslite(url, callback, cors) {
    var sent = false;

    if (typeof window.XMLHttpRequest === 'undefined') {
        return callback(Error('Browser not supported'));
    }

    if (typeof cors === 'undefined') {
        var m = url.match(/^\s*https?:\/\/[^\/]*/);
        cors = m && (m[0] !== location.protocol + '//' + location.domain +
                (location.port ? ':' + location.port : ''));
    }

    var x = new window.XMLHttpRequest();

    function isSuccessful(status) {
        return status >= 200 && status < 300 || status === 304;
    }

    if (cors && !('withCredentials' in x)) {
        // IE8-9
        x = new window.XDomainRequest();

        // Ensure callback is never called synchronously, i.e., before
        // x.send() returns (this has been observed in the wild).
        // See https://github.com/mapbox/mapbox.js/issues/472
        var original = callback;
        callback = function() {
            if (sent) {
                original.apply(this, arguments);
            } else {
                var that = this, args = arguments;
                setTimeout(function() {
                    original.apply(that, args);
                }, 0);
            }
        }
    }

    function loaded() {
        if (
            // XDomainRequest
            x.status === undefined ||
            // modern browsers
            isSuccessful(x.status)) callback.call(x, null, x);
        else callback.call(x, x, null);
    }

    // Both `onreadystatechange` and `onload` can fire. `onreadystatechange`
    // has [been supported for longer](http://stackoverflow.com/a/9181508/229001).
    if ('onload' in x) {
        x.onload = loaded;
    } else {
        x.onreadystatechange = function readystate() {
            if (x.readyState === 4) {
                loaded();
            }
        };
    }

    // Call the callback with the XMLHttpRequest object as an error and prevent
    // it from ever being called again by reassigning it to `noop`
    x.onerror = function error(evt) {
        // XDomainRequest provides no evt parameter
        callback.call(this, evt || true, null);
        callback = function() { };
    };

    // IE9 must have onprogress be set to a unique function.
    x.onprogress = function() { };

    x.ontimeout = function(evt) {
        callback.call(this, evt, null);
        callback = function() { };
    };

    x.onabort = function(evt) {
        callback.call(this, evt, null);
        callback = function() { };
    };

    // GET is the only supported HTTP Verb by XDomainRequest and is the
    // only one supported here.
    x.open('GET', url, true);

    // Send the request. Sending data is not supported.
    x.send(null);
    sent = true;

    return x;
}

if (typeof module !== 'undefined') module.exports = corslite;

},{}],7:[function(require,module,exports){
/*!
	query-string
	Parse and stringify URL query strings
	https://github.com/sindresorhus/query-string
	by Sindre Sorhus
	MIT License
*/
(function () {
	'use strict';
	var queryString = {};

	queryString.parse = function (str) {
		if (typeof str !== 'string') {
			return {};
		}

		str = str.trim().replace(/^(\?|#)/, '');

		if (!str) {
			return {};
		}

		return str.trim().split('&').reduce(function (ret, param) {
			var parts = param.replace(/\+/g, ' ').split('=');
			var key = parts[0];
			var val = parts[1];

			key = decodeURIComponent(key);
			// missing `=` should be `null`:
			// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
			val = val === undefined ? null : decodeURIComponent(val);

			if (!ret.hasOwnProperty(key)) {
				ret[key] = val;
			} else if (Array.isArray(ret[key])) {
				ret[key].push(val);
			} else {
				ret[key] = [ret[key], val];
			}

			return ret;
		}, {});
	};

	queryString.stringify = function (obj) {
		return obj ? Object.keys(obj).map(function (key) {
			var val = obj[key];

			if (Array.isArray(val)) {
				return val.map(function (val2) {
					return encodeURIComponent(key) + '=' + encodeURIComponent(val2);
				}).join('&');
			}

			return encodeURIComponent(key) + '=' + encodeURIComponent(val);
		}).join('&') : '';
	};

	if (typeof define === 'function' && define.amd) {
		define(function() { return queryString; });
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = queryString;
	} else {
		window.queryString = queryString;
	}
})();

},{}],8:[function(require,module,exports){

var Player = require('audio-player');
var resolve = require('soundcloud-resolve-jsonp');
var hhmmss = require('hhmmss');

var player = new Player();

module.exports = function(selector, options) {

  var el = document.querySelector(selector);
  options = options = {};

  var client_id = '0d33361983f16d2527b01fbf6408b7d7';

  el.icons = {
    play: '<svg class="icon geomicon" viewBox="0 0 32 32" style="position:relative;top:0;fill:currentcolor"><path d="M4 4 L28 16 L4 28 z "></path></svg>',
    pause: '<svg class="icon geomicon" data-icon="pause" viewBox="0 0 32 32" style="position:relative;top:0;fill:currentcolor"><path d="M4 4 H12 V28 H4 z M20 4 H28 V28 H20 z "></path></svg>',
  };

  el.player = player;
  
  el.track = false;
  el.playlist = false;
  el.tracks = [];
  el.index = 0;

  el.playPauseButton;
  el.progress;
  el.currentTime;

  function repeat(parent, key, arr) {
    var group = el.querySelector('[data-' + parent + key + ']');
    if (group) {
      var iterator = group.querySelector('*');
      var nodes = arr.map(function(item) {
        var node = iterator.cloneNode(true);
        Object.keys(item).forEach(function(k) {
          var subnode = node.querySelector('[data-' + k + ']');
          if (subnode) {
            console.log(subnode, item[k]);
            subnode.innerText = item[k];
          }
        });
        return node;
      });
      iterator.remove();
      nodes.forEach(function(node) {
        group.appendChild(node);
      });
    }
  }

  function bindData(obj, parent) {
    var parent = parent || '';
    Object.keys(obj).forEach(function(key) {
      var t = typeof obj[key];
      if (obj[key] === null) {
        return false;
      } else if (Array.isArray(obj[key])) {
        console.log('isArray', key, Array.isArray(obj[key]));
        repeat(parent, key, obj[key]);
      } else if (t === 'object') {
        bindData(obj[key], key + '-');
      } else if (t === 'string' || t === 'number' || t === 'boolean') {
        var selector = '[data-' + parent + key +']';
        var nodes = el.querySelectorAll(selector);
        for (var i = 0; i < nodes.length; i++) {
          var node = nodes[i];
          if (!node.innerText) {
            node.innerText = obj[key];
          }
        };
      } else {
        console.log('its something else', key, t, obj[key]);
      }
    });
  }

  function createSrc(track) {
    if (track.stream_url) {
      track.src = track.stream_url + '?client_id=' + client_id;
    }
    return track;
  }

  function bindProgress() {
    el.progress = el.querySelector('progress');
    el.progress.addEventListener('click', el.player.seek);
  }

  function bindCurrentTime() {
    el.currentTime = el.querySelector('[data-current-time]');
    if (!el.currentTime) { return false }
    el.currentTime.innerText = hhmmss(0) + ' / ' + hhmmss(el.track.duration / 1000);
  }

  function bindPlayPauseButton() {
    el.playPauseButton = el.querySelector('[data-play-pause]');
    if (!el.playPauseButton) { return false }
    el.playPauseButton.innerHTML = el.icons.play;
    el.playPauseButton.addEventListener('click', function() {
      el.playPause();
    });
  }

  function toggleStates() {
    if (el.player.playing === el.track.src) {
      el.classList.add('is-playing');
      el.playPauseButton.innerHTML = el.icons.pause;
    } else {
      el.classList.remove('is-playing');
      el.playPauseButton.innerHTML = el.icons.play;
    }
  }


  el.play = function(i) {
    if (typeof i !== 'undefined' && el.tracks.length) {
      el.index = i;
      el.track = el.tracks[i];
    }
    el.player.play(el.track.src);
  };

  el.pause = el.player.pause;

  el.playPause = function(i) {
    if (typeof i !== 'undefined' && el.tracks.length) {
      el.index = i;
      el.track = el.tracks[i];
    }
    el.player.playPause(el.track.src);
    toggleStates();
  };

  el.previous = function() {
    if (el.tracks.length < 1) { return false }
    if (el.index > 0) {
      el.index--;
      el.play(el.index);
    }
  };

  el.next = function() {
    if (el.tracks.length < 1) { return false }
    if (el.index < el.tracks.length -1) {
      el.index++;
      el.play(el.index);
    } else {
      el.pause();
    }
  };

  el.seek = function(e) {
    if (el.track.src === el.player.audio.src) {
      el.player.seek(e);
    }
  }

  el.player.audio.addEventListener('timeupdate', function() {
    if (el.track.src === el.player.audio.src) {
      var value = el.player.audio.currentTime / el.player.audio.duration || 0;
      el.progress.value = value;
      el.currentTime.innerText = hhmmss(el.player.audio.currentTime) + ' / ' + hhmmss(el.player.audio.duration);
    }
  });

  el.player.audio.addEventListener('abort', function() {
    toggleStates();
  });

  el.player.audio.addEventListener('ended', function() {
    //console.log('player ended');
  });

  function init(selector) {
    var url = el.dataset.src;
    resolve({
      url: url,
      client_id: client_id 
    }, function(err, res) {
      el.track = createSrc(res);
      if (Array.isArray(res)) {
        el.tracks = res.map(function(track) {
          return createSrc(track);
        });
      } else if (res.tracks) {
        el.playlist = res;
        el.tracks = res.tracks.map(function(track) {
          return createSrc(track);
        });
        //bindTracks();
      }
      bindData(el.track);
      bindPlayPauseButton();
      bindProgress();
      bindCurrentTime();
    });
    return el;
  };


  return init();

};


},{"audio-player":1,"hhmmss":3,"soundcloud-resolve-jsonp":4}]},{},[8])(8)
});