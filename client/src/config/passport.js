const { Strategy, ExtractJwt } = require("passport-jwt");
const User = require("../api/models/user");
const ChannelPartner = require("../api/models/channelPartner");
const BUssinessEntity = require("../api/models/bussinessEntity");
const { jwtSecret } = require("./env-vars");

const JwtOptions = {
  secretOrKey: jwtSecret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("Bearer")
};

const JWT = async (payload, done) => {
  try {
    var condition = {
      $and: [
        {
          _id: payload.sub
        },
        {
          status: payload.status
        }
      ]
    };
    const user = await User.findOne(condition);
    const channelPartner = await ChannelPartner.findOne(condition);
    const bussinessEntity = await BUssinessEntity.findOne(condition);
    if (user) {
      return done(null, user);
    }
    if (channelPartner) {
      return done(null, channelPartner);
    }
    if (bussinessEntity) {
      return done(null, bussinessEntity);
    }
    return done(null, false);
  } catch (err) {
    return done(err, false);
  }
};

exports.Jwt = new Strategy(JwtOptions, JWT);
