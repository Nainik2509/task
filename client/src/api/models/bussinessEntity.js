const { Schema, model } = require("mongoose");
const validator = require('validator')
const bcrypt = require("bcryptjs");
const moment = require("moment");

const { INVALID_CREDENTIALS, BAD_REQUEST, EMAIL_NOT_FOUND, STATUSES, NOT_FOUND } = require("../../utils/constants");
const { saltRound, jwtExpirationInterval, jwtSecret } = require("../../config/env-vars");
const APIError = require("../../utils/APIError");
const Utilities = require("../../utils/util");
const Jwt = require("jsonwebtoken");

const BussinessEntityModel = new Schema(
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
    companyName: {
      type: String,
      required: [true, "Please enter company name!"],
      trim: true,
      minlength: 2,
      maxlength: 126
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      sparse: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email']
    },
    phoneNo: {
      ccode: {
        type: String,
        trim: true
      },
      mobile: {
        type: String,
        trim: true,
        unique: true
      },
    },
    address: {
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
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6
    },
    higherAuthorityId: {
      type: Schema.Types.ObjectId,
      ref: "bussinessEntity"
    },
    assignedDiscount: [{
      productId: {
        type: Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
      discount: { type: Number, required: true, default: 0 },
    }],
    status: {
      type: String,
      enum: {
        values: STATUSES,
        message: "Bussiness Entity status is either: active, deactive, or blocked"
      },
      lowercase: true,
      default: "active"
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      lowercase: true,
      default: "bussinessentity"
    },
    type: {
      type: String,
      lowercase: true,
      default: "bussinessentity"
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const utils = new Utilities();

BussinessEntityModel.statics = {
  async ValidateUserAndGenerateToken(options, populate) {
    const { username, password } = options;
    var condition = {};
    if (utils.validateEmail(username)) {
      condition = { "email": username };
    } else {
      condition = { "phoneNo.mobile": username };
    }

    const bussinessEntity = await this.findOne(condition)
      .populate(populate)
      .exec();
    if (!bussinessEntity) {
      throw new APIError({
        message: EMAIL_NOT_FOUND,
        status: NOT_FOUND
      });
    }
    if (!(await bussinessEntity.matchPassword(password))) {
      throw new APIError({
        message: INVALID_CREDENTIALS,
        status: BAD_REQUEST
      });
    }
    return bussinessEntity.transform();
  },
  elevated() {
    return ["password", "__v", "otp"];
  },
  searchables() {
    return ["first_name", "last_name", "email", "phoneNo.mobile", "status"];
  }
};

BussinessEntityModel.pre("save", async function save(next) {
  try {
    if (!this.isModified("password")) return next();
    const hash = await bcrypt.hash(this.password, Number(saltRound));
    this.password = hash;

    this.first_name ? (this.first_name = await utils.capital_letter(this.first_name)) : this.first_name;
    this.last_name ? (this.last_name = await utils.capital_letter(this.last_name)) : this.last_name;
    this.companyName ? (this.companyName = await utils.capital_letter(this.companyName)) : this.companyName;

    return next();
  } catch (err) {
    return next(err);
  }
});


BussinessEntityModel.virtual('fullName').get(function () {
  return this.first_name + " " + this.last_name;
});

BussinessEntityModel.method({
  transform() {
    var res = utils.omitter(BussinessEntityModel.statics.elevated(), this._doc);
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

module.exports = model("bussinessEntity", BussinessEntityModel);
