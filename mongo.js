const mongoose = require('mongoose');

const password = process.argv[2];

const url = `mongodb+srv://fullstack:${password}@phonebook.keu1vbo.mongodb.net/phonebook?retryWrites=true&w=majority&appName=phonebook`;

mongoose.set('strictQuery', false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

if (process.argv.length === 3) {
  Person.find({}).then(result => {
    console.log('phonebook:');
    result.forEach(p => {
      console.log(`${p.name} ${p.number}`);
    });
    mongoose.connection.close();
  });
}

if (process.argv.length === 5) {
  const name = process.argv[3];
  const number = process.argv[4];

  const person = new Person({ name, number });

  person.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook`);
    mongoose.connection.close();
  });
}
