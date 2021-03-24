const router = require("express").Router();
const { checkUsernameExists, validateRoleName } = require('./auth-middleware');
const { JWT_SECRET } = require("../secrets"); // use this secret!
const { default: jwtDecode } = require("jwt-decode");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs")

const Users = require("../users/users-model")
const {isValid} = require("../users/users-service.js");


router.post("/register", (req, res,) => { //try using validateRoleName MW
  const credentials = req.body

  if (isValid(credentials)) {
    const rounds = process.env.BCRYPT_ROUNDS || 8;

    const hash = bcryptjs.hashSync(credentials.password, rounds);

    credentials.password = hash;

    Users.add(credentials)
    .then(user => {
      res.status(201).json({data: user});
    })
    .catch(error => {
      res.status(500).json({message: error.message});
    })
  }else{
    res.status(400).json({
      message: "please provide a username and password"
    })
  }
  /**
    [POST] /api/auth/register { "username": "anna", "password": "1234", "role_name": "angel" }

    response:
    status 201
    {
      "user"_id: 3,
      "username": "anna",
      "role_name": "angel"
    }
   */
});


router.post("/login", checkUsernameExists, (req, res, next) => {
  /**
    [POST] /api/auth/login { "username": "sue", "password": "1234" }

    response:
    status 200
    {
      "message": "sue is back!",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ETC.ETC"
    }

    The token must expire in one day, and must provide the following information
    in its payload:

    {
      "subject"  : 1       // the user_id of the authenticated user
      "username" : "bob"   // the username of the authenticated user
      "role_name": "admin" // the role of the authenticated user
    }
   */
});

function buildToken(user) {
  const payload = {
    subject: users.user_id,
    username: users.username,
    role: users.role_name
  }
   const config = {
     expiresIn: '1d',
   }
   return jwt.sign(
     payload,JWT_SECRET,config 
   )
}

module.exports = router;
