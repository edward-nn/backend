const mongoose = require('mongoose')

if (process.argv.length<3 || process.argv.length>5) {
  console.log('give password as argument or check number of the enter value')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url =
  `mongodb+srv://fullstack:${password}@cluster0.o1opl.mongodb.net/phonebookApp?retryWrites=true&w=majority` 

mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3 ){
    console.log('phonebook: ')
Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person.name, person.number)
    })
    mongoose.connection.close()
  })
}
if (process.argv.length > 3 ){
  const person = new Person({
    name: name,
    number: number 
  })

  person.save().then(result => {
    //console.log('person saved!')
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
}
