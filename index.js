var paginated = require('pull-paginated-api-request');
var pull = require('pull-stream');
var querystring = require('querystring');
var extend = require('xtend');
var debug = require('debug')('pull-liked-on-youtube');
var hyperquest = require('hyperquest');

var base_url = "https://www.googleapis.com/youtube/v3/";

module.exports = function(api_key, opts) {
    opts = opts || {};
    var makeRequest = opts.request || hyperquest;
    var request = paginated(function(o, pageToken) {
        return makeRequest(base_url + o.endpoint + '?' + querystring.stringify(
            extend({key: api_key}, o.query, pageToken ? {pageToken: pageToken} : {})
        ));
    });

    return function(id) {
        return pull(
            request({
                endpoint: 'channels',
                query: {
                    part: 'contentDetails',
                    id: id
                }
            },
                [['items', 0, 'contentDetails', 'relatedPlaylists', 'likes']]
            ),
            pull.asyncMap(function(id, cb) {
                // id = playlistID of the 'likes' pseudo-playlist
                debug('likes playlist id: %s', id);
                cb(null,
                    request({
                        endpoint: 'playlistItems',
                        query: {
                            part: 'snippet',
                            playlistId: id,
                            maxResults: 50
                        }
                    },
                    [
                        ['items', true], 
                        ['nextPageToken']
                    ])
                );
            }),
            pull.flatten()
        );
    };
};
