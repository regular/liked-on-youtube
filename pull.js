var pull = require('pull-stream');
var toPullStream = require('stream-to-pull-stream');
var pullPush = require('pull-pushable');
var observe = require('pull-spawn').observe;

var JSONStream = require('JSONStream');

var pages = pullPush();
pages.push('F');

var api = pull.asyncMap(function(page, cb) {
    console.log('requesting page', page);
    var response;
    if (page.length<10) {
        response = {nextPage: page + ">"};
    } else {
        response = {};
    }
    response.items = [
        {name: 'foo'},
        {name: 'bar'}
    ];
    setTimeout(function() {
        console.log('response');
        cb(null, pull.values(JSON.stringify(response).split('')));
    }, 1000);
});

function iteratePages() {
   return  pull(
        toPullStream(JSONStream.parse(['nextPage'])),
        pull.collect(function(err, tokens) {
            if (err) throw err;
            console.log('tokens', tokens);
            if (tokens.length) {
                pages.push(tokens[0]);
            } else {
                pages.end();
            }
        })
    );
}

pull(
    pages,
    api,
    pull.asyncMap(function(responseStream, cb) {
        pull(
            responseStream,
            observe(iteratePages()),
            toPullStream(JSONStream.parse(['items', true, 'name'])),
            pull.collect(cb)
        );
    }),
    pull.flatten(),
    pull.take(1),
    pull.log()
);
