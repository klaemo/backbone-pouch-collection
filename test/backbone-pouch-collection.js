var assert = require('assert')
var Pouch = require('pouchdb')
var PouchBase = require('../')

describe('pouch-base-collection', function() {
  before(function (done) {
    this.plan = function plan (cnt, cb) {
      return function () {
        if (--cnt === 0) cb()
      }
    }

    this.db = new Pouch('bpc-test')

    this.db.bulkDocs({ 
      docs: [{
        _id: '_design/app',
        views: { byType: { map: "function (doc) { emit(doc.type) }" } }
      }, 
      { type: 'foo', name: 'bar' },
      { type: 'goo', name: 'baz' },
      { type: 'foo', name: 'baz' },
      { type: 'foo', name: 'baz' },
      ]
    }, done)
  })

  after(function (done) {
    this.db.destroy(done)
  })

  describe('.parse()', function () {
    it('should not do anything', function() {
      var collection = new PouchBase()
      assert.equal(collection.parse([ 'bar' ])[0], 'bar')
    })

    it('should parse include_docs', function () {
      var collection = new PouchBase()
      var res = collection.parse({
        rows: [ { doc: { foo: 'bar' }} ]
      }, { couch: { include_docs: true }})

      assert.equal(res[0].foo, 'bar')
    })
  })

  describe('.sync()', function () {
    it('should take "opts" object', function (done) {
      var cb = this.plan(2, done)
      var Child = PouchBase.extend({
        opts:  {
          view: 'app/byType',
          params: { include_docs: true }
        }
      })

      var child = new Child()
      child.db = this.db
      
      child.on('request', function (coll, promise, opts) {
        coll.off('request')
        assert(opts)
        assert(opts.couch, 'should have couch options')
        assert.equal(opts.couch.limit, 2)
        assert(opts.couch.include_docs, 'should have specified params')
        assert(promise)
        cb()
      })

      var promise = child.sync('read', child, {
        couch: { limit: 2 },
        success: function (res) { cb() },
        error: function (err) { console.error(err) }
      })
      assert(promise)
    })

    it('should take "opts" function', function (done) {
      var cb = this.plan(2, done)
      var Child = PouchBase.extend({
        opts: function () {
          return {
            view: 'app/byType',
            params: { include_docs: true }
          }
        }
      })

      var child = new Child()
      child.db = this.db

      child.on('request', function (coll, promise, opts) {
        coll.off('request')
        assert(opts)
        assert(opts.couch, 'should have couch options')
        assert.equal(opts.couch.limit, 2)
        assert(opts.couch.include_docs, 'should have specified params')
        assert(promise)
        cb()
      })

      var promise = child.sync('read', child, {
        couch: { limit: 2 },
        success: function (res) { cb() },
        error: function (err) { console.error(err) }
      })
      assert(promise)

    })
  })
  
  describe('.fetch()', function () {
    it('should ...fetch', function (done) {
      // we expect three callbacks (request, sync and success)
      var cb = this.plan(3, done)
      var Child = PouchBase.extend({
        opts: function () {
          return {
            view: 'app/byType',
            params: { include_docs: true }
          }
        }
      })

      var child = new Child()
      child.db = this.db
      
      child.on('request', function (coll, promise, opts) {
        coll.off('request')
        assert(opts)
        assert(opts.couch)
        assert.equal(opts.couch.key, 'foo')
        assert(opts.couch.include_docs)
        assert(promise)
        cb()
      })

      child.on('sync', function (coll, promise, opts) {
        coll.off('sync')
        assert(opts)
        assert(opts.couch)
        assert.equal(opts.couch.key, 'foo')
        assert(opts.couch.include_docs)
        assert.equal(coll.length, 3)
        assert(promise)
        cb()
      })

      var promise = child.fetch({
        couch: { key: 'foo' },
        success: function (res) { cb() },
        error: function (model, err) { done(err) }
      })
      assert(promise)
    })

    it('should work with _all_docs', function (done) {
      var Child = PouchBase.extend({
        opts: function () {
          return {
            view: '_all_docs',
            params: { include_docs: true }
          }
        }
      })

      var child = new Child()
      child.db = this.db

      var promise = child.fetch({
        success: function (collection, res, opts) {
          assert(opts)
          assert(opts.couch, 'should have couch options')
          assert.equal(collection.length, 5)
          assert.equal(res.rows.length, 5)
          assert(opts.couch.include_docs, 'should have specified params')
          
          done()
        },
        error: function (err) { done(err) }
      })
      assert(promise)

    })

    it('should have defaults', function (done) {
      var child = new PouchBase()
      child.db = this.db

      var promise = child.fetch({
        success: function (collection, res, opts) {
          assert(opts)
          assert(opts.couch, 'should have couch options')
          assert.equal(collection.length, 5)
          assert.equal(res.rows.length, 5)
          assert(opts.couch.include_docs, 'include_docs should be default')

          done()
        },
        error: function (err) { done(err) }
      })
      assert(promise)
    })
  })
})