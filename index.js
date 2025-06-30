const express = require('express');
const morgan = require('morgan');
const app = express();

let persons = [
  { 
    id: 1,
    name: "Arto Hellas",
    number: "040-123456"
  },
  { 
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523"
  },
  { 
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345"
  }
];

app.use(express.static('build'));
app.use(express.json());

morgan.token('body', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : '';
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

app.get('/api/persons', (req, res) => {
  res.json(persons);
});

app.get('/info', (req, res) => {
  const timeNow = new Date();
  const amount = persons.length;

  const infoHtml = `
    <p>Puhelinluettelossa on ${amount} henkilön tiedot</p>
    <p>${timeNow}</p>
  `;

  res.send(infoHtml);
});

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find(p => p.id === id);

  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  const personExists = persons.some(p => p.id === id);

  if (!personExists) {
    return res.status(404).json({ error: 'Henkilöä ei löytynyt' });
  }

  persons = persons.filter(p => p.id !== id);

  res.status(204).end();
});

app.post('/api/persons', (req, res) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({ error: 'nimi tai numero puuttuu' });
  }

  const nameExists = persons.some(p => p.name === body.name);
  if (nameExists) {
    return res.status(400).json({ error: 'name must be unique' });
  }

  const generateId = () => {
    return Math.floor(Math.random() * 1000000);
  };

  let newId = generateId();

  while (persons.find(p => p.id === newId)) {
    newId = generateId();
  }

  const newPerson = {
    id: newId,
    name: body.name,
    number: body.number
  };

  persons = persons.concat(newPerson);

  res.json(newPerson);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
