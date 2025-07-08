const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true,
  },
  number: {
    type: String,
    minlength: 8,
    required: true,
    validate: {
      validator: function(v) {
        // Numeron muoto: 2 tai 3 numeroa - väliviiva - vähintään 5 numeroa
        return /^\d{2,3}-\d{5,}$/.test(v);
      },
      message: props => `${props.value} ei ole kelvollinen puhelinnumero! Muoto: XX-XXXXXXX tai XXX-XXXXXXX`
    }
  }
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)
