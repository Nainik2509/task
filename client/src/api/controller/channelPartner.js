const bcrypt = require("bcryptjs");
const { CREATED, RECORD_CREATED, RECORD_UPDATED, OK, NOT_FOUND, TOKEN_EXPIRED, RECORDS_FOUND, NO_RECORD_FOUND,
  BAD_REQUEST, OTP_SEND, LOGOUT, VERIFY_MAIL, ADMIN_ADDED_CREDENTIALS } = require("../../utils/constants");

const APIError = require("../../utils/APIError");
const AppController = require("./base");
const Utilities = require("../../utils/util");
var utils = new Utilities();
const FindByIdModelUtilities = require("../../utils/FindByIdModelUtils");
const channelPartner = require("../models/channelPartner");
const user = require("../models/user");

var byIdUtils = new FindByIdModelUtilities();

class ChannelPartnerController extends AppController {
  constructor(model) {
    super(model);
    this._model = model;
    this.addChannelPartner = this.addChannelPartner.bind(this);
  }

  async addChannelPartner(req, res, next) {
    try {
      req.body.email = {
        ...req.body.email,
        isVerified: false
      };
      req.body.phone_no = {
        ...req.body.phone_no,
        isVerified: false
      };
      if (!req.body.isVerified) req.body.isVerified = false;
      var objModel = new this._model(req.body);
      return await objModel.save().then(async savedObject => {
        if (savedObject.assignedSalesPerson) {
          await user.findByIdAndUpdate(savedObject.assignedSalesPerson, {
            $addToSet: { assignedParties: savedObject._id }
          });
        }
        if (req.body.isVerified) {
          savedObject.password = req.body.password;
          utils.handleSendOtp(savedObject, ADMIN_ADDED_CREDENTIALS, channelPartner);
        }
        if (!savedObject.isVerified) {
          if (!savedObject.email.isVerified) {
            utils.handleSendOtp(savedObject, VERIFY_MAIL, channelPartner);
          }
          if (!savedObject.phone_no.isVerified) {
            utils.handleSendOtp(savedObject, VERIFY_PHONE, channelPartner);
          }
        }
        this._model
          .findOne({ _id: savedObject._id })
          .populate(req.query.populate)
          .then((data) => {
            data = data.transform();
            return res
              .status(CREATED)
              .json({ data: data, code: OK, message: RECORD_CREATED });
          });
      },
        async err => {
          throw await utils.checkDuplication(err);
        }
      );
    } catch (error) {
      return next(error);
    }
  }

  async loginChannelPartner(req, res, next) {
    try {
      const savedObject = await channelPartner.ValidateUserAndGenerateToken(req.body, req.query.populate);

      if (utils.validateEmail(req.body.username)) {
        if (!savedObject.email.isVerified) {
          utils.handleSendOtp(savedObject, VERIFY_MAIL, channelPartner);
        }
      } else {
        if (!savedObject.phone_no.isVerified) {
          utils.handleSendOtp(savedObject, VERIFY_PHONE, channelPartner);
        }
      }
      return res
        .status(CREATED)
        .json({ data: savedObject, code: OK, message: RECORDS_FOUND });
    } catch (err) {
      return next(err);
    }
  }

  async otpverify(req, res, next) {
    try {
      const { code, sentTo } = req.body;
      const data = await utils.OtpVerify(code, sentTo, channelPartner);
      if (!data) {
        return res.status(OK).json({ code: OK, message: TOKEN_EXPIRED });
      }
      const channelPartnerUser = await byIdUtils.channelPartnerById(data._id);

      return res
        .status(CREATED)
        .json({ data: channelPartnerUser, code: OK, message: RECORD_CREATED });
    } catch (err) {
      return next(err);
    }
  }

  async forgotpassword(req, res, next) {
    try {
      const { username } = req.body
      var findUser = {};
      var temp = "";
      if (utils.validateEmail(username)) {
        findUser = { "email.emailId": username };
        temp = VERIFY_MAIL;
      } else {
        findUser = { "phone_no.mobile": username };
        temp = VERIFY_PHONE;
      }
      channelPartner.findOne(findUser).then(async userFound => {
        if (!userFound) {
          return await res.status(OK).json({ code: NOT_FOUND, message: NO_RECORD_FOUND })
        }
        utils.handleSendOtp(userFound, temp, channelPartner).then(() => {
          return res
            .status(CREATED)
            .json({ code: OK, message: OTP_SEND });
        })
      })
    } catch (err) {
      return next(err);
    }
  }

  async setPassword(req, res, next) {
    const { username, newPassword } = req.body;
    const data = await channelPartner.findOne({
      $or: [{ "email.emailId": username }, { "phone_no.mobile": username }]
    });
    if (!data) {
      return res.status(OK).json({
        message: NO_RECORD_FOUND,
        code: NOT_FOUND
      });
    }
    data.password = newPassword;
    data.save().then(userUpdate => {
      userUpdate = userUpdate.transform();
      return res.status(OK).json({
        data: userUpdate,
        message: RECORD_UPDATED,
        code: OK
      });
    });
  }

  async changePassword(req, res, next) {
    const { currentPassword, newPassword } = req.body;
    if (req.user) {
      const data = await bcrypt.compare(currentPassword, req.user.password);
      if (!data) {
        return res.status(OK).json({
          message: INVALID_CREDENTIALS,
          code: BAD_REQUEST
        });
      }
      if (data) {
        req.user.password = newPassword;
        req.user
          .save()
          .then(data => {
            data = data.transform();
            return res.status(OK).json({
              data: data,
              message: RECORD_UPDATED,
              code: OK
            });
          })
          .catch(error => {
            new APIError({
              errors: [error],
              message: NO_RECORD_FOUND,
              code: NOT_FOUND
            });
          });
      }
    }
  }

  async logout(req, res, next) {
    channelPartner.findByIdAndUpdate(req.user._id, { new: true }).then(data => {
      return res.status(OK).json({
        message: LOGOUT,
        code: OK
      });
    });
  }
}
module.exports = ChannelPartnerController;
