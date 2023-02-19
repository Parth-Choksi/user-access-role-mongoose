const jwt = require("jsonwebtoken");
const userModel = require('../models/user');
const roleModel = require('../models/role');
const { default: mongoose } = require("mongoose");

const JWT_SECRET=process.env.JWT_SECRET;
function auth(req, res, next) {
    try {
        const decoded = jwt.verify(req.headers.token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ status: "auth", message: "Auth fail"});
    }
};

function checkAuth(req, res, next) {
    try {
        const decoded = jwt.verify(req.headers.token, "secret");
        return res.status(200).json({ status: 'success', message: "Success", data:decoded });
    } catch (error) {
        return res.status(200).json({ status: 'error', message: "Auth fail"});
    }
};

isAdmin = (req, res, next) => {
    userModel.findById(mongoose.Types.ObjectId(req.user)).exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      roleModel.find(
        {
          _id: user.role 
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
  
          for (let i = 0; i < roles.length; i++) {
            if (roles[i].role === "Admin") {
              next();
              return;
            }
          }
  
          res.status(403).send({ message: "Require Admin Role!" });
          return;
        }
      );
    });
  };

isManager = (req, res, next) => {
    userModel.findById(mongoose.Types.ObjectId(req.user)).exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      roleModel.find(
        {
          _id: user.role 
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
  
          for (let i = 0; i < roles.length; i++) {
            if (roles[i].role === "Manager") {
              next();
              return;
            }
          }
  
          res.status(403).send({ message: "Require Admin Role!" });
          return;
        }
      );
    });
  };
module.exports = {
    auth,
    checkAuth,
    isAdmin,
    isManager
}