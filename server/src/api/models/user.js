const { Schema, model } = require("mongoose");
const validator = require('validator')
const bcrypt = require("bcryptjs");
const moment = require("moment");

const { USER_ROLES, USER_TYPES, DEFAULT_IMAGE, INVALID_CREDENTIALS, BAD_REQUEST, EMAIL_NOT_FOUND, STATUSES, NOT_FOUND } = require("../../utils/constants");
const { saltRound, jwtExpirationInterval, jwtSecret } = require("../../config/env-vars");
const APIError = require("../../utils/APIError");
const Utilities = require("../../utils/util");
const Jwt = require("jsonwebtoken");

const UserModel = new Schema(
  {
    first_name: {
      type: String,
      required: [true, "Please enter your first name!"],
      trim: true,
      minlength: 2,
      maxlength: 126
    },
    last_name: {
      type: String,
      required: [true, "Please enter your last name!"],
      trim: true,
      minlength: 2,
      maxlength: 126
    },
    email: {
      emailId: {
        type: String,
        // required: [true, 'Please provide your email'],
        unique: true,
        sparse: true,
        lowercase: true,
        // validate: [validator.isEmail, 'Please provide a valid email']
      },
      isVerified: {
        type: Boolean,
        default: false
      }
    },
    phone_no: {
      ccode: {
        type: String,
        default: "+91",
        trim: true
      },
      mobile: {
        type: String,
        trim: true,
        unique: true
      },
      isVerified: {
        type: Boolean,
        default: false
      }
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6
    },
    regAddress: {
      line1: {
        type: String,
        trim: true,
        required: true
      },
      line2: {
        type: String,
        trim: true
      },
      pincode: {
        type: Number,
        trim: true,
        required: true
      },
      cityId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "city"
      },
      stateId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "state"
      },
      countryId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "country"
      }
    },
    role: {
      type: String,
      enum: {
        values: USER_ROLES,
        message: "User status is either: user or admin"
      },
      lowercase: true,
      default: "user"
    },
    city: [{
      type: Schema.Types.ObjectId,
      ref: "city",
      required: [true, 'Please assign city to user'],
    }],
    bussinessEntityId: {
      type: Schema.Types.ObjectId,
      ref: "bussinessEntity",
      required: [true, 'Please assign Bussiness Entity to user'],
    },
    type: {
      type: String,
      enum: {
        values: USER_TYPES,
        message: "User type is either: dispatcher, accountuser, saleperson, others, or admin"
      },
      lowercase: true,
      default: "others"
    },
    subType: {
      type: Schema.Types.ObjectId,
      ref: "salepersonmaster"
    },
    higherAuthorityId: {
      type: Schema.Types.ObjectId,
      ref: "user"
    },
    incentivesList: [{
      type: Schema.Types.ObjectId,
      ref: "incentives"
    }],
    assignedParties: [{
      type: Schema.Types.ObjectId,
      ref: "channelpartner"
    }],
    ctc: {
      type: Number,
      trim: true
    },
    target: {
      startDate: { type: Date },
      assignedTarget: [{
        month: { type: String, lowercase: true, trim: true },
        year: { type: Number },
        amount: { type: Number }
      }]
    },
    avatar: {
      type: String,
      default: DEFAULT_IMAGE
    },
    otp: {
      type: [
        {
          code: {
            type: Number,
            trim: true
          },
          sentTo: {
            type: String,
            trim: true
          },
          expireAt: {
            type: Date,
            default: () => Date.now() + 300000
          }
        },
      ],
      select: false
    },
    status: {
      type: String,
      enum: {
        values: STATUSES,
        message: "User status is either: active, deactive, or blocked"
      },
      lowercase: true,
      default: "active"
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const utils = new Utilities();

UserModel.statics = {
  async ValidateUserAndGenerateToken(options, populate) {
    const { username, password } = options;
    var condition = {};
    if (utils.validateEmail(username)) {
      condition = { "email.emailId": username };
    } else {
      condition = { "phone_no.mobile": username };
    }
    const user = await this.findOne(condition)
      .populate(populate)
      .exec();
    if (!user) {
      throw new APIError({
        message: EMAIL_NOT_FOUND,
        status: NOT_FOUND
      });
    }
    if (!(await user.matchPassword(password))) {
      throw new APIError({
        message: INVALID_CREDENTIALS,
        status: BAD_REQUEST
      });
    }
    return user.transform();
  },
  elevated() {
    return ["password", "__v", "otp"];
  },
  searchables() {
    return ["first_name", "last_name", "email.emailId", "phone_no.mobile", "status", "role", "type", "subType"];
  }
};

UserModel.pre("save", async function save(next) {
  try {
    if (!this.isModified("password")) return next();
    const hash = await bcrypt.hash(this.password, Number(saltRound));
    this.password = hash;

    this.first_name ? (this.first_name = await utils.capital_letter(this.first_name)) : this.first_name;
    this.last_name ? (this.last_name = await utils.capital_letter(this.last_name)) : this.last_name;

    return next();
  } catch (err) {
    return next(err);
  }
});


UserModel.virtual('fullName').get(function () {
  return this.first_name + " " + this.last_name;
});

UserModel.method({
  transform() {
    var res = utils.omitter(UserModel.statics.elevated(), this._doc);
    res.token = this.token();
    res.fb_token = null;
    res.google_token = null;
    res.fullName = this.first_name + " " + this.last_name;
    return res;
  },
  token() {
    const payload = {
      exp: moment()
        .add(jwtExpirationInterval, "minutes")
        .unix(),
      iat: moment().unix(),
      sub: this._id,
      status: this.status
    };
    return Jwt.sign(payload, jwtSecret);
  },
  async matchPassword(password) {
    return bcrypt.compare(password, this.password);
  }
});

module.exports = model("user", UserModel);
