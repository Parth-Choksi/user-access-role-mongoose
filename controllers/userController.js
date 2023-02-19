const userModel = require("../models/user");
const roleModel = require("../models/role");
const mongoose = require('mongoose');
const { findOne } = require("../models/user");

async function getUserList(req,res) {
    try {
        let page = (req.query.page !== undefined && req.query.page !== '') ? parseInt(req.query.page) : 1;
        let perPage = (req.query.limit !== undefined && req.query.limit !== '') ? parseInt(req.query.limit) : 10;
        let start = parseInt(page * perPage) - perPage;

        const query = {
            'role.role':{$nin:['Admin']},
            $and :[]
        }
        if(req.query.search) {
            const search = req.query.search.trim();
            query.$and.push({
                $or:[
                    {
                        first_name: {
                            $regex: new RegExp(search, 'i'),
                        },
                    },
                    {
                        last_name: {
                            $regex: new RegExp(search, 'i'),
                        },
                    },
                ]
            })
        }

        if (!query.$and || query.$and.length === 0) {
            delete query.$and;
        }

        const result = await userModel.aggregate([
            { 
                $lookup:{ 
                    from: "RoleDetails",localField:"role",foreignField:"_id",as:"role"},
                
            },
            {
                $match:query
            },
            {
                $project:{
                    password:0,
                    __v:0,
                    created_date:0,
                    "role._id" :0,
                    "role.role_id" :0,
                    "role.active" :0,
                    "role.created_date" :0,
                }
            },
            {
                $skip: start
            },
            {
                $limit: perPage
            }
        ])
        if(!result) {
            return res.status(500).json({ status: "error", message: "There is some error while fetching user details"});    
        }
        return res.status(200).json({ status: "success", message: "User Details found successfully", data: result});
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: "error", message: error.message });
    }
}

async function updateUserAccessModule(req,res) {
    try {
        if(!req.body.role || (req.body.role && req.body.role.trim()== "")) {
            return res.status(422).json({ status: "error", message: "Role is required" });
        }
        if(!req.body.access_modules || (req.body.access_modules && req.body.access_modules.length== 0)) {
            return res.status(422).json({ status: "error", message: "Access Module is required" });
        }
        
        roleModel.findOneAndUpdate({role:req.body.role},{$addToSet:{access_modules:{$each:req.body.access_modules}},updated_date:Date.now()},{new:true},function(err,result){
            if(err){
                return res.status(500).json({ status: "error", message: err });
            }
            return res.status(200).json({ status: "success", message: "Access Module updated successfully", data: result });
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: "error", message: error.message });
    }
}

async function removeUserAccessModuleValue(req,res) {
    try {
        if(!req.body.role || (req.body.role && req.body.role.trim()== "")) {
            return res.status(422).json({ status: "error", message: "Role is required" });
        }
        if(!req.body.access_modules || (req.body.access_modules && req.body.access_modules.trim()== "")) {
            return res.status(422).json({ status: "error", message: "Access Module is required" });
        }
        
        roleModel.findOneAndUpdate({role:req.body.role},{$pull:{access_modules:req.body.access_modules},updated_date:Date.now()},{new:true},function(err,result){
            if(err){
                return res.status(500).json({ status: "error", message: err });
            }
            return res.status(200).json({ status: "success", message: "Value removed from access module successfully", data: result });
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: "error", message: error.message });
    }
}

async function updateAllUsersData(req,res) {
    try {
        let data = {}
        let roleData;
        if(req.body.role && req.body.role.trim()!=""){
            roleData = await roleModel.findOne({role:req.body.role}).select("_id").lean();
            if(!roleData){
                return res.status(500).json({ status: "error", message: "No role exist" });
            }
        }
        if(req.body.first_name && req.body.first_name.trim()!=""){
            data.first_name = req.body.first_name
        }
        if(req.body.last_name && req.body.last_name.trim()!=""){
            data.last_name = req.body.last_name
        }
        if(req.body.company_address && req.body.company_address.trim()!=""){
            data.company_address = req.body.company_address
        }
        userModel.updateMany({role:roleData._id},{$set:data,updated_date:Date.now()},{new:true},function(err,result){
            if(err){
                return res.status(500).json({ status: "error", message: err });
            }
            return res.status(200).json({ status: "success", message: "All users detail updated successfully", data: result });
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: "error", message: error.message });
    }
}

async function updateManyUsersDifferentData(req,res) {
    try {
        if(!req.body.users && (req.body.users && req.body.users.length == 0)) {
            return res.status(422).json({ status: "error", message: "Users array with details required to update." });
        }

        const usersToUpdate = req.body.users;
        const userOperations = [];
        const roleOperations = []

        usersToUpdate.map(user => {
            let role_id;
            const userUpdateObj = {}
            const roleUpdateObj = {}
            const userUpdatedFields = Object.entries(user.updateFields)
            for (const [key, value] of userUpdatedFields) {
                if(key == "access_modules"){
                    role_id = user.role
                    roleUpdateObj[key] = value
                }else {
                    userUpdateObj[key] = value
                }
            }
            if(role_id) {
                roleOperations.push({
                    updateOne:{
                        filter:{_id: mongoose.Types.ObjectId(role_id)},
                        update:{
                            $addToSet: roleUpdateObj
                        }
                    }
                })
            }
            else {
                userOperations.push({
                    updateOne:{
                        filter:{_id: user.user_id},
                        update:{$set:userUpdateObj}
                    }
                });
            }
        })
        const options = { ordered: false, w: 1 };

        roleModel.bulkWrite(roleOperations, options, (err, result) => {
            console.log('err',err)
            console.log(result);
          });
         
        userModel.bulkWrite(userOperations, options, (err, result) => {
            console.log('err',err)
            console.log(result);
          });
          return res.status(200).json({ status: "success", message: 'Data updated successfully' });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: "error", message: error.message });
    }
}

async function checkUserAccessModule(req,res) {
    try {
        if(!req.body.user_id || (req.body.user_id && req.body.user_id.trim()== "")) {
            return res.status(422).json({ status: "error", message: "User Id is required" });
        }
        if(!req.body.access_module || (req.body.access_module && req.body.access_module.trim()== "")) {
            return res.status(422).json({ status: "error", message: "Access Module is required" });
        }

        const getUserData = await userModel.aggregate([
            {
                $match:{
                    _id: mongoose.Types.ObjectId(req.body.user_id)
                }
            },
            { 
                $lookup:{ from: "RoleDetails",localField:"role",foreignField:"_id",as:"role"},
            },
            { "$unwind": { "path": "$role", "preserveNullAndEmptyArrays": true } },
            {
                $match:{
                    'role.access_modules':{$in:[req.body.access_module]},
                }
            },
            {
                $project: {
                  has_access: { $in: [req.body.access_module, "$role.access_modules"] }
                }
            },
        ]) 

        let user_has_access = false
        if(getUserData && getUserData.length > 0 && getUserData[0].has_access){
            user_has_access = true
        }
        return res.status(200).json({ status: "success", message: "", data: {user_has_access}})
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: "error", message: error.message });
    }
}



module.exports = {
    getUserList,
    updateUserAccessModule,
    removeUserAccessModuleValue,
    updateAllUsersData,
    updateManyUsersDifferentData,
    checkUserAccessModule
}