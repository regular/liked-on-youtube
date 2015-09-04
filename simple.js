var pull = require('pull-stream');
var pullPush = require('pull-pushable');
var tee = require('pull-tee');
var observe = require('pull-spawn').observe;

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
        cb(null, pull.values([response]));
    }, 100);
});

function iteratePages() {
   return pull.drain(function(response) {
        var token = response.nextPage;
        console.log('token', token);
        if (token) {
            setTimeout(function(){
                pages.push(token);
            }, 2000);
        } else {
            pages.end();
        }
    });
}

pull(
    pages,
    pull.prepend('START'),
    api,
    pull.map(function(responseStream) {
        return pull(
            responseStream,
            observe(iteratePages())
        );
    }),
    pull.flatten(),
    pull.take(1),
    pull.log()
);
