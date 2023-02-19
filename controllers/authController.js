const userModel = require('../models/user');
const roleModel = require('../models/role');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const JWT_SECRET=process.env.JWT_SECRET;

async function registerUser(req,res) {
    let role = "Employee";
    // validate all the fields
    if(!req.body.first_name && req.body.first_name.trim() == ""){
        return res.status(422).json({ status: "error", message: "FirstName is required." });
    }
    if(!req.body.last_name && req.body.last_name.trim() == ""){
        return res.status(422).json({ status: "error", message: "LastName is required." });
    }
    if(!req.body.email && req.body.email.trim() == ""){
        return res.status(422).json({ status: "error", message: "Email is required." });
    }
    if(!req.body.password && req.body.password.trim() == ""){
        return res.status(422).json({ status: "error", message: "Password is required." });
    }
    if(!req.body.contact_no && req.body.contact_no.trim() == ""){
        return res.status(422).json({ status: "error", message: "ContactNo is required." });
    }
    if(req.body.role && req.body.role.trim() != "") {
        role = req.body.role
    }

    // check role exist or not if exist then store role id into user collection
    const roleData = await roleModel.findOne({role: role}).select("_id role_id role").lean();

    if(!roleData){
        return res.status(500).json({ status: "error", message: "No role exist with this name." });
    }

    const password = await bcrypt.hash(req.body.password,10)

    const user = new userModel({
        first_name:req.body.first_name,
        last_name:req.body.last_name,
        email:req.body.email,
        password:password,
        role: roleData._id,
        contact_no:req.body.contact_no,
    })

    user.save().then(result => {
        return res.status(200).json({ status: "success", message: "User created successfully.", data: result });
    })
    .catch(err => {
        return res.status(500).json({ status: "error", message: err.message });
    })
}

async function loginUser(req,res) {
    if(!req.body.email && req.body.email.trim() == ""){
        return res.status(422).json({ status: "error", message: "Email is required." });
    }
    if(!req.body.password && req.body.password.trim() == ""){
        return res.status(422).json({ status: "error", message: "Password is required." });
    }

    const response = await verifyUserData(req.body.email,req.body.password);
    if(response.status != "success") {
        return res.status(500).json({ status: response.status, message: response.message });
    }
    const token = response.data.token
    const roleData = await roleModel.findOne({_id:response.data.user.role}).select("_id role").lean();
    let user = {
        email: response.data.user.email
    }
    return res.status(200).json({ status: "success", message: "Login Successfully", data:{user:{...user,role:roleData.role,token}} });    

}

async function verifyUserData(email,password) {
    try {
        const user = await userModel.findOne({email:email}).select("_id email password role").lean();
        if(!user) {
            return { status: "error", message: "User not found." };
        }
        if(await bcrypt.compare(password,user.password)) {
            token = jwt.sign({id:user._id,first_name:user.first_name},JWT_SECRET,{expiresIn:'2h'});
            return { status: "success", message: "Token generated successfully", data: {user:user,token:token }};
        }
        return { status: "error", message: "Invalid password please try again."};
    } catch (error) {
        console.log(error)
        return { status: "error", message: error.message };   
    }
}


module.exports = {
    registerUser,
    loginUser
}