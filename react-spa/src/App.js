import { ApolloProvider } from '@apollo/client'
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from 'react-router-dom'
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns';
import './App.css';
import client from './graphql/client'
import Todos from './screens/Todos'
import Login from './screens/Login'

function App() {

  const PrivateRoute = ({ children, ...rest }) => {
    // check if has token, this is safe since server validates token
    const auth = localStorage.getItem('token')

    return (
      <Route
        {...rest}
        render={({ location }) => {
          return (
            auth ? children :
            <Redirect
              to={{
                pathname: '/login',
                state: { from: location }
              }}
            />
          )
        }}
      />
    )
  }

  return (
    <div className="App">
      <ApolloProvider client={client}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <Router>
            <Switch>
              <Route path="/login">
                <Login />        
              </Route>
              <PrivateRoute path="/">
                <Todos />
              </PrivateRoute>
            </Switch>
          </Router>
        </MuiPickersUtilsProvider>
      </ApolloProvider>
    </div>
  );
}

export default App;
