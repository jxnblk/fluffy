
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

  this.player = player;
  this.audio = player.audio;
  this.track = false;
  this.playlist = false;
  this.tracks = [];
  this.index = 0;

  function createSrc(track) {
    if (track.stream_url) {
      track.src = track.stream_url + '?client_id=' + client_id;
    }
    return track;
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
      console.log(hhmmss(player.audio.currentTime));
    }
  });

  this.init = function(options) {
    options = options;
    resolve({
      url: 'http://soundcloud.com/jxnblk/let-go',
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
          playPause: {
            event: 'click',
            callback: self.playPause
          }
        }
      });
    });
  };

};

