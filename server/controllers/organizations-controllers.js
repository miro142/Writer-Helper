const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const fs = require ('fs');
const HttpError = require('../models/http-error');
const Organization=require('../models/organization');
const User = require('../models/user');


const getOrganizationById = async (req, res, next) => {
  const organizationId = req.params.orgid;
    let organization;
    try{
      organization = await Organization.findById(organizationId)
    }catch(err){
      const error = new HttpError('Failed to get organization, please try again',500);
      return next(error);
    }

  if (!organization) {
    const error= new HttpError('Could not find a organization for the provided id.', 404);
    return next(error);
  }
  res.json({ entity: organization.toObject({getters:true}) }); 
};


const getOrganizationsByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let organizations;
  try{
    organizations = await Organization.find({creator: userId})
  }catch(err){
    const error = new HttpError('Failed to get organizations, please try again',500);
    return next(error);
  }

  if (!organizations) {
    return next(
      new HttpError('Could not find organizations for the provided user id.', 404)
    );
  }

  res.json({ organizations: organizations.map(organization=>organization.toObject({getters: true})) });
};

const createOrganization = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description } = req.body;
  const createdOrganization = new Organization( {
    title,
    description,
    image: req.file.path,
    creator: req.userData.userId,
  });

  let user;
  try{
    user= await User.findById(req.userData.userId);
    } catch(err){ 
      const error =new HttpError('Failed to create organization, please try again',500);
      return next(error);
    }

    if(!user){
      const error= new HttpError('Could not find specified user',404);
      return next(error);
    }

  try{
    const sess=await mongoose.startSession();
    sess.startTransaction();
    await createdOrganization.save({session:sess});
    user.organizations.push(createdOrganization);
    await user.save({session: sess});
    await sess.commitTransaction();
  } catch(err){ 
    const error =new HttpError(err.message,500);
    return next(error);
  }
  res.status(201).json({ organization: createdOrganization });
};

const updateOrganization = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const { title, description } = req.body;
  const organizationId = req.params.orgid;

  let organization;
  try{
    organization= await Organization.findById(organizationId);
  }catch(err){
    const error = new HttpError('Failed to update organization, please try again',500);
    return next(error);
  }

  if (organization.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to edit this organization!',401);
    return next(error);
  }

  organization.title = title;
  organization.description = description;

  try{
    await organization.save();
  }catch(err){
    const error = new HttpError('Failed to update organization, please try again',500);
    return next(error);
  }

  res.status(200).json({ entity: organization.toObject({getters:true}) });
};

const addOrganizationList = async (req, res, next) => {

  const {list} = req.body;
  const organizationId = req.params.orgid;

  let organization;
  try{
    organization= await Organization.findById(organizationId);
  }catch(err){
    const error = new HttpError('Failed to update organization details, please try again',500);
    return next(error);
  }

  if (organization.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to add lists to this organization!',401);
    return next(error);
  }
  try{
    organization.details.push(list);
    await organization.save();
  }catch(err){
    const error = new HttpError('Failed to add list, please try again',500);
    return next(error);
  }

  res.status(200).json({ entity: organization.toObject({getters:true}) });
};

const addOrganizationCard = async (req, res, next) => {
  const { listId, card } = req.body;
  const organizationId = req.params.orgid;

  let organization;
  try {
    organization = await Organization.findById(organizationId);
  } catch (err) {
    const error = new HttpError('Failed to update organization details, please try again', 500);
    return next(error);
  }

  if (organization.creator.toString() !== req.userData.userId) {
    const error = new HttpError('You are not allowed to add lists to this organization!', 401);
    return next(error);
  }

  try {
    const list = organization.details.find((list) => list.id.toString() === listId.toString());
    if (!list) {
      const error = new HttpError('List not found', 404);
      return next(error);
    }

    list.items.push(card); 
    organization.markModified('details'); // Marking the modified field to save it properly
    await organization.save();
  } catch (err) {
    const error = new HttpError('Failed to add card, please try again', 500);
    return next(error);
  }

  const updatedOrganization = await Organization.findById(organizationId);

  res.status(200).json({ entity: updatedOrganization.toObject({ getters: true })});
};


const updateOrganizationList = async (req, res, next) => {
  const { title, listId} = req.body;
  const organizationId = req.params.orgid;

  let organization;
  try{
    organization= await Organization.findById(organizationId);
  }catch(err){
    const error = new HttpError('Failed to find organization, please try again',500);
    return next(error);
  }

  if (organization.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to edit this list!',401);
    return next(error);
  }
  try {
    const list = organization.details.find((list) => list.id.toString() === listId.toString());
    if (!list) {
      const error = new HttpError('List not found', 404);
      return next(error);
    }
    if(!title){
      list.title=" ";
    }else{list.title=title; }
    await organization.save();
  } catch (err) {
    const error = new HttpError('Failed to edit list, please try again', 500);
    return next(error);
  }

  res.status(200).json({ entity: organization.toObject({getters:true}) });
};
const updateOrganizationCard = async (req, res, next) => {
  const { listId, cardId, title, description} = req.body;
  const organizationId = req.params.orgid;

  let organization;
  try{
    organization= await Organization.findById(organizationId);
  }catch(err){
    const error = new HttpError('Failed to find organization, please try again',500);
    return next(error);
  }

  if (organization.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to edit this list!',401);
    return next(error);
  }
  try {
    const list = organization.details.find((list) => list.id.toString() === listId.toString());
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
    await organization.save();
  } catch (err) {
    const error = new HttpError('Failed to edit card, please try again', 500);
    return next(error);
  }

  res.status(200).json({ entity: organization.toObject({getters:true}) });
};
const deleteOrganizationList = async (req, res, next)=>{
  const { listId} = req.body;
  const organizationId = req.params.orgid;

  let organization;
  try{
    organization= await Organization.findById(organizationId);
  }catch(err){
    const error = new HttpError('Failed to find organization, please try again',500);
    return next(error);
  }

  if (organization.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to delete this list!',401);
    return next(error);
  }
  try {
    const list = organization.details.find((list) => list.id.toString() === listId.toString());
    if (!list) {
      const error = new HttpError('List not found', 404);
      return next(error);
    }
    organization.details.pull(list);
    await organization.save();
  } catch (err) {
    const error = new HttpError('Failed to delete list, please try again', 500);
    return next(error);
  }

  res.status(200).json({ entity: organization.toObject({getters:true}) });
};
const deleteOrganizationCard = async (req, res, next) => {
  const { listId, cardId} = req.body;
  const organizationId = req.params.orgid;

  let organization;
  try{
    organization= await Organization.findById(organizationId);
  }catch(err){
    const error = new HttpError('Failed to find organization, please try again',500);
    return next(error);
  }

  if (organization.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to edit this list!',401);
    return next(error);
  }
  try {
    const list = organization.details.find((list) => list.id.toString() === listId.toString());
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
    await organization.save();
  } catch (err) {
    const error = new HttpError('Failed to delete card, please try again', 500);
    return next(error);
  }

  res.status(200).json({ entity: organization.toObject({getters:true}) });
};
const deleteOrganization = async (req, res, next) => {
  const organizationId = req.params.orgid;

  let organization;
  try{
    organization= await Organization.findById(organizationId).populate('creator');
  }catch(err){
    const error = new HttpError('Failed to delete organization, please try again',500);
    return next(error);
  }
   if  (!organization){
    const error = new HttpError('Could not find organization with this ID.', 404);
    return next(error); 
   }

   if (organization.creator.id !== req.userData.userId){
    const error = new HttpError('You are not allowed to delete this organization!',401);
    return next(error);
  }

   const imagePath = organization.image;

  try{
    const sess=await mongoose.startSession();
    sess.startTransaction();
    await organization.deleteOne({session:sess});
    organization.creator.organizations.pull(organization);
    await organization.creator.save({session: sess});
    await sess.commitTransaction();
  }catch(err){
    const error = new HttpError('Failed to delete organization, please try again',500);
    return next(error);
  }
  fs.unlink(imagePath, err =>{
    console.log(err);
  });

  res.status(200).json({ message: 'Deleted organization.' });
};
const updateOrganizationListOrder = async (req, res, next) => {
  const { listIds} = req.body;
  const organizationId = req.params.orgid;
  let organization;
  try{
    organization= await Organization.findById(organizationId);
  }catch(err){
    const error = new HttpError('Failed to find organization, please try again',500);
    return next(error);
  }

  if (organization.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to edit these details!',401);
    return next(error);
  }
  
 
  try {
    organization.details = listIds.map((listId) => organization.details.find((list) => list.id.toString() === listId.toString()));
    await organization.save();
  } catch (err) {
    const error = new HttpError('Failed to update list order, please try again', 500);
    return next(error);
  }

  res.status(200).json({ entity: organization.toObject({getters:true}) });
};
const updateOrganizationCardOrder = async (req, res, next) => {
  const {listId, cardIds} = req.body;
  const organizationId = req.params.orgid;
  let organization;
  try{
    organization= await Organization.findById(organizationId);
  }catch(err){
    const error = new HttpError('Failed to find organization, please try again',500);
    return next(error);
  }

  if (organization.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to edit this list!',401);
    return next(error);
  }
  try {
    const list = organization.details.find((list) => list.id.toString() === listId.toString());
    if (!list) {
      const error = new HttpError('List not found', 404);
      return next(error);
    }
    list.items = cardIds.map((cardId) => list.items.find((card) => card.id.toString() === cardId.toString()));
    await organization.save();
  } catch (err) {
    const error = new HttpError('Failed to update card order, please try again', 500);
    return next(error);
  }

  res.status(200).json({ entity: organization.toObject({getters:true}) });
};

exports.getOrganizationById = getOrganizationById;
exports.getOrganizationsByUserId = getOrganizationsByUserId;
exports.createOrganization = createOrganization;
exports.updateOrganization = updateOrganization;
exports.deleteOrganization = deleteOrganization;
exports.addOrganizationList = addOrganizationList;
exports.addOrganizationCard=addOrganizationCard;
exports.updateOrganizationList=updateOrganizationList;
exports.deleteOrganizationList=deleteOrganizationList;
exports.updateOrganizationCard=updateOrganizationCard;
exports.deleteOrganizationCard=deleteOrganizationCard;
exports.updateOrganizationListOrder=updateOrganizationListOrder;
exports.updateOrganizationCardOrder=updateOrganizationCardOrder;