const {
  CREATED,
  RECORD_CREATED,
  RECORD_UPDATED,
  UNPROCESSABLE_ENTITY,
  MASTER_ALREADY_EXIST,
  RECORD_DELETED,
  OK,
  NOT_FOUND,
  ROOM_NOT_FOUND,
  VALIDATION_ERROR,
  RECORDS_FOUND,
  NO_RECORD_FOUND,
  BAD_REQUEST
} = require("../../utils/constants");
const APIError = require("../../utils/APIError");
const AppController = require("./base");

class PriceMasterController extends AppController {
  constructor(model) {
    super(model);
    this._model = model;
    this.addMaster = this.addMaster.bind(this);
  }

  async addMaster(req, res, next) {
    try {
      await this._model.find({ code: req.body.code }).then(async data => {
        if (data.length > 0) {
          return res.status(OK).json({
            code: BAD_REQUEST,
            message: MASTER_ALREADY_EXIST
          });
        } else {
          var objModel = new this._model(req.body);
          await objModel.save().then(
            savedObject => {
              savedObject = savedObject.transform();
              return res
                .status(CREATED)
                .json({ data: savedObject, code: OK, message: RECORD_CREATED });
            },
            async err => {
              throw await this.utils.checkDuplication(err);
            }
          );
        }
      });
    } catch (error) {
      return next(error);
    }
  }
}
module.exports = PriceMasterController;
