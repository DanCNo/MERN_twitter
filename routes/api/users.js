const express = require("express");

const router = express.Router();

router.get("/test", (req, res) => res.json({ msg: "This is the users route"}));

const bcrypt = require("bcryptjs");
const User = require("../../models/User");

router.post("/register", (req, res) => {

  User.findOne({ email: req.body.email })
    .then( user => {
      if( user ){
        return res.status(400).json({email: "A user has already registered with this address"});
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
              .then( user => res.json(user))
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
            res.json({ msg: "Success"});
          } else { 
            return res.status(400).json({ password: "Incorrect Password"});
          }
        });
    });
});

module.exports = router;