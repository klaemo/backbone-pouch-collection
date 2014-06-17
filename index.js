'use strict';

var Backbone = require('backbone')
var _ = require('underscore')

module.exports = Backbone.Collection.extend({

  sync: function (method, collection, options) {
    var promise

    function cb (err, res) {
      if (err) return options.error(err)
      options.success(res)
    }
    
    if (method === 'read') {
      var opts = this.opts || {}
      opts = typeof opts == 'function' ? opts.call(this) : opts
      
      _.defaults(options.couch || (options.couch = {}), opts.params, {
        include_docs: true
      })

      // default to '_all_docs' if view isn't specified
      if (opts.view === '_all_docs' || !opts.view) {
        promise = this.db.allDocs(options.couch, cb)
      } else {
        promise = this.db.query(opts.view, options.couch, cb)
      }

      collection.trigger('request', this, promise, options)
    }

    return promise
  },

  /*
    Parse out the actual documents
   */
  parse: function (res, options) {
    options = options || {}
    
    if (options.couch && options.couch.include_docs) {
      return res.rows.map(function (row) { return row.doc })
    } else {
      return res
    }
  }
})