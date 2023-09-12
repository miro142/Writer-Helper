const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const fs = require ('fs');
const HttpError = require('../models/http-error');
const Web=require('../models/relationshipWeb');
const User = require('../models/user');

const createWeb = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new HttpError('Invalid inputs passed, please check your data.', 422)
      );
    }
    const data = req.body;
    const createdWeb = new Web( {
        data,
        creator: req.userData.userId,
    });
  
    let user;
    try{
      user= await User.findById(req.userData.userId);
      } catch(err){ 
        const error =new HttpError('Failed to save relationship web, please try again',500);
        return next(error);
      }
  
      if(!user){
        const error= new HttpError('Could not find specified user',404);
        return next(error);
      }
  
    try{
      await createdWeb.save();
    } catch(err){ 
      const error =new HttpError(err.message,500);
      return next(error);
    }
    res.status(201).json({ relationshipWeb: createdWeb });
  };
const getWebByCreator = async (req, res, next) => {
  const creator = req.params.uid;
    let web;
    try{
      web = await Web.findOne({creator: creator});
    }catch(err){
      const error = new HttpError('Failed to get relationship web, please try again',500);
      return next(error);
    }

  if (!web) {
    res.json(false);
    return;
  }
  res.json({ web: web.toObject({getters:true}) });
};
const updateWeb = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }
  const creator = req.params.uid;
  const data= req.body;

  let web;
  try{
    web = await Web.findOne({creator: creator});
  }catch(err){
    const error = new HttpError('Failed to save relationship web, please try again',500);
    return next(error);
  }

  if (web.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to edit this relationship web!',401);
    return next(error);
  }

  web.data = data;

  try{
    await web.save();
  }catch(err){
    const error = new HttpError('Failed to update web, please try again',500);
    return next(error);
  }

  res.status(200).json({ web: web.toObject({getters:true}) });
};

  exports.createWeb = createWeb;
  exports.getWebByCreator= getWebByCreator;
  exports.updateWeb =updateWeb;