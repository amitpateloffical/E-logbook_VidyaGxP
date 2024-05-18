const User = require("../models/users");
const Role = require("../models/roles");
const Site = require("../models/sites");
const Process = require("../models/processes");
const roleGroup = require("../models/roleGroups");
const config = require("../config/config.json");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//register user
exports.signup = async (req, res) => {
  if (req.body.password === "" || undefined) {
    res.status(400).json({
      error: true,
      message: "Please provide a password!",
    });
  } else {
    let salt = await bcrypt.genSalt(10);
    let hashpass = await bcrypt.hash(req.body.password, salt);
    User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashpass,
      age: req.body.age,
      gender: req.body.gender,
    })
      .then(() => {
        res.status(200).json({
          error: false,
          message: "User Registered",
        });
      })
      .catch((e) => {
        res.status(400).json({
          error: true,
          message: `Couldn't register User. "  + ${e}`,
        });
      });
  }
};

//Update user
exports.editUser = async (req, res) => {
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      error: true,
      message: 'Please provide details to update!',
    });
  }
  let userdetails = {
    name: req.body.name,
    email: req.body.email,
    age: req.body.age,
    gender: req.body.gender,
  };
  User.update(userdetails, {
    where: {
      user_id: req.params.id,
    },
  })
    .then(() => {
      res.json({
        error: false,
        message: "User Details Updated!!",
      });
    })
    .catch((err) => {
      res.status(400).json({
        error: true,
        message: err.message,
      });
    });
};

// delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findOne({ where: { user_id: req.params.id } });
    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }
    await User.destroy({ where: { user_id: req.params.id } });
    res.json({
      error: false,
      message: "User deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: err.message,
    });
  }
};

// user login
exports.Userlogin = async (req, res) => {
  const { email, password } = req.body;
  User.findOne({
    where: {
      email: email,
    },
    raw: true,
  })
    .then((data) => {
      bcrypt.compare(password, data.password, (_err, result) => {
        if (!result) {
          res.status(400).json({
            error: true,
            message: "Invalid Password!",
          });
        } else {
          const token = jwt.sign(
            { userId: data.user_id },
            config.development.JWT_SECRET,
            { expiresIn: "24h" }
          );
          if (token) {
            res.status(200).json({
              error: false,
              token: token,
            });
          } else {
            res.status(400).json({
              error: true,
              message: "Some unknown error",
            });
          }
        }
      });
    })
    .catch((e) => {
      res.status(401).json({
        error: false,
        message: "Couldn't find User!",
      });
    });
};

exports.Adminlogin = async (req, res) => {
  const { email, password } = req.body;
  if (email !== "admin@vidyagxp.com") {
    res.status(401).json({
      error: false,
      message: "Couldn't find User!",
    });
  } else {
    if (password !== "Amit@121") {
      res.status(400).json({
        error: false,
        message: "Incorrect Password!",
      });
    } else {
      const token = jwt.sign(
        { user: "Admin" },
        config.development.JWT_ADMIN_SECRET,
        {
          expiresIn: "24h",
        }
      );
      if (token) {
        res.status(200).json({
          error: false,
          token: token,
        });
      } else {
        res.status(400).json({
          error: true,
          message: "Some unknown error",
        });
      }
    }
  }
};