const express = require("express");

const router = express.Router();

router.get("/test", (req, res) => res.json({ msg: "This is the users route"}));

const bcrypt = require("bcryptjs");
const User = require("../../models/User");

const jsonwebtoken = require("jsonwebtoken");

const keys = require("../../config/keys");

router.post("/register", (req, res) => {

  const { errors, isValid} = validateRegisterInput(req.body);

  if(!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ name: req.body.name })
    .then( user => {
      if( user ){
        errors.name = "User already exists";
        return res.status(400).json(errors);
      } else {
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err) throw err;
            newUser.password = hash;
            newUser.save()
              .then(user => {
                const payload = { id: user.id, name: user.name};

                jsonwebtoken.sign(
                  payload,
                  keys.secret0rKey,
                  { expiresIn: 3600 },
                  (err, token) => {
                    res.json({
                      success: true,
                      token: "Bearer " + token
                    });
                  }
                );
              })
              .catch( err => console.log(err));
          });
        });
      }
    });
});

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email })
    .then( user => {
      if(!user) {
        return res.status(400).json({ password: "This user does not exist"});
      }

      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if(isMatch) {

            const payload = {id: user.id, name: user.name};

            jsonwebtoken.sign(
              payload,
              keys.secret0rKey,
              {expiresIn: 3600},
              (err, token) => {
                res.json({
                  success: true,
                  token: "Bearer " + token
                });
              }
            );
            
          } else { 
            return res.status(400).json({ password: "Incorrect Password"});
          }
        });
    });
});

module.exports = router;