import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import { TextField } from 'formik-material-ui'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { gql, useMutation } from '@apollo/client'
import { Formik, Form, Field } from 'formik'
import { useHistory } from 'react-router-dom'
import { get } from 'lodash'
import { GoogleLogin } from 'react-google-login'
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

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      _id
      token
    }
  }
  `

const LOGIN_GOOGLE_MUTATION = gql`
  mutation LoginGoogle($token: String!) {
    loginGoogle(token: $token) {
      _id
      token
    }
  }
  `

export default function Login() {
  const classes = useStyles();
  const history = useHistory()
  const [login, { data }] = useMutation(LOGIN_MUTATION)
  const [loginGoogle, { dataGoogle }] = useMutation(LOGIN_GOOGLE_MUTATION)

  const responseGoogle = async (response) => {
    const email = get(response, 'profileObj.email')
    const tokenId = get(response, 'tokenId')

    const result = await loginGoogle({ variables: { token: tokenId }})
    
    // check if we have successful login
    const token = get(result, 'data.loginGoogle.token')
    if (token) {
      localStorage.setItem('token', token)
      history.push('/')
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Formik
          initialValues={{
            email: '',
            password: '',
          }}
          onSubmit={async (values, { setSubmitting }) => {
            // todo put in a try/catch
            const result = await login({ variables: { ...values }})
            const token = get(result, 'data.login.token')
            if (token) {
              // store token locally
              localStorage.setItem('token', token)

              // redirect home (dashboard)
              history.push('/')
            }
            setSubmitting(false)
          }}
          >
          <Form className={classes.form} noValidate>
            <Field
              name="email"
              component={TextField}
              placeholder="Email Address"
              fullWidth
              required
              autoComplete="email"
              autoFocus
              variant="outlined"
              margin="normal"
              />
            <Field
              name="password"
              component={TextField}
              type="password"
              placeholder="Password"
              fullWidth
              required
              variant="outlined"
              margin="normal"
              />
            <LoadingButton
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Sign Up / Login
            </LoadingButton>
          </Form>
        </Formik>

        <p style={{marginBottom: 25}}>or</p>

        <GoogleLogin
          clientId="437227484786-h2tdsihqrvgbl2qda0nvkf42ri4e2nct.apps.googleusercontent.com"
          buttonText="Login with Google"
          onSuccess={responseGoogle}
          onFailure={responseGoogle}
          cookiePolicy={'single_host_origin'}
          />
      </div>
    </Container>
  );
}