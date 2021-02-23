require('dotenv').config()

var createError = require('http-errors');
const cors = require('cors')
var express = require('express');
const expressJwt = require('express-jwt')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { ApolloServer, gql, AuthenticationError, UserInputError } = require('apollo-server-express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const cuid = require('cuid')
const { OAuth2Client } = require('google-auth-library')
const store = require('./utils/store').store

var indexRouter = require('./routes/index');

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    user: User!
    todos: [Todo]
  },

  type Mutation {
    login(email: String!, password: String!): User
    loginGoogle(token: String!): User
    addTodo(description: String!): Todo!
    completeTodo(_id: ID!): Todo!
    removeTodo(_id: ID!): Todo!
  }

  type User {
    _id: ID
    email: String
    token: String
    isGoogle: Boolean
  }

  type Todo {
    _id: ID
    description: String
    complete: Boolean
    createdAt: String
  }
`

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    user: async (parent, _, ctx) => {
      const { _id: userId } = ctx.user
      const user = await store.findOne({ _id: userId })
      return {
        _id: user._id,
        email: user.email,
      }
    },

    todos: async (parent, _, ctx) => {
      const { _id: userId } = ctx.user
      const user = await store.findOne({ _id: userId })
      return user.todos || []
    },
  },
  Mutation: {
    login: async (parent, { email, password }) => {
      // check if user exists
      let user = await store.findOne({ email })

      if (user) {
        // can't be google
        if (user.isGoogle)
          throw new AuthenticationError('already signed up with google')

        // validate password matches existing user
        const matches = await bcrypt.compare(password, user.password)
        if (!matches) {
          throw new AuthenticationError('invalid password')
        }
      } else {
        // create a new user using passed params

        // hash the password
        password = await bcrypt.hash(password, 10)

        user = await store.insert({
          email,
          password, // hashed password
          isGoogle: false,
          todos: []
        })
      }

      // create a jwt for the user
      const token = jwt.sign({ _id: user._id }, process.env.KEY, { expiresIn: '1d' })

      user.password = undefined

      return {
        ...user,
        token
      }
    },

    loginGoogle: async (parent, { email, token }) => {
      const gclient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
      async function verify() {
        const ticket = await gclient.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID,
        })
        const payload = ticket.getPayload()
        const email = payload.email

        // pretty sure we success
        let user = await store.findOne({ email })
        if (user) {
          // nothing to do here
        } else {
          // create a new user from google

          user = await store.insert({
            email,
            isGoogle: true,
            todos: []
          })
        }

        // create a jwt for the user
        const newToken = jwt.sign({ _id: user._id }, process.env.KEY, { expiresIn: '1d' })

        user.password = undefined

        return {
          ...user,
          token: newToken
        }  
      }
      return await verify().catch(console.error)
    },

    addTodo: async (_, { description }, ctx) => {
      if (!description) throw new UserInputError('invalid todo description')

      const { _id: userId } = ctx.user

      const newTodo = {
        _id: cuid(),
        description,
        complete: false,
      }

      const todo = await store.update({ _id: userId }, {
        $push: {
          todos: newTodo
        }
      })

      return todo
    },

    completeTodo: async (_, { _id: todoId }, ctx) => {
      const { _id: userId } = ctx.user
      const user = await store.findOne({ _id: userId })

      // update todo list
      user.todos = user.todos.map(todo => {
        if (todo._id === todoId) {
          return {
            ...todo,
            complete: !todo.complete,
          }
        }
        return todo
      })


      const todo = await store.update({ _id: userId }, {
        $set: {
          todos: user.todos
        }
      })

      return todo
    },

    removeTodo: async (_, { _id: todoId }, ctx) => {
      const { _id: userId } = ctx.user

      const todo = await store.update({ _id: userId }, {
        $pull: {
          todos: {
            _id: todoId
          }
        }
      })

      return todo
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // add user to context from jwt
    const user = req.user || null
    return { user }
  }
})


var app = express();
app.use(cors())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressJwt({
  secret: process.env.KEY,
  algorithms: ['HS256'],
  credentialsRequired: false,
}))

// needs to come after expressJwt middleware
server.applyMiddleware({ app })

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
