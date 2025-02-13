require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
var morgan = require('morgan')
const Person = require('./models/person')

app.use(cors())
app.use(express.static('build'))
app.use(express.json())



morgan.token('body', req => {
  return JSON.stringify(req.body)
})

app.use(morgan(' :method :url :status :res[content-length] - :response-time ms :body'))

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response, next) => {
  Person.find({})
    .then(persons => {
      if (persons) {
        response.send(`<span>Phonebook has info for ${persons.length} people.</span><p>${new Date()}</p>`)
      } else {
        response.status(400).json({
          error: 'content missing'
        })
      }
    })
    .catch(error => next(error))

})


app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(notes => {
    response.json(notes)
  })
    .catch(error => next(error))
})


app.get('/api/persons/:id', (request, response, next) => {
  //const id = Number(request.params.id)
  //const person = persons.find(item => item.id === id)
  Person.findById(request.params.id)
    .then(person => {
      if(!person) {response.status(404).end()
      }   else {
        response.json(person)
      }
    })
    .catch(error => {
      console.log(error)
      next(error)
      //response.status(400).send({ error: 'malformatted id' })
      //response.status(500).end()
    })
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  //console.log('body', body)
  if (!body || body === undefined){
    return response.status(400).json({
      error: 'content missing'
    })
  } else if(!body.name || !body.number){
    return response.status(400).json({
      error: 'The name or number is missing'
    })
  }
  //const name = request.body.name;
  //const number = request.body.number;

  const person = new Person ({
    name: body.name,
    number: body.number || false,
  })
  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
    .catch(error =>
      next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))


})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(request.params.id,
    { name, number }, { new: true, runValidators: true, context: 'query'  })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})






const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)
app.use(errorHandler)
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})