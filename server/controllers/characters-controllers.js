const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const fs = require ('fs');
const HttpError = require('../models/http-error');
const Character=require('../models/character');
const User = require('../models/user');


const getCharacterById = async (req, res, next) => {
  const characterId = req.params.cid;
    let character;
    try{
      character = await Character.findById(characterId)
    }catch(err){
      const error = new HttpError('Failed to get Character, please try again',500);
      return next(error);
    }

  if (!character) {
    const error= new HttpError('Could not find a Character for the provided id.', 404);
    return next(error);
  }
  res.json({ entity: character.toObject({getters:true}) }); 
};


const getCharactersByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let characters;
  try{
    characters = await Character.find({creator: userId})
  }catch(err){
    const error = new HttpError('Failed to get Characters, please try again',500);
    return next(error);
  }

  if (!characters) {
    return next(
      new HttpError('Could not find Characters for the provided user id.', 404)
    );
  }

  res.json({ characters: characters.map(character=>character.toObject({getters: true})) });
};

const createCharacter = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description } = req.body;
  const createdCharacter = new Character( {
    title,
    description,
    image: req.file.path,
    creator: req.userData.userId,
  });

  let user;
  try{
    user= await User.findById(req.userData.userId);
    } catch(err){ 
      const error =new HttpError('Failed to create Character, please try again',500);
      return next(error);
    }

    if(!user){
      const error= new HttpError('Could not find specified user',404);
      return next(error);
    }

  try{
    const sess=await mongoose.startSession();
    sess.startTransaction();
    await createdCharacter.save({session:sess});
    user.characters.push(createdCharacter);
    await user.save({session: sess});
    await sess.commitTransaction();
  } catch(err){ 
    const error =new HttpError(err.message,500);
    return next(error);
  }
  res.status(201).json({ character: createdCharacter });
};

const updateCharacter = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const { title, description } = req.body;
  const CharacterId = req.params.cid;

  let character;
  try{
    character= await Character.findById(CharacterId);
  }catch(err){
    const error = new HttpError('Failed to update Character, please try again',500);
    return next(error);
  }

  if (character.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to edit this Character!',401);
    return next(error);
  }

  character.title = title;
  character.description = description;

  try{
    await character.save();
  }catch(err){
    const error = new HttpError('Failed to update Character, please try again',500);
    return next(error);
  }

  res.status(200).json({ entity: character.toObject({getters:true}) });
  
};

const addCharacterList = async (req, res, next) => {

  const {list} = req.body;
  const CharacterId = req.params.cid;

  let character;
  try{
    character= await Character.findById(CharacterId);
  }catch(err){
    const error = new HttpError('Failed to update Character details, please try again',500);
    return next(error);
  }

  if (character.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to add lists to this Character!',401);
    return next(error);
  }
  try{
    character.details.push(list);
    await character.save();
  }catch(err){
    const error = new HttpError('Failed to add list, please try again',500);
    return next(error);
  }

  res.status(200).json({ entity: character.toObject({getters:true}) });
};

const addCharacterCard = async (req, res, next) => {
  const { listId, card } = req.body;
  const CharacterId = req.params.cid;

  let character;
  try {
    character = await Character.findById(CharacterId);
  } catch (err) {
    const error = new HttpError('Failed to update Character details, please try again', 500);
    return next(error);
  }

  if (character.creator.toString() !== req.userData.userId) {
    const error = new HttpError('You are not allowed to add lists to this Character!', 401);
    return next(error);
  }

  try {
    const list = character.details.find((list) => list.id.toString() === listId.toString());
    if (!list) {
      const error = new HttpError('List not found', 404);
      return next(error);
    }

    list.items.push(card); 
    character.markModified('details'); // Marking the modified field to save it properly
    await character.save();
  } catch (err) {
    const error = new HttpError('Failed to add card, please try again', 500);
    return next(error);
  }

  const updatedCharacter = await Character.findById(CharacterId);

  res.status(200).json({ entity: updatedCharacter.toObject({ getters: true })});
};


const updateCharacterList = async (req, res, next) => {
  const { title, listId} = req.body;
  const CharacterId = req.params.cid;

  let character;
  try{
    character= await Character.findById(CharacterId);
  }catch(err){
    const error = new HttpError('Failed to find Character, please try again',500);
    return next(error);
  }

  if (character.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to edit this list!',401);
    return next(error);
  }
  try {
    const list = character.details.find((list) => list.id.toString() === listId.toString());
    if (!list) {
      const error = new HttpError('List not found', 404);
      return next(error);
    }
    list.title=title;
    await character.save();
  } catch (err) {
    const error = new HttpError('Failed to edit list, please try again', 500);
    return next(error);
  }

  res.status(200).json({ entity: character.toObject({getters:true}) });
};
const updateCharacterCard = async (req, res, next) => {
  const { listId, cardId, title, description} = req.body;
  const CharacterId = req.params.cid;

  let character;
  try{
    character= await Character.findById(CharacterId);
  }catch(err){
    const error = new HttpError('Failed to find Character, please try again',500);
    return next(error);
  }

  if (character.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to edit this list!',401);
    return next(error);
  }
  try {
    const list = character.details.find((list) => list.id.toString() === listId.toString());
    if (!list) {
      const error = new HttpError('List not found', 404);
      return next(error);
    }
    const card = list.items.find((card) => card.id.toString() === cardId.toString());
    if (!card) {
      const error = new HttpError('Card not found', 404);
      return next(error);
    }
    if(title){
    card.title=title; 
    }
    else if (description){
    card.description=description;
    }
    await character.save();
  } catch (err) {
    const error = new HttpError('Failed to edit card, please try again', 500);
    return next(error);
  }

  res.status(200).json({ entity: character.toObject({getters:true}) });
};
const deleteCharacterList = async (req, res, next)=>{
  const { listId} = req.body;
  const CharacterId = req.params.cid;

  let character;
  try{
    character= await Character.findById(CharacterId);
  }catch(err){
    const error = new HttpError('Failed to find Character, please try again',500);
    return next(error);
  }

  if (character.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to delete this list!',401);
    return next(error);
  }
  try {
    const list = character.details.find((list) => list.id.toString() === listId.toString());
    if (!list) {
      const error = new HttpError('List not found', 404);
      return next(error);
    }
    character.details.pull(list);
    await character.save();
  } catch (err) {
    const error = new HttpError('Failed to delete list, please try again', 500);
    return next(error);
  }

  res.status(200).json({ entity: character.toObject({getters:true}) });
};
const deleteCharacterCard = async (req, res, next) => {
  const { listId, cardId} = req.body;
  const CharacterId = req.params.cid;

  let character;
  try{
    character= await Character.findById(CharacterId);
  }catch(err){
    const error = new HttpError('Failed to find Character, please try again',500);
    return next(error);
  }

  if (character.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to edit this list!',401);
    return next(error);
  }
  try {
    const list = character.details.find((list) => list.id.toString() === listId.toString());
    if (!list) {
      const error = new HttpError('List not found', 404);
      return next(error);
    }
    const card = list.items.find((card) => card.id.toString() === cardId.toString());
    if (!card) {
      const error = new HttpError('Card not found', 404);
      return next(error);
    }
    list.items.pull(card);
    await character.save();
  } catch (err) {
    const error = new HttpError('Failed to delete card, please try again', 500);
    return next(error);
  }

  res.status(200).json({ entity: character.toObject({getters:true}) });
};
const deleteCharacter = async (req, res, next) => {
  const CharacterId = req.params.cid;
  let character;
  try{
    character= await Character.findById(CharacterId).populate('creator');
  }catch(err){
    const error = new HttpError('Failed to delete Character, please try again',500);
    return next(error);
  }
   if  (!character){
    const error = new HttpError('Could not find Character with this ID.', 404);
    return next(error); 
   }

   if (character.creator.id !== req.userData.userId){
    const error = new HttpError('You are not allowed to delete this Character!',401);
    return next(error);
  }

   const imagePath = character.image;

  try{
    const sess=await mongoose.startSession();
    sess.startTransaction();
    await character.deleteOne({session:sess});
    character.creator.characters.pull(character);
    await character.creator.save({session: sess});
    await sess.commitTransaction();
  }catch(err){
    const error = new HttpError('Failed to delete Character, please try again',500);
    return next(error);
  }
  fs.unlink(imagePath, err =>{
    console.log(err);
  });

  res.status(200).json({ message: 'Deleted Character.' });
};
const updateCharacterListOrder = async (req, res, next) => {
  const { listIds} = req.body;
  const CharacterId = req.params.cid;
  let character;
  try{
    character= await Character.findById(CharacterId);
  }catch(err){
    const error = new HttpError('Failed to find Character, please try again',500);
    return next(error);
  }

  if (character.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to edit these details!',401);
    return next(error);
  }
  
 
  try {
    character.details = listIds.map((listId) => character.details.find((list) => list.id.toString() === listId.toString()));
    await character.save();
  } catch (err) {
    const error = new HttpError('Failed to update list order, please try again', 500);
    return next(error);
  }

  res.status(200).json({ entity: character.toObject({getters:true}) });
};
const updateCharacterCardOrder = async (req, res, next) => {
  const {listId, cardIds} = req.body;
  const CharacterId = req.params.cid;
  let character;
  try{
    character= await Character.findById(CharacterId);
  }catch(err){
    const error = new HttpError('Failed to find Character, please try again',500);
    return next(error);
  }

  if (character.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to edit this list!',401);
    return next(error);
  }
  try {
    const list = character.details.find((list) => list.id.toString() === listId.toString());
    if (!list) {
      const error = new HttpError('List not found', 404);
      return next(error);
    }
    list.items = cardIds.map((cardId) => list.items.find((card) => card.id.toString() === cardId.toString()));
    await character.save();
  } catch (err) {
    const error = new HttpError('Failed to update card order, please try again', 500);
    return next(error);
  }

  res.status(200).json({ entity: character.toObject({getters:true}) });
};

exports.getCharacterById = getCharacterById;
exports.getCharactersByUserId = getCharactersByUserId;
exports.createCharacter = createCharacter;
exports.updateCharacter = updateCharacter;
exports.deleteCharacter = deleteCharacter;
exports.addCharacterList = addCharacterList;
exports.addCharacterCard=addCharacterCard;
exports.updateCharacterList=updateCharacterList;
exports.deleteCharacterList=deleteCharacterList;
exports.updateCharacterCard=updateCharacterCard;
exports.deleteCharacterCard=deleteCharacterCard;
exports.updateCharacterListOrder=updateCharacterListOrder;
exports.updateCharacterCardOrder=updateCharacterCardOrder;