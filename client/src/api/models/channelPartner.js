const { Schema, model } = require("mongoose");
const validator = require('validator')
const bcrypt = require("bcryptjs");
const moment = require("moment");

const Jwt = require("jsonwebtoken");
const APIError = require("../../utils/APIError");
const Utilities = require("../../utils/util");

const { CHANNEL_PARTNER, PAYMENT_MODE, DEFAULT_IMAGE, INVALID_CREDENTIALS, REF_PATH, BAD_REQUEST, USER_NOT_FOUND, STATUSES, NOT_FOUND } = require("../../utils/constants");
const { saltRound, jwtExpirationInterval, jwtSecret } = require("../../config/env-vars");

const ChannelPartnerMasterModel = new Schema(
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
    firm_name: {
      type: String,
      required: [true, "Please enter firm name!"],
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
        validate: [validator.isEmail, 'Please provide a valid email']
      },
      isVerified: {
        type: Boolean,
        default: false
      }
    },
    phone_no: {
      ccode: {
        type: String,
        trim: true,
        default: "+91",
        required: true
      },
      mobile: {
        type: String,
        trim: true,
        unique: true,
        required: true
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
    deliveryAddress: {
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
    paymentMode: {
      type: String,
      enum: {
        values: PAYMENT_MODE,
        message: "Payment mode is either: advance, pdc, credit or none"
      },
      lowercase: true,
      default: "none"
    },
    gstNumber: {
      type: String,
      required: true,
      trim: true
      // 10AABCU9603R1Z2
    },
    assignedSalesPerson: {
      type: Schema.Types.ObjectId,
      ref: "user"
    },
    incentivesList: [{
      type: Schema.Types.ObjectId,
      ref: "incentives"
    }],
    assignedDiscount: [{
      productId: {
        type: Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
      discount: { type: Number, required: true, default: 0 }
    }],
    target: {
      startDate: Date,
      assignedTarget: [{
        month: { type: String, lowercase: true, trim: true },
        year: { type: Number },
        amount: { type: Number }
      }]
    },
    creditLimit: { type: Number, default: 0 },
    creditDays: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    shippingLimit: { type: Number, default: 0 },
    role: {
      type: String,
      lowercase: true,
      default: "channelpartners"
    },
    type: {
      type: String,
      enum: {
        values: CHANNEL_PARTNER,
        message: "Channel Partner is either: distributor or dealer"
      },
      lowercase: true,
      required: [true, 'Please Select Channel Partner type.'],
    },
    parentField: {
      type: String,
      enum: {
        values: REF_PATH,
        message: "Parent Field can be either: channelpartner or bussinessEntity"
      },
      required: [true, 'Please provide parent field'],
    },
    higherAuthorityId: {
      type: Schema.Types.ObjectId,
      refPath: "parentField",
      required: [true, 'Please assign higher Authority to Channel Partner'],
    },
    status: {
      type: String,
      enum: {
        values: STATUSES,
        message: "Channel partner status is either: active, deactive, or blocked"
      },
      lowercase: true,
      default: "active"
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

ChannelPartnerMasterModel.statics = {
  async ValidateUserAndGenerateToken(options, populate) {
    const { username, password } = options;
    var condition = {
      $or: [{ "email.emailId": username }, { "phone_no.mobile": username }]
    };
    const user = await this.findOne(condition)
      .populate(populate)
      .exec();
    if (!user) {
      throw new APIError({
        message: USER_NOT_FOUND,
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
    return ["first_name", "last_name", "firm_name", "gstNumber", "email.emailId", "phone_no.mobile", "status"];
  }
};


ChannelPartnerMasterModel.virtual('fullName').get(function () {
  return this.first_name + " " + this.last_name;
});

ChannelPartnerMasterModel.pre("save", async function save(next) {
  try {
    if (!this.isModified("password")) return next();
    const hash = await bcrypt.hash(this.password, Number(saltRound));
    this.password = hash;

    this.first_name ? (this.first_name = await utils.capital_letter(this.first_name)) : this.first_name;
    this.last_name ? (this.last_name = await utils.capital_letter(this.last_name)) : this.last_name;
    this.firm_name ? (this.firm_name = await utils.capital_letter(this.firm_name)) : this.firm_name;

    return next();
  } catch (err) {
    return next(err);
  }
});

ChannelPartnerMasterModel.method({
  transform() {
    var res = utils.omitter(
      ChannelPartnerMasterModel.statics.elevated(),
      this._doc
    );
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

module.exports = model("channelpartner", ChannelPartnerMasterModel);
