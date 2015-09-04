var pull = require('pull-stream');
var toPullStream = require('stream-to-pull-stream');
var pullPush = require('pull-pushable');
//var observe = require('pull-spawn').observe;
var tee = require('pull-tee');

var JSONStream = require('JSONStream');

var pages = pullPush();

var n=2;
var api = pull.asyncMap(function(page, cb) {
    console.log('requesting page', page);
    //if (!--n) throw new Error('dont call me');
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
   return pull(
        toPullStream(JSONStream.parse(['nextPage'])),
        pull.collect(function(err, tokens) {
            if (err) throw err;
            console.log('tokens', tokens);
            process.nextTick(function() {
            if (tokens.length) {
                pages.push(tokens[0]);
            } else {
                pages.end();
            }
            });
        })
    );
}

pull(
    pages,
    pull.prepend('START'),
    api,
    pull.map(function(responseStream) {
        return pull(
            responseStream,
            tee(iteratePages()),
            toPullStream(JSONStream.parse(['items', true, 'name']))
        );
    }),
    pull.take(2),
    pull.log()
);
