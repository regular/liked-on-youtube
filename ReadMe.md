# liked-on-youtube
get a meta-data pull-stream of all videos a user liked on youtube (browser & node)

## Usage

``` js
var pull = require('pull-stream');
var liked = require('liked-on-youtube')('YOUR-API-KEY');

pull(
    liked('USER-ID'),
    pull.log()
);
```

Youtube UserIds actually are ChannelIds. See [this video](https://www.youtube.com/watch?v=b-8TWt32USs) for details.

See [Dominic Tarr's pull-stream](https://github.com/dominictarr/pull-stream) for more details about pull-streams.

## License
MIT

