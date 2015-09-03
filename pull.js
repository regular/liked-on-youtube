var pull = require('pull-stream');
var pullPush = require('pull-pushable');

var pages = pullPush();
pages.push('F');

var api = pull.asyncMap(function(page, cb) {
    var response;
    if (page.length<10) {
        response = {nextPage: page + ">"};
    } else {
        response = {};
    }
    setTimeout(function() {
        cb(null, response);
    }, 1000);
});

var queuePage = pull.map(function(response) {
    var nextPage = response.nextPage;
    if (nextPage) {
        pages.push(nextPage);
    } else {
        pages.end();
    }
    return response;
});

pull(
    pages,
    api,
    queuePage,
    pull.drain(console.log.bind(console))
);
