const fs = require('fs');
const path = require('path');
const express =require('express');
const bodyParser =require('body-parser');
const placeRoutes=require('./routes/places-routes');
const characterRoutes=require('./routes/characters-routes');
const organizationRoutes=require('./routes/organizations-routes');
const objectRoutes=require('./routes/objects-routes');
const userRoutes=require('./routes/users-routes');
const relationsRoutes = require('./routes/relationship-web-routes')
const HttpError = require('./models/http-error');
const mongoose = require('mongoose');

const server =express();

server.use(bodyParser.json());

server.use('/uploads/images', express.static(path.join('uploads', 'images')));

server.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  
    next();
});

server.use('/api/characters',characterRoutes);
server.use('/api/places',placeRoutes);
server.use('/api/organizations',organizationRoutes);
server.use('/api/objects',objectRoutes);
server.use('/api/users',userRoutes);
server.use('/api/relations',relationsRoutes)

server.use((req,res,next)=>{
    const error= new HttpError('404, not found', 404);
    throw error;
});

server.use((error, req,res, next)=>{
    if(req.file){
        fs.unlink(req.file.path, (err)=>{
            console.log(err);
        });
    }
    if(res.headerSent){
        return next(error);
    }
    res.status(error.code || 500)
    res.json({message: error.message || "Unknow error has occurred"})
});

mongoose.connect('mongodb+srv://megamirkat:GrgY69XVuCgFaypC@cluster0.kxvrtvl.mongodb.net/?retryWrites=true&w=majority')
.then(()=>{
    console.log("connected to mongodb");
    server.listen(5000);})
.catch((err)=>{console.log(err);});
