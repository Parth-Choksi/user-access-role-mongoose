const express = require('express');
let router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const Auth = require('../configs/auth');

router.post('/register',authController.registerUser);
router.post('/login',authController.loginUser);

// user list api
router.get('/user/list/admin/api',[Auth.auth, Auth.isAdmin],userController.getUserList);

// update access module
router.put('/update/access-module',[Auth.auth, Auth.isAdmin, ],userController.updateUserAccessModule);

// remove value from access module
router.put('/delete/access-module/value',[Auth.auth, Auth.isAdmin],userController.removeUserAccessModuleValue);

// update all user value
router.put('/update/all/users/data',[Auth.auth, Auth.isAdmin],userController.updateAllUsersData);

// update many user different value
router.put('/update/user-details',[Auth.auth, Auth.isAdmin],userController.updateManyUsersDifferentData);

// check user has access to module or not.
router.get('/check/user/access',[Auth.auth],userController.checkUserAccessModule)
module.exports = router