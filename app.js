require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const lineHelper = require("./services/line-helper");
let app = express();
let moment = require("moment-timezone");
const baseService = require("./services/base.service");
const baseService2 = require("./dynamic/services/base.service");
const lineHelper2 = require("./dynamic/services/line-helper");
const lineHelper3 = require("./casestudy/services/line-helper");
const baseService3 = require("./casestudy/services/base.service");
const bodyParser = require('body-parser');
const sheetHelper = require("./services/google/google-sheet-helper");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//跑統計社 Cab8dc815286247966f63012fb4dd64e4
//動態競爭 Cf62c1689b42440bd588d9b3eb063dd05
//快艇提醒機器人 C071ecfc78589b2f4840980c15059c681
//Me U9001a7b94e9039fbfd7938f5801e78c9
//Roger Ub39c328baddea9fd4204d4edb166dc80

//dataRange = "跑統計社!A22:B33"
async function readFromGoogleSheet(dataRange) {
  let s = new sheetHelper("16lC0e5TFTq83Qs6PncZPI5t7-3HeYxCZAJDI_1kOUmU");
  await s.getAuthorize();
  let l = await s.ReadDataFrom(dataRange);
  let r = l.map((a) => { return new Date(`${a[1].split('/')[0]}-${a[1].split('/')[1]}-${a[1].split('/')[2]}`); });

  return r;
}

/* 
 * 讀書會 schedule events 
 */
// 0 0 * * * => AM8:00 at Taipei/Asia
cron.schedule('0 0 * * *', async () => {
  console.log("notify at 09:00 in Taiwan");
  try {
    let scheduleDates = await readFromGoogleSheet("跑統計社!A22:B33")

    let now = moment().tz("Asia/Taipei").format("YYYYMMDD");
    scheduleDates = scheduleDates.filter((a) => { return moment(a).isAfter(now) });

    if (scheduleDates !== "") {
      if (baseService.isRemainThreeDays(now, scheduleDates[0])) {
        lineHelper.pushMarketingMsgTo('Cab8dc815286247966f63012fb4dd64e4');
      }

      else if (baseService.isRemainOneDays(now, scheduleDates[0])) {
        lineHelper.pushMsgTo('Cab8dc815286247966f63012fb4dd64e4');
        lineHelper.pushActMsgTo('Cab8dc815286247966f63012fb4dd64e4');
      }

      else if (baseService.isToday(now, scheduleDates[0])) {
        lineHelper.pushActivityMsgTo('Cab8dc815286247966f63012fb4dd64e4');
        lineHelper.pushActivityMsg2To('Cab8dc815286247966f63012fb4dd64e4');
      }

      else if (baseService.isDPlusOneDay(now, scheduleDates[0])) {
        lineHelper.pushRetroMsgTo('Cab8dc815286247966f63012fb4dd64e4');

        // //housekeeping
        // scheduleDates.shift();
        // //write back to file
        // await baseService.updateDateList(scheduleDates);
      }
    } else {
      console.log("No schedule Date!");
    }

    let scheduleDates2 = await readFromGoogleSheet("動態競爭!A21:B32")

    scheduleDates2 = scheduleDates2.filter((a) => { return moment(a).isAfter(now) })

    if (scheduleDates2 !== "") {

      if (baseService2.isRemainThreeDays(now, scheduleDates2[0])) {
        lineHelper2.pushMarketingMsgTo('Cf62c1689b42440bd588d9b3eb063dd05');
      }

      else if (baseService2.isRemainOneDays(now, scheduleDates2[0])) {
        lineHelper2.pushActMsgTo('Cf62c1689b42440bd588d9b3eb063dd05');
        lineHelper2.pushActMsg2To('Cf62c1689b42440bd588d9b3eb063dd05');
      }

      else if (baseService2.isToday(now, scheduleDates2[0])) {
        lineHelper2.pushActivityMsgTo('Cf62c1689b42440bd588d9b3eb063dd05');
        lineHelper2.pushActivityMsg2To('Cf62c1689b42440bd588d9b3eb063dd05');
      }

      else if (baseService2.isDPlusOneDay(now, scheduleDates2[0])) {
        lineHelper2.pushRetroMsgTo('Cf62c1689b42440bd588d9b3eb063dd05');

        // //housekeeping
        // scheduleDates2.shift();
        // //write back to file
        // await baseService2.updateDateList(scheduleDates2);
      }
    } else {
      console.log("No schedule Date!");
    }

    let scheduleDates3 = await readFromGoogleSheet("快艇!A20:B22")

    scheduleDates3 = scheduleDates3.filter((a) => { return moment(a).isAfter(now) })

    if (scheduleDates3 !== "") {
      let d = moment().tz("Asia/Taipei").format("YYYYMMDD");
      
      if(baseService3.isRemain13Days(now, scheduleDates3[0])){
        let templateD = moment(d).add(3, 'days').tz("Asia/Taipei").format("MMDD");
        let time = d === '20200909' ? 2: 3;

        lineHelper3.pushLearn('C071ecfc78589b2f4840980c15059c681', templateD, time);
      }
      if(baseService3.isRemainSixDays(now, scheduleDates3[0])){
        let templateD = moment(d).add(3, 'days').tz("Asia/Taipei").format("MMDD");
        let time = d === '20200916' ? 2: 3;

        lineHelper3.pushCoach('C071ecfc78589b2f4840980c15059c681', templateD, time);
      }
      if(baseService3.isRemainOneDays(now, scheduleDates3[0])){
        lineHelper3.pushNotifyBeforeReading('C071ecfc78589b2f4840980c15059c681');
      }
      if(baseService3.isToday(now, scheduleDates3[0])){
        lineHelper3.todayIsReading('C071ecfc78589b2f4840980c15059c681');
      }
    } else {
      console.log("No schedule Date!");
    }

    let scheduleDates4 = await readFromGoogleSheet("快艇!A27:B28")

    scheduleDates4 = scheduleDates4.filter((a) => { return moment(a).isAfter(now) })

    if (scheduleDates4 !== "") {
      if(baseService3.is83(now)){
        lineHelper3.At83('C071ecfc78589b2f4840980c15059c681');
      }
      if(baseService3.is1025(now)){
        lineHelper3.At1025('C071ecfc78589b2f4840980c15059c681');
      }
    } else {
      console.log("No schedule Date!");
    }

  } catch (e) {
    console.log(e);
  }
});

//fetch group ID
// const handleEvent = (event) => {
//   const { type, replyToken, message } = event;
//   const messageType = message.type;
//   console.log(event.source);
//   return Promise.resolve(null);
// };
// app.post('/webhook', (req, res)=>{
//   const { body } = req;

// const { events } = body;
//   Promise.all(events.map(handleEvent))
//     .then((result) => res.status(200).send(result))
//     .catch((err) => console.log(err));
// })

app.get('/', async function (req, res) {
  let now = moment().tz("Asia/Taipei").format("YYYYMMDD");
  let scheduleDates = await readFromGoogleSheet("跑統計社!A22:B33")
  console.log(scheduleDates)
  scheduleDates = scheduleDates.filter((a) => { return moment(a).isAfter(now) });

  let scheduleDates2 = await readFromGoogleSheet("動態競爭!A21:B32")
  console.log(scheduleDates2)
  scheduleDates2 = scheduleDates2.filter((a) => { return moment(a).isAfter(now) })

  let scheduleDates3 = await readFromGoogleSheet("快艇!A20:B22")
  console.log(scheduleDates3)
  scheduleDates3 = scheduleDates3.filter((a) => { return moment(a).isAfter(now) })

  let scheduleDates4 = await readFromGoogleSheet("快艇!A27:B28")
  console.log(scheduleDates4)
  scheduleDates4 = scheduleDates4.filter((a) => { return moment(a).isAfter(now) })

  res.json({ statistic: scheduleDates, dynamic: scheduleDates2, casestudy: scheduleDates3, st: scheduleDates4 })
});


module.exports = app;