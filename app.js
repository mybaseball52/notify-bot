require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const lineHelper = require("./services/line-helper");
let app = express();
let moment = require("moment-timezone");
const baseService = require("./services/base.service");
const baseService2 = require("./dynamic/services/base.service");
const lineHelper2 = require("./dynamic/services/line-helper");
const bodyParser = require('body-parser');
const sheetHelper = require("./services/google/google-sheet-helper");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//跑統計社 Cab8dc815286247966f63012fb4dd64e4
//動態競爭 Cf62c1689b42440bd588d9b3eb063dd05


//dataRange = "跑統計社!A22:B33"
async function readFromGoogleSheet(dataRange){
  let s = new sheetHelper("16lC0e5TFTq83Qs6PncZPI5t7-3HeYxCZAJDI_1kOUmU");
  await s.getAuthorize();
  let l = await s.ReadDataFrom(dataRange);

  let r = l.map((a) => {return new Date(a[1].split('/')[0], a[1].split('/')[1], a[1].split('/')[2])});

  return r;
}

/* 
 * 讀書會 schedule events 
 */
cron.schedule('0 1 * * *', async () => {
  console.log("notify at 09:00 in Taiwan");
  try{
    let scheduleDates = await readFromGoogleSheet("跑統計社!A22:B33")
    let now = moment().tz("Asia/Taipei").format("YYYYMMDD");
    scheduleDates = scheduleDates.filter((a) => { return moment(a).isAfter(now)});

    if(scheduleDates !== ""){
      if(baseService.isRemainThreeDays(now, scheduleDates[0])){
        lineHelper.pushMarketingMsgTo('Cab8dc815286247966f63012fb4dd64e4');
      } 

      else if(baseService.isRemainOneDays(now, scheduleDates[0])){
        lineHelper.pushMsgTo('Cab8dc815286247966f63012fb4dd64e4');
        lineHelper.pushActMsgTo('Cab8dc815286247966f63012fb4dd64e4');
      }
      
      else if(baseService.isToday(now, scheduleDates[0])){
        lineHelper.pushActivityMsgTo('Cab8dc815286247966f63012fb4dd64e4');
        lineHelper.pushActivityMsg2To('Cab8dc815286247966f63012fb4dd64e4');
      } 
      
      else if(baseService.isDPlusOneDay(now, scheduleDates[0])){
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
    scheduleDates2 = scheduleDates2.filter((a) => { return moment(a).isAfter(now)})

    if(scheduleDates2 !== ""){

      if(baseService2.isRemainThreeDays(now, scheduleDates2[0])){
        lineHelper2.pushMarketingMsgTo('Cf62c1689b42440bd588d9b3eb063dd05');
      } 

      else if(baseService2.isRemainOneDays(now, scheduleDates2[0])){
        lineHelper2.pushActMsgTo('Cf62c1689b42440bd588d9b3eb063dd05');
        lineHelper2.pushActMsg2To('Cf62c1689b42440bd588d9b3eb063dd05');
      }
      
      else if(baseService2.isToday(now, scheduleDates2[0])){
        lineHelper2.pushActivityMsgTo('Cf62c1689b42440bd588d9b3eb063dd05');
        lineHelper2.pushActivityMsg2To('Cf62c1689b42440bd588d9b3eb063dd05');
      } 
      
      else if(baseService2.isDPlusOneDay(now, scheduleDates2[0])){
        lineHelper2.pushRetroMsgTo('Cf62c1689b42440bd588d9b3eb063dd05');
  
        // //housekeeping
        // scheduleDates2.shift();
        // //write back to file
        // await baseService2.updateDateList(scheduleDates2);
      }
    } else {
      console.log("No schedule Date!");
    }


  } catch(e){
    console.log(e);
  }
});

app.get('/', async function(req, res) {
  let scheduleDates = await readFromGoogleSheet("跑統計社!A22:B33")
    let now = moment().tz("Asia/Taipei").format("YYYYMMDD");
    scheduleDates = scheduleDates.filter((a) => { return moment(a).isAfter(now)});

    let scheduleDates2 = await readFromGoogleSheet("動態競爭!A21:B32")
    scheduleDates2 = scheduleDates2.filter((a) => { return moment(a).isAfter(now)})

    res.json({statistic: scheduleDates, dynamic: scheduleDates2})
});


module.exports = app;