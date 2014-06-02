'use strict';

var Backbone = require('backbone')
var _ = require('underscore')

module.exports = Backbone.Collection.extend({

  sync: function (method, collection, options) {
    var promise
    
    if (method === 'read') {
      var opts = typeof this.opts == 'function' ? this.opts() : this.opts
      _.defaults(options.couch || (options.couch = {}), opts.params)

      promise = this.db.query(opts.view, options.couch, function (err, res) {
        if (err) return options.error(err)
        options.success(res)
      })
      collection.trigger('request', this, promise, options)
    }

    return promise
  },

  /*
    Parse out the actual documents
   */
  parse: function (res, options) {
    options = options || {}
    
    if (options.couch && options.couch.include_docs)
      return res.rows.map(function (row) { return row.doc })
    else
      return res
  }
})