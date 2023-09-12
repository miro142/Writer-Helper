const { validationResult } = require('express-validator');

const bcrypt =require('bcryptjs');
const HttpError = require('../models/http-error');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const getUsers = async (req, res, next) => {
  let users;
  try{
   users = await User.find({},'-password' );
  } catch(err){
    const error = new HttpError('Could not fetch users, please try again',500);
    return next (error);
  }
  res.json({users: users.map(user=>user.toObject({getters:true}))});
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next( new HttpError('Invalid inputs passed, please check your data.', 422));
  }
  const { name, email, password } = req.body;
  let existingUser;
  try{
   existingUser= await User.findOne({email:email})
  } catch(err)
    {
      const error= new HttpError('Failed to sign up, please try again',500);
      return next(error);
    }
    if (existingUser){
      const error=new HttpError('User with this email already exists!',422);
      return next(error);
    }
  let hashedPassword;
  try{
  hashedPassword =await bcrypt.hash(password, 12);
  } catch(err){
    const error = new HttpError('Could not create user, please try again', 500);
    return next (error);
  }

  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places:[]
  });

  try{
  await createdUser.save();
  } catch(err){
    const error=new HttpError('Failed to sign up, please try again',500);
    return next(error);
  }
  let token;
  try{
  token = await jwt.sign({userId: createdUser.id, email: createdUser.email}, 'wqyeghjrqwp',{expiresIn: '1h'});
  }catch(err){
    const error=new HttpError('Failed to sign up, please try again',500);
    return next(error);
  }  
  res.status(201).json({userId: createdUser.id, enail: createdUser.email, token:token});
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let identifiedUser;
  try{
   identifiedUser= await User.findOne({email:email})
  } catch(err)
    {
      const error= new HttpError('Failed to log in, please try again',500);
      return next(error);
    }
  if (!identifiedUser ) {
    return next(new HttpError('Could not identify user, credentials seem to be wrong.', 403));
  }
  let isValidPass=false;
  try{
  isValidPass= await bcrypt.compare(password, identifiedUser.password);
  }catch(err){
    const error= new HttpError('Failed to log in, please try again',500);
  }
  if(!isValidPass){
    return next(new HttpError('Could not identify user, credentials seem to be wrong.', 403));
  }
  let token;
  try{
  token = await jwt.sign({userId: identifiedUser.id, email: identifiedUser.email}, 'wqyeghjrqwp');
  }catch(err){
    const error=new HttpError('Failed to log in, please try again',500);
    return next(error);
  }  
  res.json({userId: identifiedUser.id, enail: identifiedUser.email, token:token});
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
