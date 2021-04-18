const { SEND_EMAIL, SEND_OTP_SUCCESS, NOT_FOUND, ADMIN_ADDED_CREDENTIALS, BUSSINESS_ENTITY,
  SEND_AUTHORIZATION_HEADER, VERIFY_MAIL_BUSSINESS, VERIFY_PHONE_BUSSINESS, VERIFY_MAIL, VERIFY_PHONE
} = require("./constants");

const { VALIDATION_ERROR, BAD_REQUEST } = require("./constants");
const APIError = require("./APIError");
const fs = require("fs");

const SendOtp = require("sendotp");
const sendOtp = new SendOtp(process.env.MSG91_KEY);
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

class Utilities {
  constructor() {
    this.digits = "0123456789";
    this.alphabets = "abcdefghijklmnopqrstuvwxyz";
    this.upperCase = this.alphabets.toUpperCase();
    this.specialChars = "#!&@";
    this._bussinessEntityModel = require("../api/models/bussinessEntity");
  }

  codeConvert(string) {
    let removedCharString = string.replace(/[^\w-+.\\/\s]/g, "");
    removedCharString = removedCharString.trim();
    return removedCharString.replace(/\s+/g, "_").toUpperCase();
  }

  capital_letter(str) {
    str = str.split(" ");
    for (let i = 0, x = str.length; i < x; i++) {
      str[i] = str[i][0].toUpperCase() + str[i].substr(1).toLowerCase();
    }
    return str.join(" ");
  }

  omitter(keys, obj) {
    if (!keys.length) return obj;
    const { [keys.pop()]: omitted, ...rest } = obj;
    return this.omitter(keys, rest);
  }

  arrayOmitter(arr, values) {
    if (!values) values = [];
    values.forEach(element => {
      if (arr.includes(element)) {
        arr.splice(arr.indexOf(element), 1);
      }
    });
    return arr;
  }

  async checkDuplication(error) {
    if (
      error.code === 11000 &&
      (error.name === "BulkWriteError" || error.name === "MongoError")
    ) {
      const keys = Object.keys(error.keyPattern);
      var errors = [];
      keys.forEach(key => {
        errors.push({
          field: key,
          location: "user",
          messages:
            key
              .toLowerCase()
              .split("_")
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ") + " already in use."
        });
      });

      if (errors.length > 0) {
        var arr = new APIError({
          message: VALIDATION_ERROR,
          status: BAD_REQUEST,
          errors
        });
        return arr;
      }
    }
    return error;
  }

  rand(min, max) {
    const random = Math.random();
    return Math.floor(random * (max - min) + min);
  }

  generate(length, options) {
    length = length || 10;
    const generateOptions = options || {};

    generateOptions.digits = Object.prototype.hasOwnProperty.call(
      generateOptions,
      "digits"
    )
      ? options.digits
      : true;
    generateOptions.alphabets = Object.prototype.hasOwnProperty.call(
      generateOptions,
      "alphabets"
    )
      ? options.alphabets
      : false;
    generateOptions.upperCase = Object.prototype.hasOwnProperty.call(
      generateOptions,
      "upperCase"
    )
      ? options.upperCase
      : false;
    generateOptions.specialChars = Object.prototype.hasOwnProperty.call(
      generateOptions,
      "specialChars"
    )
      ? options.specialChars
      : false;

    const allowsChars =
      ((generateOptions.digits || "") && this.digits) +
      ((generateOptions.alphabets || "") && this.alphabets) +
      ((generateOptions.upperCase || "") && this.upperCase) +
      ((generateOptions.specialChars || "") && this.specialChars);

    let password = "";

    while (password.length < length) {
      const charIndex = this.rand(0, allowsChars.length - 1);
      password += allowsChars[charIndex];
    }
    return password;
  }

  async sendEmail(email, message) {
    var data = await nodemailer
      .createTransport(
        sendgridTransport({
          auth: {
            api_key: process.env.SENDGRID_API
          }
        })
      )
      .sendMail({
        to: email,
        from: SEND_EMAIL,
        subject: SEND_OTP_SUCCESS,
        html: message
      });
  }

  sendSMS(mobile, otpCode) {
    sendOtp.send(mobile, process.env.SENDER_ID, otpCode, (error, data) => {
      if (error) {
        const apiError = new APIError({
          errors: [error],
          message: error ? error.message : "Unauthorized",
          status: UNAUTHORIZED,
          stack: error ? error.stack : undefined
        });
        throw apiError;
      }
    });
  }

  async handleSendOtp(user, action, model) {
    const otpCode = "1111";
    // const otpCode = this.generate(4);
    var tempMobile;
    var tempEmail;
    var mobile;

    if (action === BUSSINESS_ENTITY) {
      if (user && user.email) tempEmail = user.email
      if (user && user.phoneNo) {
        mobile = user.phoneNo.mobile
        tempMobile = user.phoneNo.ccode + user.phoneNo.mobile
      }
    }

    if (action === VERIFY_MAIL_BUSSINESS) {
      tempEmail = user.email;
      var obj = {}
      obj.code = otpCode
      obj.sentTo = tempEmail
      var condition = {
        $addToSet: {
          otp: obj
        }
      }
      await model.findByIdAndUpdate(user._id, condition)
    }
    if (action === VERIFY_PHONE_BUSSINESS) {
      mobile = user.phoneNo.mobile
      tempMobile = user.phoneNo.ccode + user.phoneNo.mobile
      var obj = {}
      obj.code = otpCode
      obj.sentTo = user.phoneNo.mobile
      var condition = {
        $addToSet: {
          otp: obj
        }
      }
      await model.findByIdAndUpdate(user._id, condition)
    }

    if (action === ADMIN_ADDED_CREDENTIALS) {
      if (user && user.email && user.email.emailId) tempEmail = user.email.emailId
      if (user && user.phone_no) {
        mobile = user.phone_no.mobile
        tempMobile = user.phone_no.ccode + user.phone_no.mobile
      }
    }
    if (action === VERIFY_MAIL) {
      tempEmail = user.email.emailId;
      var obj = {}
      obj.code = otpCode
      obj.sentTo = tempEmail
      var condition = {
        $addToSet: {
          otp: obj
        }
      }
      await model.findByIdAndUpdate(user._id, condition)
    }

    if (action === VERIFY_PHONE) {
      mobile = user.phone_no.mobile
      tempMobile = user.phone_no.ccode + user.phone_no.mobile
      var obj = {}
      obj.code = otpCode
      obj.sentTo = user.phone_no.mobile
      var condition = {
        $addToSet: {
          otp: obj
        }
      }
      await model.findByIdAndUpdate(user._id, condition)
    }
    switch (action) {
      case VERIFY_MAIL:
        if (tempEmail) {
          const message = `<h5>Please verify this OTP.</h5><p><b>OTP : </b>${otpCode}</p>`;
          this.sendEmail(tempEmail, message, SEND_OTP_SUCCESS);
        }
        break;
      case VERIFY_PHONE:
        if (tempMobile) {
          // this.sendSMS(tempMobile, otpCode);
        }
        break;
      case VERIFY_MAIL_BUSSINESS:
        if (tempEmail) {
          const message = `<h5>Please verify this OTP.</h5><p><b>OTP : </b>${otpCode}</p>`;
          this.sendEmail(tempEmail, message, SEND_OTP_SUCCESS);
        }
        break;
      case VERIFY_PHONE_BUSSINESS:
        if (tempMobile) {
          // this.sendSMS(tempMobile, otpCode);
        }
        break;
      case ADMIN_ADDED_CREDENTIALS:
        if (tempEmail) {
          const message = `
          <h2>Credentials to Login in to your Account...!</h2>
          <p><b>username : </b>${user.email}</p>
          <p><b>password : </b>${user.password}</p>`;
          this.sendEmail(tempEmail, message, SEND_AUTHORIZATION_HEADER);
        }
        if (tempMobile) {
          let message = `DARRBAK_{{otp}} : Credentials to Login to Your account is  --  Username : ${user.email.emailId}  && Password : ${user.password}`;
          sendOtp.messageTemplate = message;
          // sendOtp.send(tempMobile, process.env.SENDER_ID, "1234", (error) => {
          //   if (error) {
          //     const apiError = new APIError({
          //       errors: [error],
          //       message: error ? error.message : "Unauthorized",
          //       status: UNAUTHORIZED,
          //       stack: error ? error.stack : undefined,
          //     });
          //     throw apiError;
          //   }
          // });
        }
        break;
      case BUSSINESS_ENTITY:
        if (tempEmail) {
          const message = `
          <h2>Credentials to Login in to your Account...!</h2>
          <p><b>username : </b>${user.email}</p>
          <p><b>password : </b>${user.password}</p>`;
          this.sendEmail(tempEmail, message, SEND_AUTHORIZATION_HEADER);
        }
        if (tempMobile) {
          let message = `WL_{{otp}} : Credentials to Login to Your account is  --  Username : ${user.email}  && Password : ${user.password}`;
          sendOtp.messageTemplate = message;
          // sendOtp.send(tempMobile, process.env.SENDER_ID, "1234", (error, data) => {
          //   if (error) {
          //     const apiError = new APIError({
          //       errors: [error],
          //       message: error ? error.message : "Unauthorized",
          //       status: UNAUTHORIZED,
          //       stack: error ? error.stack : undefined,
          //     });
          //     throw apiError;
          //   }
          // });
        }
        break;
    }
  }

  validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  async OtpVerify(code, sentTo, model) {
    try {
      var condition = {
        otp: {
          $elemMatch: {
            code: code,
            sentTo: sentTo,
            expireAt: { $gt: Date.now() }
          }
        }
      };
      if (model === BUSSINESS_ENTITY) {
        return await this._bussinessEntityModel.findOne(condition).then(async userFound => {
          if (userFound) {
            if (this.validateEmail(sentTo)) {
              return await this._bussinessEntityModel
                .findOne({ _id: userFound._id, "email": sentTo })
                .then(async foundUser => {
                  foundUser.otp = [];
                  return await foundUser.save().then(data => {
                    return data;
                  });
                });
            } else {
              return await this._bussinessEntityModel
                .findOne({ _id: userFound._id, "phoneNo.mobile": sentTo })
                .then(async foundUser => {
                  if (foundUser) {
                    foundUser.otp = [];
                    return await foundUser.save().then(data => {
                      return data;
                    });
                  }
                });
            }
          }
        },
          async err => {
            throw new APIError({
              errors: [err],
              message: NO_RECORD_FOUND,
              status: NOT_FOUND
            });
          }
        );
      } else {
        return await model.findOne(condition).then(
          async userFound => {
            if (userFound) {
              if (this.validateEmail(sentTo)) {
                return await model
                  .findOne({ _id: userFound._id, "email.emailId": sentTo })
                  .then(async foundUser => {
                    foundUser.email.isVerified = true;
                    foundUser.otp = [];
                    return await foundUser.save().then(data => {
                      return data;
                    });
                  });
              } else {
                return await model
                  .findOne({ _id: userFound._id, "phone_no.mobile": sentTo })
                  .then(async foundUser => {
                    if (foundUser) {
                      if (foundUser.phone_no.mobile == sentTo) {
                        foundUser.phone_no.isVerified = true;
                      }

                      foundUser.otp = [];
                      return await foundUser.save().then(data => {
                        return data;
                      });
                    }
                  });
              }
            }
          },
          async err => {
            throw new APIError({
              errors: [err],
              message: NO_RECORD_FOUND,
              status: NOT_FOUND
            });
          }
        );
      }
    } catch (err) {
      console.log(err)
      return err;
    }
  }

  extractJSON(input) {
    if (typeof input !== "object") return input;
    if (Array.isArray(input)) return input.map(this.extractJSON);
    return Object.keys(input).reduce(function (newObj, key) {
      let val = input[key];
      let newVal = typeof val === "object" ? extractJSON(val) : val;
      newObj[codeConvert(key)] = newVal;
      return newObj;
    }, {});
  }

  jsonReader(filePath, cb) {
    fs.readFile(filePath, (err, fileData) => {
      try {
        const object = JSON.parse(fileData);
        var temp = this.extractJSON(object);
        return cb && cb(null, temp);
      } catch (err) {
        return cb && cb(err);
      }
    });
  }
}
module.exports = Utilities;
