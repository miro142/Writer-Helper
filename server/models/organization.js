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

const organizationSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User'},
    details: {
        type: [listSchema],
        default: [
          {
            title: 'General',
            items: [
                {title: 'Purpose', description: 'click to edit'},
                {title: 'Organization type', description: 'click to edit'}
            ]
          },
          {
            title: 'Lore',
            items: [
              { title: 'Foundation', description: 'click to edit' },
              
            ],
          },
        ],
      },
});

module.exports = mongoose.model('Organization', organizationSchema);