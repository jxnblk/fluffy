
var Player = require('audio-player');
var resolve = require('soundcloud-resolve-jsonp');
var hhmmss = require('hhmmss');
var Doomo = require('doomo');

var player = new Player();

module.exports = function() {

  var self = this;
  var doomo = new Doomo();
  var options = {};
  var client_id = '0d33361983f16d2527b01fbf6408b7d7';

  var icons = {
    play: '<svg class="icon geomicon" viewBox="0 0 32 32" style="position:relative;top:0;fill:currentcolor"><path d="M4 4 L28 16 L4 28 z "></path></svg>',
    pause: '<svg class="icon geomicon" data-icon="pause" viewBox="0 0 32 32" style="position:relative;top:0;fill:currentcolor"><path d="M4 4 H12 V28 H4 z M20 4 H28 V28 H20 z "></path></svg>',
  };

  this.player = player;
  this.audio = player.audio;
  this.track = false;
  this.playlist = false;
  this.tracks = [];
  this.index = 0;
  this.playPauseButton;
  this.progress;
  this.currentTime;

  function createSrc(track) {
    if (track.stream_url) {
      track.src = track.stream_url + '?client_id=' + client_id;
    }
    return track;
  }

  function bindProgress() {
    self.progress = doomo.el.querySelector('.js-progress');
    self.progress.addEventListener('click', self.player.seek);
  }

  function bindCurrentTime() {
    self.currentTime = doomo.el.querySelector('.js-current-time');
    self.currentTime.innerText = hhmmss(0) + ' / ' + hhmmss(self.track.duration / 1000);
  }

  function bindPlayPauseButton() {
    self.playPauseButton = doomo.el.querySelector('.js-playPause');
    self.playPauseButton.innerHTML = icons.play;
  }


  function toggleStates() {
    if (self.player.playing === self.track.src) {
      doomo.el.classList.add('is-playing');
      self.playPauseButton.innerHTML = icons.pause;
    } else {
      doomo.el.classList.remove('is-playing');
      self.playPauseButton.innerHTML = icons.play;
    }
  }

  this.play = function(i) {
    if (typeof i !== 'undefined' && self.tracks.length) {
      self.index = i;
      self.track = self.tracks[i];
    }
    player.play(scope.track.src);
  };

  this.pause = player.pause;

  this.playPause = function(i) {
    if (typeof i !== 'undefined' && self.tracks.length) {
      self.index = i;
      self.track = self.tracks[i];
    }
    player.playPause(self.track.src);
    toggleStates();
  };

  this.previous = function() {
    if (self.tracks.length < 1) { return false }
    if (self.index > 0) {
      self.index--;
      self.play(self.index);
    }
  };

  this.next = function() {
    if (self.tracks.length < 1) { return false }
    if (self.index < self.tracks.length -1) {
      self.index++;
      self.play(self.index);
    } else {
      self.pause();
    }
  };

  this.seek = function(e) {
    if (self.track.src === player.audio.src) {
      self.player.seek(e);
    }
  }

  player.audio.addEventListener('timeupdate', function() {
    if (self.track.src === player.audio.src) {
      var value = player.audio.currentTime / player.audio.duration || 0;
      self.progress.value = value;
      self.currentTime.innerText = hhmmss(player.audio.currentTime) + ' / ' + hhmmss(player.audio.duration);
    }
  });

  player.audio.addEventListener('abort', function() {
    toggleStates();
  });

  player.audio.addEventListener('ended', function() {
    console.log('player ended');
  });

  this.init = function(options) {
    options = options;
    resolve({
      url: options.src,
      client_id: client_id 
    }, function(err, res) {
      self.track = createSrc(res);
      if (Array.isArray(res)) {
        self.tracks = res.map(function(track) {
          return createSrc(track);
        });
      } else if (res.tracks) {
        self.playlist = res;
        self.tracks = res.tracks.map(function(track) {
          return createSrc(track);
        });
      }
      doomo.init({
        el: options.el,
        data: self.track,
        methods: {
          play: { event: 'click', callback: self.play },
          pause: { event: 'click', callback: self.pause },
          playPause: { event: 'click', callback: self.playPause },
          previous: { event: 'click', callback: self.previous },
          next: { event: 'click', callback: self.next },
        }
      });
      bindPlayPauseButton();
      bindProgress();
      bindCurrentTime();
    });
  };

};

