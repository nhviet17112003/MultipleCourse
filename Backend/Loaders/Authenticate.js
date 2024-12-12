const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../Models/Users");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken");
const config = require("../Configurations/Config");

// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

exports.getToken = (user) => {
  return jwt.sign(user, config.secretKey, { expiresIn: 3600 });
};

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    console.log("JWT payload: ", jwt_payload);
    try {
      const user = await User.findOne({ _id: jwt_payload._id });
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);

exports.verifyUser = passport.authenticate("jwt", { session: false });

exports.verifyAdmin = (req, res, next) => {
  if (req.user.role === "Admin") {
    return next();
  } else {
    res.statusCode = 403;
    res.setHeader("Content-Type", "application/json");
    res.end("You are not authorized to perform this operation!1");
  }
};

exports.verifyTutor = (req, res, next) => {
  if (req.user.role === "Tutor") {
    return next();
  } else {
    res.statusCode = 403;
    res.setHeader("Content-Type", "application/json");
    res.end("You are not authorized to perform this operation!");
  }
};

exports.verifyAdminOrTutor = (req, res, next) => {
  if (req.user.role === "Tutor" || req.user.role === "Admin") {
    return next();
  } else {
    res.statusCode = 403;
    res.setHeader("Content-Type", "application/json");
    res.end("You are not authorized to perform this operation!");
  }
};
