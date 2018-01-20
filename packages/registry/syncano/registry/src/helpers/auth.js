export default (ctx, syncano) => {
  const {account} = syncano
  const userKey = ctx.meta.request.HTTP_X_SYNCANO_ACCOUNT_KEY

  const authUser = function () {
    return account.get(userKey)
      .then(user => {
        return user
      })
  }

  const getUser = function () {
    return account.get(userKey)
      .catch(() => {
        return null
      })
  }

  const userInOrg = function (userObj, oragnizationObj) {
    return true
  }

  return {
    authUser,
    getUser,
    userInOrg
  }
}
