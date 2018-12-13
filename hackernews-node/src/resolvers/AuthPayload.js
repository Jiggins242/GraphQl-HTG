

function user(parent, args, context, info) {
    return context.db.query.user({ where: { id: parent.user.id } }, info)
  }
  
  module.exports = { user }