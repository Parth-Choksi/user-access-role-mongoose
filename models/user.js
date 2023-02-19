const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const isEmail = require('validator').isEmail;

let userDetail = new Schema({
    first_name:{ type: String},
    last_name:{ type: String},
    email:{
        type: String, unique: [true, "email already exists"], required: [true, "email is required."], validate: {
            validator: isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password:{ type: String},
    role: { type : Schema.Types.ObjectId, ref: 'RoleDetails' },
    contact_no:{ type: String},
    company_address: {type: String},
    created_date: { type: Date, default: Date.now },
    updated_date: Date,
},{collection : 'userDetail'})

module.exports = mongoose.model('userDetail',userDetail)