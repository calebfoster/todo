# Todos

Create a quick todo list

## Deployed instance
[https://calebfoster-todo.herokuapp.com](https://calebfoster-todo.herokuapp.com)

## Stack
- Node backend (Express)
- React frontend
- GraphQL layer (Apollo)
- Flat-file database (MongoDB clone)
- Material-UI for looks
- FormIK on form handling
- JWT for auth
- Hashed passwords

Forms are set up for input validation but not fleshed out. I would definitely finish that out. 

I could throw in the due date functionality but that's probably another hour or more so I left it out. FormIk complicates it a tad. But I can implement it if you're interested.  

I'm more familiar with SQL databases so if I made this over again I would just run with SQL. The database gets wiped each push so would use a server on production or maybe just SQLite for a little demo. I thought document store might be quicker to implement but pretty sure I was wrong. Would set up some kind of migrations.

There is LOTS of room to make code more readable and organized (breaking out components, DRY, etc..). Main concern was just functionality in a reasonable amount of time.

Google Auth is integrated.

For simplicity I combined logging in with signing up so the first login creates the account, and subsequent correct passwords will log in the account.

Clicking an item in the list "completes" it.

I believe that's everything!