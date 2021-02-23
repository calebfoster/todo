import React, { useEffect, useState, useRef } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
// import { LoadingButton } from '@material-ui/lab'
import CssBaseline from '@material-ui/core/CssBaseline';
import TextFieldUI from '@material-ui/core/TextField'
import { TextField } from 'formik-material-ui'
import { DatePicker } from 'formik-material-ui-pickers'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import DeleteIcon from '@material-ui/icons/Delete'
import IconButton from '@material-ui/core/IconButton'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import FormatListBulletedIcon from '@material-ui/icons/FormatListBulleted'
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { gql, useQuery, useMutation } from '@apollo/client'
import { Formik, Form, Field } from 'formik'
import { useHistory } from 'react-router-dom'
import { get } from 'lodash'
import client from '../graphql/client'
import LoadingButton from '../components/LoadingButton'

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const USER_QUERY = gql`
  query User {
    user {
      _id
      email
    }
  }
`

const TODOS_QUERY = gql`
  query Todos {
    todos {
      _id
      description
      complete
      createdAt
    }
  }
  `

const ADD_TODO_MUTATION = gql`
  mutation AddTodo($description: String!) {
    addTodo(description: $description) {
      _id
      description
      complete
      createdAt
    }
  }
`

const COMPLETE_TODO_MUTATION = gql`
  mutation CompleteTodo($_id: ID!) {
    completeTodo(_id: $_id) {
      _id
      description
      complete
      createdAt
    }
  }
`

const REMOVE_TODO_MUTATION = gql`
  mutation RemoveTodo($_id: ID!) {
    removeTodo(_id: $_id) {
      _id
      description
      complete
      createdAt
    }
  }
`


export default (props) => {
  const classes = useStyles();
  const history = useHistory()
  const [search, setSearch] = useState('')
  const [addTodo] = useMutation(ADD_TODO_MUTATION)
  const [completeTodo] = useMutation(COMPLETE_TODO_MUTATION)
  const [removeTodo] = useMutation(REMOVE_TODO_MUTATION)
  const { data: userData } = useQuery(USER_QUERY)
  const { loading, error, data, refetch } = useQuery(TODOS_QUERY)

  const email = get(userData, 'user.email')

  if (error) {
    console.log('error', error)
  }

  const clickCompleteTodoButton = async (todo) => {
    const result = await completeTodo({ variables: {
      _id: todo._id
    }})

    refetch()
  }

  const clickRemoveTodoButton = async (todo) => {
    const result = await removeTodo({ variables: {
      _id: todo._id
    }})

    // todo is removed so update them
    refetch()
  }

  const logout = (e) => {
    e.preventDefault()
    localStorage.removeItem('token')
    history.go(0)
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <FormatListBulletedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Todos
        </Typography>
        {email && (
          <Typography component="h2" variant="h6">
            {email}
            &nbsp;<Link href="#" onClick={logout}>logout</Link>
          </Typography>
        )}

        <TextFieldUI
          type="search"
          placeholder="Search"
          fullWidth
          onChange={e => setSearch(e.target.value)}
          style={{marginTop: 20}}
          />

        <List style={{ width: '100%', marginTop: 20 }}>
          {data && data.todos && data.todos
            .filter(todo => {
              return todo.description.includes(search)
            })
            .map(todo => (
            <ListItem key={todo._id} button onClick={() => clickCompleteTodoButton(todo)}>
              <ListItemText
                primary={todo.description}
                style={{ textDecoration: todo.complete ? 'line-through' : 'none' }}
              />
              <ListItemSecondaryAction>
                <IconButton
                  onClick={() => clickRemoveTodoButton(todo)}
                  edge="end"
                  aria-label="delete">
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        <Formik
          initialValues={{
            description: '',
            // dueDate: null,
          }}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            const todos = await addTodo({ variables: values })

            // todo: could add to the instantly
            refetch()

            resetForm()
            setSubmitting(true)
          }}
          >
          <Form className={classes.form} noValidate>
            <Field
              name="description"
              component={TextField}
              placeholder="Add a todo"
              fullWidth
              required
              autoComplete="todo"
              autoFocus
              variant="outlined"
              margin="normal"
              />

            {/*<Field
              component={DatePicker}
              label="Due Date"
              name="dueDate"
              clearable
              variant="outlined"
            />*/}

            <LoadingButton
              style={{marginTop: 0}}
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Add
            </LoadingButton>
          </Form>
        </Formik>
      </div>
    </Container>
  );
}