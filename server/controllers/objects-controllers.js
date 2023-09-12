const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const fs = require ('fs');
const HttpError = require('../models/http-error');
const Obj=require('../models/object');
const User = require('../models/user');


const getObjectById = async (req, res, next) => {
  const objectId = req.params.objid;
    let object;
    try{
      object = await Obj.findById(objectId)
    }catch(err){
      const error = new HttpError('Failed to get object, please try again',500);
      return next(error);
    }

  if (!object) {
    const error= new HttpError('Could not find a object for the provided id.', 404);
    return next(error);
  }
  res.json({ entity: object.toObject({getters:true}) }); 
};


const getObjectsByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let objects;
  try{
    objects = await Obj.find({creator: userId})
  }catch(err){
    const error = new HttpError('Failed to get objects, please try again',500);
    return next(error);
  }

  if (!objects) {
    return next(
      new HttpError('Could not find objects for the provided user id.', 404)
    );
  }

  res.json({ objects: objects.map(object=>object.toObject({getters: true})) });
};

const createObject = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description } = req.body;
  const createdObject = new Obj( {
    title,
    description,
    image: req.file.path,
    creator: req.userData.userId,
  });

  let user;
  try{
    user= await User.findById(req.userData.userId);
    } catch(err){ 
      const error =new HttpError('Failed to create object, please try again',500);
      return next(error);
    }

    if(!user){
      const error= new HttpError('Could not find specified user',404);
      return next(error);
    }

  try{
    const sess=await mongoose.startSession();
    sess.startTransaction();
    await createdObject.save({session:sess});
    user.objects.push(createdObject);
    await user.save({session: sess});
    await sess.commitTransaction();
  } catch(err){ 
    const error =new HttpError(err.message,500);
    return next(error);
  }
  res.status(201).json({ object: createdObject });
};

const updateObject = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const { title, description } = req.body;
  const objectId = req.params.objid;

  let object;
  try{
    object= await Obj.findById(objectId);
  }catch(err){
    const error = new HttpError('Failed to update object, please try again',500);
    return next(error);
  }

  if (object.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to edit this object!',401);
    return next(error);
  }

  object.title = title;
  object.description = description;

  try{
    await object.save();
  }catch(err){
    const error = new HttpError('Failed to update object, please try again',500);
    return next(error);
  }

  res.status(200).json({ entity: object.toObject({getters:true}) });
};

const addObjectList = async (req, res, next) => {

  const {list} = req.body;
  const objectId = req.params.objid;

  let object;
  try{
    object= await Obj.findById(objectId);
  }catch(err){
    const error = new HttpError('Failed to update object details, please try again',500);
    return next(error);
  }

  if (object.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to add lists to this object!',401);
    return next(error);
  }
  try{
    object.details.push(list);
    await object.save();
  }catch(err){
    const error = new HttpError('Failed to add list, please try again',500);
    return next(error);
  }

  res.status(200).json({ entity: object.toObject({getters:true}) });
};

const addObjectCard = async (req, res, next) => {
  const { listId, card } = req.body;
  const objectId = req.params.objid;

  let object;
  try {
    object = await Obj.findById(objectId);
  } catch (err) {
    const error = new HttpError('Failed to update object details, please try again', 500);
    return next(error);
  }

  if (object.creator.toString() !== req.userData.userId) {
    const error = new HttpError('You are not allowed to add lists to this object!', 401);
    return next(error);
  }

  try {
    const list = object.details.find((list) => list.id.toString() === listId.toString());
    if (!list) {
      const error = new HttpError('List not found', 404);
      return next(error);
    }

    list.items.push(card); 
    object.markModified('details'); // Marking the modified field to save it properly
    await object.save();
  } catch (err) {
    const error = new HttpError('Failed to add card, please try again', 500);
    return next(error);
  }

  const updatedObject = await Obj.findById(objectId);

  res.status(200).json({ entity: updatedObject.toObject({ getters: true })});
};


const updateObjectList = async (req, res, next) => {
  const { title, listId} = req.body;
  const objectId = req.params.objid;

  let object;
  try{
    object= await Obj.findById(objectId);
  }catch(err){
    const error = new HttpError('Failed to find object, please try again',500);
    return next(error);
  }

  if (object.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to edit this list!',401);
    return next(error);
  }
  try {
    const list = object.details.find((list) => list.id.toString() === listId.toString());
    if (!list) {
      const error = new HttpError('List not found', 404);
      return next(error);
    }
    if(!title){
      list.title=" ";
    }else{list.title=title; }
    await object.save();
  } catch (err) {
    const error = new HttpError('Failed to edit list, please try again', 500);
    return next(error);
  }

  res.status(200).json({ entity: object.toObject({getters:true}) });
};
const updateObjectCard = async (req, res, next) => {
  const { listId, cardId, title, description} = req.body;
  const objectId = req.params.objid;

  let object;
  try{
    object= await Obj.findById(objectId);
  }catch(err){
    const error = new HttpError('Failed to find object, please try again',500);
    return next(error);
  }

  if (object.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to edit this list!',401);
    return next(error);
  }
  try {
    const list = object.details.find((list) => list.id.toString() === listId.toString());
    if (!list) {
      const error = new HttpError('List not found', 404);
      return next(error);
    }
    const card = list.items.find((card) => card.id.toString() === cardId.toString());
    if (!card) {
      const error = new HttpError('Card not found', 404);
      return next(error);
    }
    if(description==='\u00A0'){
    if(!title){
      card.title='\u00A0';
    }else{card.title=title; }
    } else if (title === '\u00A0'){
    if(!description){
      card.description='\u00A0';
    }else{card.description=description; }
    }
    await object.save();
  } catch (err) {
    const error = new HttpError('Failed to edit card, please try again', 500);
    return next(error);
  }

  res.status(200).json({ entity: object.toObject({getters:true}) });
};
const deleteObjectList = async (req, res, next)=>{
  const { listId} = req.body;
  const objectId = req.params.objid;

  let object;
  try{
    object= await Obj.findById(objectId);
  }catch(err){
    const error = new HttpError('Failed to find object, please try again',500);
    return next(error);
  }

  if (object.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to delete this list!',401);
    return next(error);
  }
  try {
    const list = object.details.find((list) => list.id.toString() === listId.toString());
    if (!list) {
      const error = new HttpError('List not found', 404);
      return next(error);
    }
    object.details.pull(list);
    await object.save();
  } catch (err) {
    const error = new HttpError('Failed to delete list, please try again', 500);
    return next(error);
  }

  res.status(200).json({ entity: object.toObject({getters:true}) });
};
const deleteObjectCard = async (req, res, next) => {
  const { listId, cardId} = req.body;
  const objectId = req.params.objid;

  let object;
  try{
    object= await Obj.findById(objectId);
  }catch(err){
    const error = new HttpError('Failed to find object, please try again',500);
    return next(error);
  }

  if (object.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to edit this list!',401);
    return next(error);
  }
  try {
    const list = object.details.find((list) => list.id.toString() === listId.toString());
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
    await object.save();
  } catch (err) {
    const error = new HttpError('Failed to delete card, please try again', 500);
    return next(error);
  }

  res.status(200).json({ entity: object.toObject({getters:true}) });
};
const deleteObject = async (req, res, next) => {
  const objectId = req.params.objid;

  let object;
  try{
    object= await Obj.findById(objectId).populate('creator');
  }catch(err){
    const error = new HttpError('Failed to delete object, please try again',500);
    return next(error);
  }
   if  (!object){
    const error = new HttpError('Could not find object with this ID.', 404);
    return next(error); 
   }

   if (object.creator.id !== req.userData.userId){
    const error = new HttpError('You are not allowed to delete this object!',401);
    return next(error);
  }

   const imagePath = object.image;

  try{
    const sess=await mongoose.startSession();
    sess.startTransaction();
    await object.deleteOne({session:sess});
    object.creator.objects.pull(object);
    await object.creator.save({session: sess});
    await sess.commitTransaction();
  }catch(err){
    const error = new HttpError('Failed to delete object, please try again',500);
    return next(error);
  }
  fs.unlink(imagePath, err =>{
    console.log(err);
  });

  res.status(200).json({ message: 'Deleted object.' });
};
const updateObjectListOrder = async (req, res, next) => {
  const { listIds} = req.body;
  const objectId = req.params.objid;
  let object;
  try{
    object= await Obj.findById(objectId);
  }catch(err){
    const error = new HttpError('Failed to find object, please try again',500);
    return next(error);
  }

  if (object.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to edit these details!',401);
    return next(error);
  }
  
 
  try {
    object.details = listIds.map((listId) => object.details.find((list) => list.id.toString() === listId.toString()));
    await object.save();
  } catch (err) {
    const error = new HttpError('Failed to update list order, please try again', 500);
    return next(error);
  }

  res.status(200).json({ entity: object.toObject({getters:true}) });
};
const updateObjectCardOrder = async (req, res, next) => {
  const {listId, cardIds} = req.body;
  const objectId = req.params.objid;
  let object;
  try{
    object= await Obj.findById(objectId);
  }catch(err){
    const error = new HttpError('Failed to find object, please try again',500);
    return next(error);
  }

  if (object.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to edit this list!',401);
    return next(error);
  }
  try {
    const list = object.details.find((list) => list.id.toString() === listId.toString());
    if (!list) {
      const error = new HttpError('List not found', 404);
      return next(error);
    }
    list.items = cardIds.map((cardId) => list.items.find((card) => card.id.toString() === cardId.toString()));
    await object.save();
  } catch (err) {
    const error = new HttpError('Failed to update card order, please try again', 500);
    return next(error);
  }

  res.status(200).json({ entity: object.toObject({getters:true}) });
};

exports.getObjectById = getObjectById;
exports.getObjectsByUserId = getObjectsByUserId;
exports.createObject = createObject;
exports.updateObject = updateObject;
exports.deleteObject = deleteObject;
exports.addObjectList = addObjectList;
exports.addObjectCard=addObjectCard;
exports.updateObjectList=updateObjectList;
exports.deleteObjectList=deleteObjectList;
exports.updateObjectCard=updateObjectCard;
exports.deleteObjectCard=deleteObjectCard;
exports.updateObjectListOrder=updateObjectListOrder;
exports.updateObjectCardOrder=updateObjectCardOrder;