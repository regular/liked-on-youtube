var hyperquest = require('hyperquest');
var querystring = require('querystring');
var extend = require('xtend');
var json = require('JSONStream');
var map = require('flat-map');
var through = require('through');
var debug = require('debug')('liked-on-youtube');

function ytr(prefix, key) {
    // return a function that retuens a stream of objects
    // (see JSONStream for jsonPath argument)
    // if nextPageToken is found in the API response,
    // the next page is requested automatically.
    return function request(url, query, jsonPath) {
        var stream = through();
        var out1 = json.parse(jsonPath);
        out1.pipe(stream);

        function r(pageToken) {
            var more = false;
            var out2 = json.parse(['nextPageToken']);
            out2.pipe(through(function(nextPageToken) {
                debug('we have a next page:', nextPageToken);
                more = true;
                r(nextPageToken);
            }));
            debug('requesting page', pageToken);
            hyperquest(
                prefix + url + '?' + querystring.stringify(
                    extend(query, {key: key}, pageToken ? {pageToken: pageToken} : {})
                )
            ).pipe(through(function(data) {
                out1.write(data);
                out2.write(data);
            }, function() {
                out2.end();
                if (!more) {
                    debug('no more pages');
                    out1.end();
                }
                this.push(null);
            }));
        }
        r();
        return stream;
    };
}

var request = ytr(
    "https://www.googleapis.com/youtube/v3/",
    'AIzaSyB1OOSpTREs85WUMvIgJvLTZKye4BVsoFU'
);
        
module.exports = function(id) {
    return request('channels', {
        part: 'contentDetails',
        id: id
    }, [
        'items',
        true,
        'contentDetails',
        'relatedPlaylists',
        'likes'
    ]).pipe(map(function(id, cb) {
        // id = playlistID of the 'likes' pseudo-playlist
        debug('likes playlist id:', id);
        cb(null, request('playlistItems', {
            part: 'snippet',
            playlistId: id,
            maxResults: 50
        }, [
            'items', 
            true
        ]));
    }));
};

