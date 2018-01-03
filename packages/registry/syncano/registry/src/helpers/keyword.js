export default (ctx, syncano) => {
  const {logger, data} = syncano
  const {debug} = logger('keyword')

  const getOrCreateKeyword = (keywordName) => {
    debug('getOrCreateKeyword', keywordName)
    return new Promise((resolve, reject) => {
      const resolveKeyword = (keyword) => {
        resolve({
          id: keyword.id,
          name: keyword.name
        })
      }

      return data.keyword
        .where('name', 'eq', keywordName)
        .fields('id', 'name')
        .firstOrFail()
        .then(keyword => resolveKeyword(keyword))
        .catch(() => {
          return data.keyword
            .fields('id', 'name')
            .create({name: keywordName})
            .then(keyword => resolveKeyword(keyword))
            .catch(err => reject(err))
        })
    })
  }

  const getKeywords = (keywordsArray) => {
    if (keywordsArray) {
      return Promise.all(keywordsArray.map(getOrCreateKeyword))
    }
    return Promise.all([])
  }

  return {
    getOrCreateKeyword,
    getKeywords
  }
}
