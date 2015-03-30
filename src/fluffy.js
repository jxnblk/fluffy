
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

