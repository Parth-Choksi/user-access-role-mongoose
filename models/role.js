const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let rolesDetail = new Schema({
    role: {type :String}, // roles : Employee, Admin, Manager
    role_id : {type : Number},
    access_modules: [String],
    active : {Boolean},
    created_date: { type: Date, default: Date.now },
    updated_date: Date,
},{collection : 'RoleDetails'})

module.exports = mongoose.model('RoleDetails',rolesDetail)