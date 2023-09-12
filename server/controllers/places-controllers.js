const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const fs = require ('fs');
const HttpError = require('../models/http-error');
const Place=require('../models/place');
const User = require('../models/user');


const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
    let place;
    try{
      place = await Place.findById(placeId)
    }catch(err){
      const error = new HttpError('Failed to get place, please try again',500);
      return next(error);
    }

  if (!place) {
    const error= new HttpError('Could not find a place for the provided id.', 404);
    return next(error);
  }
  res.json({ entity: place.toObject({getters:true}) }); 
};


const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let places;
  try{
    places = await Place.find({creator: userId})
  }catch(err){
    const error = new HttpError('Failed to get places, please try again',500);
    return next(error);
  }

  if (!places) {
    return next(
      new HttpError('Could not find places for the provided user id.', 404)
    );
  }

  res.json({ places: places.map(place=>place.toObject({getters: true})) });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description } = req.body;
  const createdPlace = new Place( {
    title,
    description,
    image: req.file.path,
    creator: req.userData.userId,
  });

  let user;
  try{
    user= await User.findById(req.userData.userId);
    } catch(err){ 
      const error =new HttpError('Failed to create place, please try again',500);
      return next(error);
    }

    if(!user){
      const error= new HttpError('Could not find specified user',404);
      return next(error);
    }

  try{
    const sess=await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({session:sess});
    user.places.push(createdPlace);
    await user.save({session: sess});
    await sess.commitTransaction();
  } catch(err){ 
    const error =new HttpError(err.message,500);
    return next(error);
  }
  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try{
    place= await Place.findById(placeId);
  }catch(err){
    const error = new HttpError('Failed to update place, please try again',500);
    return next(error);
  }

  if (place.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to edit this place!',401);
    return next(error);
  }

  place.title = title;
  place.description = description;

  try{
    await place.save();
  }catch(err){
    const error = new HttpError('Failed to update place, please try again',500);
    return next(error);
  }

  res.status(200).json({ entity: place.toObject({getters:true}) });
};

const addPlaceList = async (req, res, next) => {
  const {list} = req.body;
  const placeId = req.params.pid;

  let place;
  try{
    place= await Place.findById(placeId);
  }catch(err){
    const error = new HttpError('Failed to update place details, please try again',500);
    return next(error);
  }

  if (place.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to add lists to this place!',401);
    return next(error);
  }
  try{
    place.details.push(list);
    await place.save();
  }catch(err){
    const error = new HttpError('Failed to add list, please try again',500);
    return next(error);
  }

  res.status(200).json({ entity: place.toObject({getters:true}) });
};

const addPlaceCard = async (req, res, next) => {
  const { listId, card } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError('Failed to update place details, please try again', 500);
    return next(error);
  }

  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError('You are not allowed to add lists to this place!', 401);
    return next(error);
  }

  try {
    const list = place.details.find((list) => list.id.toString() === listId.toString());
    if (!list) {
      const error = new HttpError('List not found', 404);
      return next(error);
    }

    list.items.push(card); 
    place.markModified('details'); // Marking the modified field to save it properly
    await place.save();
  } catch (err) {
    const error = new HttpError('Failed to add card, please try again', 500);
    return next(error);
  }

  const updatedPlace = await Place.findById(placeId);

  res.status(200).json({ entity: updatedPlace.toObject({ getters: true })});
};


const updatePlaceList = async (req, res, next) => {
  const { title, listId} = req.body;
  const placeId = req.params.pid;

  let place;
  try{
    place= await Place.findById(placeId);
  }catch(err){
    const error = new HttpError('Failed to find place, please try again',500);
    return next(error);
  }

  if (place.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to edit this list!',401);
    return next(error);
  }
  try {
    const list = place.details.find((list) => list.id.toString() === listId.toString());
    if (!list) {
      const error = new HttpError('List not found', 404);
      return next(error);
    }
    if(!title){
      list.title=" ";
    }else{list.title=title; }
    await place.save();
  } catch (err) {
    const error = new HttpError('Failed to edit list, please try again', 500);
    return next(error);
  }

  res.status(200).json({ entity: place.toObject({getters:true}) });
};
const updatePlaceCard = async (req, res, next) => {
  const { listId, cardId, title, description} = req.body;
  const placeId = req.params.pid;

  let place;
  try{
    place= await Place.findById(placeId);
  }catch(err){
    const error = new HttpError('Failed to find place, please try again',500);
    return next(error);
  }

  if (place.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to edit this list!',401);
    return next(error);
  }
  try {
    const list = place.details.find((list) => list.id.toString() === listId.toString());
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
    await place.save();
  } catch (err) {
    const error = new HttpError('Failed to edit card, please try again', 500);
    return next(error);
  }

  res.status(200).json({ entity: place.toObject({getters:true}) });
};
const deletePlaceList = async (req, res, next)=>{
  const { listId} = req.body;
  const placeId = req.params.pid;

  let place;
  try{
    place= await Place.findById(placeId);
  }catch(err){
    const error = new HttpError('Failed to find place, please try again',500);
    return next(error);
  }

  if (place.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to delete this list!',401);
    return next(error);
  }
  try {
    const list = place.details.find((list) => list.id.toString() === listId.toString());
    if (!list) {
      const error = new HttpError('List not found', 404);
      return next(error);
    }
    place.details.pull(list);
    await place.save();
  } catch (err) {
    const error = new HttpError('Failed to delete list, please try again', 500);
    return next(error);
  }

  res.status(200).json({ entity: place.toObject({getters:true}) });
};
const deletePlaceCard = async (req, res, next) => {
  const { listId, cardId} = req.body;
  const placeId = req.params.pid;

  let place;
  try{
    place= await Place.findById(placeId);
  }catch(err){
    const error = new HttpError('Failed to find place, please try again',500);
    return next(error);
  }

  if (place.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to edit this list!',401);
    return next(error);
  }
  try {
    const list = place.details.find((list) => list.id.toString() === listId.toString());
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
    await place.save();
  } catch (err) {
    const error = new HttpError('Failed to delete card, please try again', 500);
    return next(error);
  }

  res.status(200).json({ entity: place.toObject({getters:true}) });
};
const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try{
    place= await Place.findById(placeId).populate('creator');
  }catch(err){
    const error = new HttpError('Failed to delete place, please try again',500);
    return next(error);
  }
   if  (!place){
    const error = new HttpError('Could not find place with this ID.', 404);
    return next(error); 
   }

   if (place.creator.id !== req.userData.userId){
    const error = new HttpError('You are not allowed to delete this place!',401);
    return next(error);
  }

   const imagePath = place.image;

  try{
    const sess=await mongoose.startSession();
    sess.startTransaction();
    await place.deleteOne({session:sess});
    place.creator.places.pull(place);
    await place.creator.save({session: sess});
    await sess.commitTransaction();
  }catch(err){
    const error = new HttpError('Failed to delete place, please try again',500);
    return next(error);
  }
  fs.unlink(imagePath, err =>{
    console.log(err);
  });

  res.status(200).json({ message: 'Deleted place.' });
};
const updatePlaceListOrder = async (req, res, next) => {
  const { listIds} = req.body;
  const placeId = req.params.pid;
  let place;
  try{
    place= await Place.findById(placeId);
  }catch(err){
    const error = new HttpError('Failed to find place, please try again',500);
    return next(error);
  }

  if (place.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to edit these details!',401);
    return next(error);
  }
  
 
  try {
    place.details = listIds.map((listId) => place.details.find((list) => list.id.toString() === listId.toString()));
    await place.save();
  } catch (err) {
    const error = new HttpError('Failed to update list order, please try again', 500);
    return next(error);
  }

  res.status(200).json({ entity: place.toObject({getters:true}) });
};
const updatePlaceCardOrder = async (req, res, next) => {
  const {listId, cardIds} = req.body;
  const placeId = req.params.pid;
  let place;
  try{
    place= await Place.findById(placeId);
  }catch(err){
    const error = new HttpError('Failed to find place, please try again',500);
    return next(error);
  }

  if (place.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to edit this list!',401);
    return next(error);
  }
  try {
    const list = place.details.find((list) => list.id.toString() === listId.toString());
    if (!list) {
      const error = new HttpError('List not found', 404);
      return next(error);
    }
    list.items = cardIds.map((cardId) => list.items.find((card) => card.id.toString() === cardId.toString()));
    await place.save();
  } catch (err) {
    const error = new HttpError('Failed to update card order, please try again', 500);
    return next(error);
  }

  res.status(200).json({ entity: place.toObject({getters:true}) });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
exports.addPlaceList = addPlaceList;
exports.addPlaceCard=addPlaceCard;
exports.updatePlaceList=updatePlaceList;
exports.deletePlaceList=deletePlaceList;
exports.updatePlaceCard=updatePlaceCard;
exports.deletePlaceCard=deletePlaceCard;
exports.updatePlaceListOrder=updatePlaceListOrder;
exports.updatePlaceCardOrder=updatePlaceCardOrder;