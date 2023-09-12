const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const listItemSchema = new Schema({
    _id: { type: mongoose.Types.ObjectId, auto: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
  });
  
  const listSchema = new Schema({
    _id: { type: mongoose.Types.ObjectId, auto: true },
    title: { type: String, required: true },
    items: [listItemSchema],
  });

const objectSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User'},
    details: {
        type: [listSchema],
        default: [
          {
            title: 'Lore',
            items: [
              {title: 'click to edit', description: 'click to edit'}
            ],
          },
          {
            title: 'Current story',
            items: [
              {title: 'click to edit', description: 'click to edit'}
            ],
          },
          {
            title: 'Misc',
            items: [
              {title: 'click to edit', description: 'click to edit'}
            ],
          },
        ],
      },
});

module.exports = mongoose.model('Object', objectSchema);