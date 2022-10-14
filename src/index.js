const express = require('express');
const {v4:uuidV4} = require("uuid")
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find(user => user.username === username)

  if(!user){
    return response.status(404).json({error:"User does not exists"})
  }

  request.user = user

  return next()

}

app.post('/users', (request, response) => {
  const { username, name } = request.body

  const userAlreadExists = users.find(user => user.username === username)

  if (userAlreadExists){
    return response.status(400).json({error:"User already exists"})
  }

   
  const user = {
    id:uuidV4(),
    name,
    username,
    todos:[]
  }

  users.push(user)
    
   return response.status(201).json(user)

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const todo = {
    id:uuidV4,
    title,
    done: false,
    deadline: new Date(deadline),
    create_at:new Date()
  }

  user.todos.push(todo)
  return  response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  const { id } =  request.params

  const checkTodo = user.todos.find(todo => todo.id === id)

  if(!checkTodo){
    return  response.status(404).json({error: "Todo not found"})
  }

  checkTodo.title = title
  checkTodo.deadline = new Date(deadline)

  return response.json(checkTodo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params 

  const checkTodo = user.todos.find(todo => todo.id === id)
  if(!checkTodo){
    return response.status(404).json({error:"Todo not found"})
  }
  
  checkTodo.done = true
  
  return response.json(checkTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todoIndex = user.todos.findIndex(todo => todo.id === id)
  
  if (todoIndex === -1){
    return response.status(404).json({error: "Not found"})
  }

  user.todos.splice(todoIndex, 1)

  return response.status(204).json()
});

module.exports = app;