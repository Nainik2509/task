const {
  CREATED,
  RECORD_CREATED,
  RECORD_UPDATED,
  RECORD_DELETED,
  WEATHER_DETAILS,
  OK,
  NOT_FOUND,
  RECORDS_FOUND,
  NO_RECORD_FOUND
} = require("../../utils/constants");
const Utilities = require("../../utils/util");
const APIError = require("../../utils/APIError");
const attachment = require("../models/attachment");
const axios = require("axios");
const cloudinary = require('../../utils/cloudinaryUpload')
class AppController {
  constructor(model) {
    this._model = model;
    this.reservedVars = [
      "populate",
      "populateMap",
      "fields",
      "page",
      "perPage",
      "counter",
      "asc",
      "dsc",
      "query"
    ];
    this.utils = new Utilities();
    this.add = this.add.bind(this);
    this.list = this.list.bind(this);
    this.get = this.get.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.upload = this.upload.bind(this);
    this.mapList = this.mapList.bind(this);
  }

  async add(req, res, next) {
    var objModel = new this._model(req.body);
    try {
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
    } catch (error) {
      return next(error);
    }
  }

  async list(req, res, next) {
    try {
      let whereIsMyData = this.removeReservedVars(req.query, this.reservedVars);
      let page = parseInt(req.query.page) || 0;
      let limit = parseInt(req.query.perPage) || 10;
      let include = req.query.populate;
      let attributes = this.getFieldAsArray(req.query.fields);
      let asc = this.getFieldAsArray(req.query.asc) || [];
      let dsc = this.getFieldAsArray(req.query.dsc) || [];
      var assort = {};
      asc.forEach(elem => {
        assort[elem] = 1;
      });
      dsc.forEach(elem => {
        assort[elem] = -1;
      });

      if (!req.query.perPage) {
        page = undefined;
        limit = undefined;
      }
      if (req.query.query) {
        this._model.searchables().forEach(element => {
          req.query[`$${element}`] = req.query.query;
        });
      }

      var dissolvedVars = Object.keys(req.query)
        .filter(obj => obj.startsWith("$"))
        .reduce((obj, key) => {
          obj[key.replace("$", "")] = {
            $regex: `${req.query[key]}`,
            $options: "i"
          };
          return obj;
        }, {});

      if (Object.keys(dissolvedVars).length > 0) {
        whereIsMyData.$or = [];
        Object.keys(dissolvedVars).forEach(element => {
          const obj = {};
          obj[element] = dissolvedVars[element];
          whereIsMyData.$or.push(obj);
        });
      }

      if (Object.keys(whereIsMyData).length === 0) {
        whereIsMyData = undefined;
      }

      if (!attributes) {
        attributes = [];
        this._model.elevated().forEach(element => {
          attributes.push(`-${element}`);
        });
      } else {
        attributes = this.utils.arrayOmitter(
          attributes,
          this._model.elevated()
        );
      }

      await this._model
        .find(whereIsMyData)
        .select(attributes)
        .sort(assort)
        .skip(page * limit)
        .limit(limit)
        .populate(include)
        .then(
          async savedObject => {
            if (req.query.counter)
              var count = await this._model.countDocuments(whereIsMyData);
            return res.status(CREATED).json({
              data: savedObject,
              code: OK,
              count,
              message: savedObject.length > 0 ? RECORDS_FOUND : NO_RECORD_FOUND
            });
          },
          async err => {
            throw err;
          }
        );
    } catch (error) {
      return next(error);
    }
  }

  async mapList(req, res, next) {
    try {
      let allWhereIs = this.removeReservedVars(req.query, this.reservedVars);
      let whereIsMyData = this.allParsed(allWhereIs);
      let page = parseInt(req.query.page) || 0;
      let limit = parseInt(req.query.perPage) || 10;
      let attributes = this.getFieldAsArray(req.query.fields);
      let asc = this.getFieldAsArray(req.query.asc) || [];
      let dsc = this.getFieldAsArray(req.query.dsc) || [];
      let populateMap = req.body.populateMap || [];
      var assort = {};
      asc.forEach(elem => {
        assort[elem] = 1;
      });
      dsc.forEach(elem => {
        assort[elem] = -1;
      });

      if (!req.query.perPage) {
        page = undefined;
        limit = undefined;
      }
      if (req.query.query) {
        this._model.searchables().forEach(element => {
          req.query[`$${element}`] = req.query.query;
        });
      }

      var dissolvedVars = Object.keys(req.query)
        .filter(obj => obj.startsWith("$"))
        .reduce((obj, key) => {
          obj[key.replace("$", "")] = {
            $regex: `${req.query[key]}`,
            $options: "i"
          };
          return obj;
        }, {});

      if (Object.keys(dissolvedVars).length > 0) {
        whereIsMyData.$or = [];
        Object.keys(dissolvedVars).forEach(element => {
          const obj = {};
          obj[element] = dissolvedVars[element];
          whereIsMyData.$or.push(obj);
        });
      }

      if (Object.keys(whereIsMyData).length === 0) {
        whereIsMyData = undefined;
      }

      if (!attributes) {
        attributes = [];
        this._model.elevated().forEach(element => {
          attributes.push(`-${element}`);
        });
      } else {
        attributes = this.utils.arrayOmitter(
          attributes,
          this._model.elevated()
        );
      }
      await this._model
        .find(whereIsMyData)
        .select(attributes)
        .sort(assort)
        .skip(page * limit)
        .limit(limit)
        .populate(populateMap)
        .then(
          async savedObject => {

            if (req.query.counter)
              var count = await this._model.countDocuments(whereIsMyData);
            return res.status(CREATED).json({
              data: savedObject,
              code: OK,
              count,
              message: savedObject.length > 0 ? RECORDS_FOUND : NO_RECORD_FOUND
            });
          },
          async err => {
            throw err;
          }
        );
    } catch (error) {
      return next(error);
    }
  }

  async get(req, res, next) {
    var _id = req.params.id;
    let include = this.getFieldAsArray(req.query.populate);
    try {
      await this._model
        .findOne({ _id })
        .populate(include)
        .then(
          updated => {
            updated = updated.transform();
            return res
              .status(CREATED)
              .json({ data: updated, code: OK, message: RECORDS_FOUND });
          },
          async err => {
            throw new APIError({
              errors: [err],
              message: NO_RECORD_FOUND,
              status: NOT_FOUND
            });
          }
        );
    } catch (err) {
      return next(err);
    }
  }

  async update(req, res, next) {
    var _id = req.params.id;
    // var _id = req.user._id;
    // let include = this.getFieldAsArray(req.body.populate);

    try {
      await this._model
        .findOneAndUpdate({ _id }, req.body, { new: true })
        .populate(req.query.populate)
        .then(
          updated => {
            updated = updated.transform();
            return res
              .status(CREATED)
              .json({ data: updated, code: OK, message: RECORD_UPDATED });
          },
          async err => {
            throw await this.utils.checkDuplication(err);
          }
        );
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    var _id = req.params.id;
    try {
      await this._model.findOne({ _id }).then(
        updated => {
          if (updated != null) {
            updated = updated.remove();
            return res
              .status(CREATED)
              .json({ data: updated, code: OK, message: RECORD_DELETED });
          }
          throw new APIError({
            message: NO_RECORD_FOUND,
            status: NOT_FOUND
          });
        },
        async err => {
          throw new APIError({
            errors: [err],
            message: NO_RECORD_FOUND,
            status: NOT_FOUND
          });
        }
      );
    } catch (error) {
      return next(error);
    }
  }

  allParsed(allWhereIs) {
    let returnable = {};
    Object.keys(allWhereIs)
      .forEach((key) => {
        if (this.isJson(allWhereIs[key])) {
          returnable[key] = JSON.parse(allWhereIs[key]);
        } else {
          returnable[key] = allWhereIs[key];
        }
      });
    return returnable;
  }

  removeReservedVars(queries, dissolvers) {
    return Object.keys(queries)
      .filter(obj => dissolvers.indexOf(obj) === -1)
      .filter(obj => !obj.startsWith("$"))
      .reduce((obj, key) => {
        obj[key] = queries[key];
        return obj;
      }, {});
  }

  getFieldAsArray(field) {
    return field ? field.split(",").map(item => item.trim()) : undefined;
  }

  async upload(req, res, next) {

    try {
      var mimetype = req.file.mimetype;
      var absolutePath =
        req.file.destination.split("public").pop() + req.file.filename;
      const result = await cloudinary.uploader.upload(req.file.path)
      var path = result.url;
      var securePath = result.secure_url;
      await attachment({ absolutePath, path, mimetype, securePath })
        .save()
        .then(
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
    } catch (error) {
      return next(error);
    }
  }

  async weatherInfo(req, res, next) {
    try {
      axios
        .get(
          "http://api.openweathermap.org/data/2.5/weather?q=" +
          req.body.city +
          "&APPID=19d9486955a30b411cfbcaad0347922e"
        )
        .then(weatherInfo => {
          const data = weatherInfo.data;
          if (data.cod === 200) {
            return res.status(OK).json({
              data: {
                temp_min: data.main.temp_min,
                temp_max: data.main.temp_max,
                feel: data.weather[0].main
              },
              code: OK,
              message: WEATHER_DETAILS
            });
          }
        });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = AppController;
