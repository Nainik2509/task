const moment = require('moment')
const Utilities = require("./util");
class FindByIdModelUtilities {
  constructor() {
    this.utils = new Utilities();
    this._channelPartnerModel = require("../api/models/channelPartner");
    this._masterModel = require("../api/models/master");
    this._productModel = require("../api/models/product");
    this._remarkModel = require("../api/models/remark");
    this._stockModel = require("../api/models/stock");
    this._subMasterModel = require("../api/models/submaster");
    this._orderModel = require("../api/models/order");
    this._userModel = require("../api/models/user");
    this._bussinessEntityModel = require("../api/models/bussinessEntity");
  }

  async getCount() {
    try {
      const data = {};

      data.userCount = await this._userModel.countDocuments();

      return data;
    } catch (error) {
      throw error;
    }
  }

  async productQuantity(ID) {
    try {
      var quantityFound = await this._stockModel
        .findOne({ productId: ID })
        .select("-__v -createdAt -updatedAt");
      return await quantityFound;
    } catch (error) {
      throw error;
    }
  }

  async userById(ID, populate) {
    try {
      var userFound = await this._userModel.findById(ID).populate(populate);
      if (userFound) {
        return userFound.transform();
      }
    } catch (error) {
      throw error;
    }
  }

  async channelPartnerById(ID) {
    try {
      var channelPartnerFound = await this._channelPartnerModel.findById(ID);
      if (channelPartnerFound) {
        return channelPartnerFound.transform();
      }
    } catch (error) {
      throw error;
    }
  }

  async bussinessEntityById(ID) {
    try {
      var userFound = await this._bussinessEntityModel.findById(ID);
      if (userFound) {
        return userFound.transform();
      }
    } catch (error) {
      throw error;
    }
  }

  async salePersonIncentive(ID) {
    try {
      //SalePerson Data By Id
      var salePersonFound = await this._userModel.findOne({ _id: ID })
        .populate({ path: 'incentivesList', populate: { path: 'monthSpan' } })
        .select("incentivesList first_name last_name target")
      // const startDate = salePersonFound.target.startDate;

      var monthName = moment.months();
      //Incentives Earn By saleperson in last two year
      const orderData = [];
      for (let index = 26; index >= 3; index--) {
        var monthNo = index % 12 + 1;
        var year;
        if (monthNo > 3) { year = new Date().getFullYear() - Math.floor(index / 12) - 1 }
        else { year = new Date().getFullYear() - Math.floor(index / 12) + 1 }
        var aggCondition = [
          { $match: { salePersonId: salePersonFound._id } },
          {
            $project: {
              month: { $month: "$orderDate" },
              year: { $year: "$orderDate" },
              orderDate: "$orderDate",
              finalPrice: "$finalPrice",
            }
          },
          { $match: { month: monthNo, year: year } },
          {
            $group: {
              _id: {
                month: { $month: "$orderDate" },
                year: { $year: "$orderDate" }
              },
              total: { $sum: "$finalPrice" },
            }
          }
        ]
        var orders = await this._orderModel.aggregate(aggCondition);
        if (orders.length > 0) { orderData.push({ month: orders[0]._id.month, year: orders[0]._id.year, total: orders[0].total }) }
        else { orderData.push({ month: monthNo, year: year, total: 0 }) }
      }
      var result = orderData.reduce((resultArray, item, index) => {
        const chunkIndex = Math.floor(index / (orderData.length / (orderData.length / 12)))
        if (!resultArray[chunkIndex]) {
          resultArray[chunkIndex] = []
        }
        resultArray[chunkIndex].push(item)
        return resultArray
      }, [])
      var monthTotal = [];
      for (let index = 0; index < result.length; index++) {
        const element = result[index];
        const a = element.reverse();
        monthTotal = monthTotal.concat(a);
      }

      //Incentives Month List Array
      const monthIndex = [];
      for (let index = 0; index < salePersonFound.incentivesList.length; index++) {
        const element = salePersonFound.incentivesList[index];
        const monthNumber = element.monthSpan.code.split("_")[1];
        monthIndex.indexOf(monthNumber) === -1 ? monthIndex.push(monthNumber) : null;
      }
      monthIndex.sort(function (a, b) { return a - b });


      // Incentives according to month assign
      const responseArray = [];
      for (let index = 0; index < monthIndex.length; index++) {
        const element = monthIndex[index];
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        var indexOfMonth = monthTotal.findIndex(i => i.month === currentMonth && i.year === currentYear);
        const indexArry = Math.floor(indexOfMonth / element);
        const ans = (indexArry * element) - element
        if (ans < 0) {
          break;
        }
        const upTo = parseInt(ans) + parseInt(element)
        let achieveTarget = 0;
        var assignTargetSum = 0;
        var incentiveToGive = 0;
        var incentivePercentage = null;
        var percentageApply = null;
        for (let index = ans; index < upTo; index++) {
          const element = monthTotal[index];
          const objName = `${monthName[element.month - 1].toLowerCase()}, ${element.year}`
          for (let j = 0; j < salePersonFound.target.assignedTarget.length; j++) {
            const targetElement = salePersonFound.target.assignedTarget[j];
            if (objName === targetElement.month && element.year === targetElement.year) {
              assignTargetSum += parseFloat(targetElement.amount);
            }
          }
          achieveTarget += element.total;
        }

        const iii = monthTotal[ans].month - 1;

        const monthPeriodStart = `${monthName[iii]}-${monthTotal[ans].year}`
        const monthPeriodEnd = `${monthName[(iii + (parseInt(element) % 12) - 1)]}-${monthTotal[upTo - 1].year}`

        if (assignTargetSum != 0) { var percentageAchieve = parseFloat((achieveTarget / assignTargetSum) * 100).toFixed(2) }
        else { var percentageAchieve = parseFloat(0).toFixed(2) }
        if (percentageAchieve > 0) {
          const foundResult = salePersonFound.incentivesList.filter(elem => elem.monthSpan.code === `MONTH_${element}`);
          const descArray = await foundResult.filter(x => x.percentage <= percentageAchieve)
            .sort(function (a, b) { return b.percentage - a.percentage })
          incentiveToGive += parseFloat((achieveTarget * descArray[0].incentives) / 100).toFixed(2);
          incentivePercentage = descArray[0].incentives
          percentageApply = descArray[0].percentage
        }
        const resp = {
          monthIndex: `MONTH_${element}`,
          achieveTarget: parseFloat(achieveTarget).toFixed(2),
          assignTargetSum: parseFloat(assignTargetSum).toFixed(2),
          percentageAchieve,
          incentiveToGive,
          incentivePercentage,
          percentageApply,
          monthPeriodStart,
          monthPeriodEnd
        }
        responseArray.push(resp);
      }

      return await responseArray
    } catch (error) {
      throw (error);
    }
  }

}
module.exports = FindByIdModelUtilities;
