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

exports.verifyAdminOrStudent = (req, res, next) => {
  if (req.user.role === "Student" || req.user.role === "Admin") {
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

//google auth
var googleStrategy = require("passport-google-oauth2").Strategy;

exports.googlePassport = passport.use(
  new googleStrategy(
    {
      clientID: config.web.client_id,
      clientSecret: config.web.client_secret,
      callbackURL: config.web.redirect_uris,
      passReqToCallback: true,
    },
    (request, accesstoken, refreshToken, profile, done) => {
      User.findOne({ googleId: profile.id })
        .then((user) => {
          if (user) {
            return done(null, user);
          } else {
            user = new User({ username: profile.displayName });
            user.googleId = profile.id;
            user.email = profile.emails[0].value;
            user.fullname = profile.displayName;
            user.avatar = profile.picture;
            user.role = "Student";
            user.save().then((user) => {
              return done(null, user);
            });
          }
        })
        .catch((err) => {
          return done(err, false);
        });
    }
  )
);
