var Likes  = require('./');

var test = require('tape');
var pull = require('pull-stream');
var bl = require('bl');
var debug = require('debug')('test');

function from(str) {
    var b = new bl();
    b.append(str);
    return b;
}

function requestMock(responses, cb) {
    var i = 0;
    return function (url) {
        debug('requested url: %s', url);
        cb(i, url);
        if (i>responses.length-1) throw new Error('Out of responses!');
        debug('response: %s', responses[i]);
        return from(responses[i++]);
    };
}

function likes(t, username, responses, urls, items) {
    return Likes('secret', {
        request: requestMock(responses, function(i, url) {
            if (i > urls.length - 1) return t.fail();
            t.equal(url,urls[i]); 
        })
    })(username);
}

test('should handle parse error gracefully', function(t) {
    pull(
        likes(t, 
            'user', 
            ['glibberish'], 
            ["https://www.googleapis.com/youtube/v3/channels?key=secret&part=contentDetails&id=user"]
        ),
        pull.onEnd(function(err) {
            debug(err.message);
            t.ok(err);
            t.end();
        })
    );
});

test('should handle missing properties gracefully (1)', function(t) {
    pull(
        likes(t, 
            'user', 
            ['{"items":[{}]}'], 
            ["https://www.googleapis.com/youtube/v3/channels?key=secret&part=contentDetails&id=user"]
        ),
        pull.collect(function(err, values) {
            t.equal(err, null);
            t.deepEqual(values, []);
            t.end();
        })
    );
});

test('should handle missing properties gracefully (2)', function(t) {
    pull(
        likes(t, 
            'user', 
            [
             '{"items":[{"contentDetails": {"relatedPlaylists": {"likes": "likes-id"}}}]}',
             '{}'
            ],
            [
             "https://www.googleapis.com/youtube/v3/channels?key=secret&part=contentDetails&id=user",
             "https://www.googleapis.com/youtube/v3/playlistItems?key=secret&part=snippet&playlistId=likes-id&maxResults=50"
            ]
        ),
        pull.onEnd(function(err) {
            t.notOk(err);
            t.end();
        })
    );
});

