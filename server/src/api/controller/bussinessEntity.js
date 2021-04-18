
const bcryptjs = require('bcryptjs')

const { OK, CREATED, RECORD_CREATED, RECORDS_FOUND, RECORD_UPDATED, LOGOUT, VERIFY_MAIL_BUSSINESS, NO_RECORD_FOUND, BAD_REQUEST,
  VERIFY_PHONE_BUSSINESS, INVALID_CREDENTIALS, NOT_FOUND, OTP_SEND, OTP_VERIFY, BUSSINESS_ENTITY } = require("../../utils/constants");
const FindByIdModelUtilities = require("../../utils/FindByIdModelUtils");
const bussinessEntity = require("../models/bussinessEntity");
const Utilities = require("../../utils/util");
const AppController = require("./base");

var byIdUtils = new FindByIdModelUtilities();
var utils = new Utilities();

class BussinessEntityController extends AppController {
  constructor(model) {
    super(model);
    this._model = model;
    this.byIdUtils = new FindByIdModelUtilities();
    this.addBussinessEntity = this.addBussinessEntity.bind(this);
  }

  async addBussinessEntity(req, res, next) {
    try {
      var objModel = new this._model(req.body);
      return await objModel.save().then(async (savedObject) => {
        if (req.body.isAdminAdded) {
          savedObject.password = req.body.password;
          utils.handleSendOtp(savedObject, BUSSINESS_ENTITY, bussinessEntity);
        }
        savedObject = await savedObject.transform();
        return res
          .status(CREATED)
          .json({ data: savedObject, code: OK, message: RECORD_CREATED });
      },
        async err => {
          throw await utils.checkDuplication(err);
        }
      );
    } catch (error) {
      return next(error);
    }
  }

  async loginBussinesEntity(req, res, next) {
    try {
      const savedObject = await bussinessEntity.ValidateUserAndGenerateToken(req.body, req.query.populate);

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
      const data = await utils.OtpVerify(code, sentTo, BUSSINESS_ENTITY);

      const user = await byIdUtils.bussinessEntityById(data._id);

      return res
        .status(CREATED)
        .json({ data: user, code: OK, message: OTP_VERIFY });
    } catch (err) {
      return next(err);
    }
  }

  async forgotpassword(req, res, next) {
    try {
      const { username } = req.body;
      var findUser = {};
      var temp = "";
      if (utils.validateEmail(username)) {
        findUser = { email: username };
        temp = VERIFY_MAIL_BUSSINESS;
      } else {
        findUser = { "phoneNo.mobile": username };
        temp = VERIFY_PHONE_BUSSINESS;
      }
      bussinessEntity.findOne(findUser).then(async userFound => {
        if (!userFound) {
          return await res
            .status(OK)
            .json({ code: NOT_FOUND, message: NO_RECORD_FOUND });
        }
        utils.handleSendOtp(userFound, temp, bussinessEntity).then(() => {
          return res.status(CREATED).json({ code: OK, message: OTP_SEND });
        });
      });
    } catch (err) {
      return next(err);
    }
  }

  async setPassword(req, res, next) {
    try {
      const { username, newPassword } = req.body;
      var condition = {};
      if (utils.validateEmail(username)) {
        condition = { email: username };
      } else {
        condition = { "phoneNo.mobile": username };
      }
      const data = await bussinessEntity.findOne(condition);
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
    } catch (err) {
      return next(err);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (req.user) {
        const data = await bcryptjs.compare(currentPassword, req.user.password);
        if (!data) {
          return res.status(OK).json({
            message: INVALID_CREDENTIALS,
            code: BAD_REQUEST
          });
        }
        if (data) {
          req.user.password = newPassword;
          req.user.save().then((data) => {
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
    } catch (err) {
      return next(err);
    }
  }

  async logout(req, res, next) {
    try {
      bussinessEntity.findByIdAndUpdate(req.user._id, { new: true }).then(() => {
        return res.status(OK).json({
          message: LOGOUT,
          code: OK
        });
      });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = BussinessEntityController;
