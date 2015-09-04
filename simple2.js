var pull = require('pull-stream');
var pullPush = require('pull-pushable');

var pages = pullPush();
pages.push(1);

pull(
    pages,
    pull.through(function() {
        console.log('calling through');
        pages.push(2);
    }),
    pull.take(2),
    pull.log()
);
