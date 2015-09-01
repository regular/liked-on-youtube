var likes = require('.');
var through = require('through');

var test = require('tape');
var debug = require('debug')('test');

test('should return list of liked videos', function(t) {
  var i = 0;
  likes('UCsoqfkGvfd2Wy4FQFelTo5g').pipe(through(function(data) {
    ++i;
    debug(data.snippet.title);
  }, function() {
    t.assert(i>200, 'should be a fair number of liked videos');
    t.end();
  }));
});
