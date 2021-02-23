const { AsyncNedb } = require('nedb-async')

class Store {
  constructor() {
    this.db = new AsyncNedb({
      filename: 'data.db',
      autoload: true,
      timestampData: true
    })
  }

  find(query) {
    return this.db.find(query)
  }

  async findOne(query) {
    return await this.db.asyncFindOne(query)
  }

  async insert(doc) {
    return await this.db.asyncInsert(doc)
  }

  async update(query, updateQuery = {}, options = {}) {
    return await this.db.asyncUpdate(query, updateQuery, options)
  }
}

exports.store = new Store()