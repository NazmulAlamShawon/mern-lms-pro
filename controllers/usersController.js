const User = require('../models/UserModel')
const Note = require('../models/NoteModel')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

//@desc Get all users
// @route GET /users
// @access private

const getAllUsers = asyncHandler(async(req,res) => {
      const users = await User.find().select('-password').lean()
      if(!users?.length) {
        return res.status(404).json({message:'User not found'});
      } 
      res.json(users)


})

//@desc create users
// @route GET /users
// @access private

const createNewUser = asyncHandler(async(req,res) => {
     const {username,password,roles} = req.body;

     // confirm data
     if (!username||!password||!roles||!roles.length){
        return res.status(400).json({message:'all field are reqruired'})
     }

     //check for duplicate
      const duplicate = await User.findOne({username}).lean().exec()
      if(duplicate){
        return res.status(400).json({message:'duplicate usrename'})
      }

    //   hash password
    const hasdedPwd = await bcrypt.hash(password,10)   // salt round
     const userObject = {username, "password": hasdedPwd, roles}

    //  create and store new user
    const user = await User.create(userObject)
     if(user) {
        res.status(201).json({ message : ` New user ${username} created` })
     } else {
        res.status( 400 ).json({ message: 'Invalid user data'})
     }  


})


//@desc update users
// @route PATCH /users
// @access private

const updateUser = asyncHandler(async(req,res) => {
      const { id,username,roles,active,password} = req.body 

    //   confirm data
    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !==  'boolean') {
      return res.status(400).json({ message : 'all field are updated' });
    }

    const user = await User.findById(id).exec()

    if(!user){
        return res.status(404).json({ message: 'user not found' });
    }
    // check duplicate
    const duplicate = await User.findone({username}).lean().exec();
    // allow update uesr duplicate
    if(!duplicate && duplicate?._id.toString() !== id){
     return res.status(409).json({message:'duplicate user'});
    }
    user.username = username
    user.roles = roles
    user.active = active

    if(password) {
        // hash password
        user.password = await bcrypt.hash(password,10) // salt round

    }

    const updatedUser = await user.save()
    res.json({message : `${updatedUser.username} updated`})
})

//@desc Delete users
// @route DELETE /users
// @access private

const deleteUser = asyncHandler(async(req,res) => {
        const {id} =req.body
 
  if(!id) {
    return res.status(400).json({message: 'User id require'})
  }
const notes  = await Note.findOne({user :id}).lean().exec();
if (notes?.length ){
    return res.status(400).json({message: 'User has assign notes'})
}
 const user = await User.findById(id).exec();
 if(!user) {
    return res.status(400).json({message: 'User not found'});
 }
 const result = await user.deletOne()

 const reply = `Username  ${result.username} with ID ${result._id} deleted` 

 res.json(reply)
  
})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser

} 



