require('dotenv').config(); // .env-tiedoston käyttö

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose'); // 🔥 tämä puuttui!
const Person = require('./models/person'); // MongoDB-malli

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Yhdistetty MongoDB:hen');
  })
  .catch((error) => {
    console.error('❌ Virhe yhdistettäessä MongoDB:hen:', error.message);
  });

const app = express();


app.use(express.static('dist'));
app.use(express.json());

morgan.token('body', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : '';
});
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

// Hae kaikki henkilöt tietokannasta
app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(persons => {
      res.json(persons);
    })
    .catch(error => next(error));
});


// Info-sivu toimii edelleen kovakoodattuna
app.get('/info', (req, res, next) => {
  Person.find({})
    .then(persons => {
      const timeNow = new Date();
      const infoHtml = `
        <p>Puhelinluettelossa on ${persons.length} henkilön tiedot</p>
        <p>${timeNow}</p>
      `;
      res.send(infoHtml);
    })
    .catch(error => next(error));
});


app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).json({ error: 'Henkilöä ei löytynyt' });
      }
    })
    .catch(error => next(error));
});


app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(result => {
      if (result) {
        res.status(204).end();
      } else {
        res.status(404).json({ error: 'Henkilöä ei löytynyt' });
      }
    })
    .catch(error => next(error));
});


app.post('/api/persons', (req, res, next) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({ error: 'nimi tai numero puuttuu' });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save()
    .then(savedPerson => {
      res.json(savedPerson);
    })
    .catch(error => next(error));
});

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'Virheellinen id' });
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body;

  const updatedPerson = {
    name,
    number,
  };

  Person.findByIdAndUpdate(req.params.id, updatedPerson, { new: true, runValidators: true, context: 'query' })
    .then(updated => {
      if (updated) {
        res.json(updated);
      } else {
        res.status(404).json({ error: 'Henkilöä ei löytynyt päivitettäväksi' });
      }
    })
    .catch(error => next(error));
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});