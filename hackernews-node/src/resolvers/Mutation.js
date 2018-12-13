const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { APP_SECRET, getUserId } = require('../utils');

function post(parent, args, context, info) {
  const userId = getUserId(context)
  return context.db.mutation.createLink(
    {
    data: {
      url: args.url,
      description: args.description,
     postedBy: { connect: {id: userId} },
      },
    },
   info,
  )
}

async function signup(parent, args, context, info) {

    //  Is encrypting the User’s password using the bcryptjs library 
    const password = await bcrypt.hash(args.password, 10)

    // Prisma binding instance to store the new User in the database
    const user = await context.db.mutation.createUser({
      data: { ...args, password },
    }, `{ id }`)
  
    // Generating a JWT which is signed with an APP_SECRET
    const token = jwt.sign({ userId: user.id }, APP_SECRET)
  
    // Return the token and the user
    return {
      token,
      user,
    }
  }
  
  async function login(parent, args, context, info) {

    // Prisma binding instance to retrieve the existing User record by the email address that was sent along in the login mutation
    const user = await context.db.query.user({ where: { email: args.email } }, ` { id password } `)
    if (!user) {
      throw new Error('No such user found')
    }
  
    // Compare the provided password with the one that is stored in the database
    const valid = await bcrypt.compare(args.password, user.password)
    if (!valid) {
      throw new Error('Invalid password')
    }
  
    const token = jwt.sign({ userId: user.id }, APP_SECRET)
  
    // Returning token and user
    return {
      token,
      user,
    }
  }

  async function vote(parent, args, context, info) {

    // Validate the incoming JWT with the getUserId helper function. If it’s valid, the function will return the userId of the User who is making the requests
    const userId = getUserId(context)
  
    // Exists function takes a where filter object that allows to specify certain conditions about elements of that type
    // Only if the condition applies to at least one element in the database, the exists function returns true
    // Verify that the requesting User has not yet voted for the Link that’s identified by args.linkId
    const linkExists = await context.db.exists.Vote({
      user: { id: userId },
      link: { id: args.linkId }
    })
    if (linkExists) {
      throw new Error(`Already voted for link: ${args.linkId}`)
    }
  
    // If exists returns false, the createVote will be used to create a new Vote element that’s connected to the User and the Link
    return context.db.mutation.createVote(
      {
        data: {
          user: { connect: { id: userId } },
          link: { connect: { id: args.linkId } },
        },
      },
      info,
    )
  }
  
  module.exports = {
      signup,
      login,
      post,
      vote
  }