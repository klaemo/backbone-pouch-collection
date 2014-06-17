backbone-pouch-collection
===

Hooks up PouchDB to a Backbone collection.
Allows you to easily retrieve your data from CouchDB/PouchDB views.

## Installation

`npm install backbone-pouch-collection`


## Usage (with Browserify)

Define the query options in your collection definition.
`opts` can be an object or a function which returns an object.
You also need to provide a PouchDB instance to your collection.

`opts.view` can also be `_all_docs` to query...well... `_all_docs`.

The defaults are `_all_docs` and `include_docs: true`.

```javascript
var PouchBase = require('backbone-pouch-collection')

var Collection = PouchBase.extend({
  db: new Pouchdb('foo'),
  opts: {
    view: 'your/viewname',
    params: {
      // all the (c/p)ouchdb view params you want
    }
  }

  myMethod: function () {}
})
```

You can also pass options to `collection.fetch()` to override the
default.

```javascript
// fetch() returns a promise
collection.fetch({
  couch: {
    // all the (c/p)ouchdb view params you want
  }
})
```

## TODO

* provide standalone builds
* documentation

## Development
To run the unit tests:
```shell
npm test
```

## License
Copyright (c) 2014 Clemens Stolle
Licensed under the MIT license.