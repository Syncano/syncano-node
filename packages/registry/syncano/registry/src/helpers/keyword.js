export default (ctx, syncano) => {
  const {logger, data} = syncano
  const {debug} = logger('keyword')

  const getOrCreateKeyword = async (keywordName) => {
    debug('getOrCreateKeyword', keywordName)
    const keyword = await data.keyword
      .where('name', 'eq', keywordName)
      .fields('id', 'name')
      .first()

    if (keyword) {
      return keyword
    } else {
      return data.keyword
        .fields('id', 'name')
        .create({name: keywordName})
    }
  }

  const getKeywords = async (keywordsArray) => {
    if (keywordsArray) {
      debug('getKeywords', keywordsArray)
      return Promise.all(keywordsArray.map(getOrCreateKeyword))
    }
    return []
  }

  return {
    getOrCreateKeyword,
    getKeywords
  }
}
