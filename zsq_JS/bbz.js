const { unescape, escape } = require("querystring");
var request = require('request');

/**
 * 步步宝 app  (链接带邀请) 感谢您走我的邀请链接,谢谢,谢谢,谢谢
 * 下载地址: 步步宝，走路就能领红包~http://bububao.yichengw.cn/?id=542635
 * 脚本地址：https://raw.githubusercontent.com/sofm13/qinlongjs/master/zsq_JS/bbz.js
 * 转载请留信息
 * 
 * cron 5/25/50 8-20 * * *  sofm13_qinlongjs_master/bbz.js
 * 由于主页金币有限，正常一小时跑四五次即可，每天大约一块，七天后可手动提取一元，在后面需要等满足提现金额才行提现
 * 
 * 5-7 完成 签到 ,喝水，答题，领取主页金币，领取主页金币（主要建议两分钟跑一次）  任务   
 * 5-9 完成 抽奖，砸金蛋，睡觉，刮卡
 * ========= 青龙 =========
 * 变量格式: export bububao='tokenstr1 @ tokenstr2'  多个账号用 @分割
 *
 * tokenstr :  关键词  bububao.duoshoutuan.com  ,headers中的一个参数
 *
 * 还是不会的请百度或者群里求助: https://t.me/zsq_ql, https://t.me/zsq_sofm13 联系群主 @sofm_13 或Q群978963762来一起交流啊
 */
const $ = new Env("步步宝");
const notify = $.isNode() ? require("./sendNotify") : "";
const Notify = 1; //0为关闭通知，1为打开通知,默认为1
const debug = 0; //0为关闭调试，1为打开调试,默认为0
//////////////////////
let ckStr = process.env.bububao;
//let ckStr = "";
let cyh_dataArr = [];
let msg = "";
let ck = "";
const taskList = {
  "water": 13
}
/////////////////////////////////////////////////////////

async function tips(ckArr) {
  console.log(`\n版本: 0.4 -- 22/5/3`);
  // console.log(`\n 脚本已恢复正常状态,请及时更新! `);
  console.log(`\n 脚本测试中,有bug及时反馈! \n`);
  console.log(`\n 脚本测试中,有bug及时反馈! \n`);
  console.log(`\n 脚本测试中,有bug及时反馈! \n`);

  console.log(
    `\n================================================\n脚本执行 - 北京时间(UTC+8): ${new Date(
      new Date().getTime() +
      new Date().getTimezoneOffset() * 60 * 1000 +
      8 * 60 * 60 * 1000
    ).toLocaleString()} \n================================================\n`
  );

  await wyy();

  console.log(
    `\n=================== 共找到 ${ckArr.length} 个账号 ===================`
  );
  debugLog(`【debug】 这是你的账号数组:\n ${ckArr}`);
}

!(async () => {
  let ckArr = await getCks(ckStr, "bububao");

  await tips(ckArr);

  for (let index = 0; index < ckArr.length; index++) {
    let num = index + 1;
    console.log(`\n========= 开始【第 ${num} 个账号】=========\n`);

    ck = ckArr[index].split("&");
    if (debug) {
      console.log(`\n 【debug】 这是你第 ${num} 账号信息:\n ${ck}\n`);
    }

    await start();
  }
  await SendMsg(msg);

})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done());

async function start() {

  var nowDate = new Date();
  console.log("开始 用户信息状态");
  await userInfo();
  await $.wait(2 * 1000);

  if (nowDate.getHours() == 8) {
    console.log("8点开始 打卡");
    await dk_click();
    await $.wait(2 * 1000);
  }
  else {
    console.log("非8点");
  }

  console.log("开始 检查主页");
  await home();
  await $.wait(2 * 1000);

  console.log("开始 签到状态");
  await signin_info();
  await $.wait(2 * 1000);

  console.log("开始 检查喝水状态");
  await water_info();
  await $.wait(2 * 1000);

  console.log("开始 答题");
  await cyInfo();
  await $.wait(2 * 1000);

  console.log("开始 抽奖");
  await lucky();
  await $.wait(2 * 1000);

  console.log("开始 刮卡");
  await guainfo();
  await $.wait(2 * 1000);

  console.log("开始 砸金蛋");
  await jindan();
  await $.wait(2 * 1000);


  console.log("开始 阅读");
  for (let index = 0; index < 5; index++) {
    await news(3 * 1000, 1, `阅读*${index}`);
    await $.wait(2 * 1000);
  }

  console.log("开始 看视频");
  for (let index = 0; index < 5; index++) {
    await news(3 * 1000, 2, `看视频*${index}`);
    await $.wait(2 * 1000);
  }

  console.log("开始 小程序刮卡");
  await weguaInfo();
  await $.wait(2 * 1000);

  // console.log("开始 检查任务状态");
  // var taskall = await taskInfo();

  // for (const [key, value] of Object.entries(taskList)) {
  //   await taskDone(3 * 1000, taskall.first[key], value, taskall.first[`${key}_title`], taskall.first[`${key}_jinbi`]);
  // }

}

const initRequestHeaders = function () {
  return {
    'tokenstr': ck[0],
    'Host': 'bububao.duoshoutuan.com',
    'Content-Type': 'application/x-www-form-urlencoded',
    'version': 20
  };
};

/**
 * 签到状态   post
 */
async function signin_info(timeout = 3 * 1000) {

  let url = {
    url: `https://bububao.duoshoutuan.com/user/sign_html`,
    headers: initRequestHeaders(),
    // body: '',
  };

  let result = await httpPost(url, `签到状态`, timeout);
  if (result.is_sign_day == 0) {
    console.log(`没有签到,去签到!`);
    await signin();
  } else {
    console.log(`今天已经签到了,明天再来吧!`);
  }
}

/**
 * 签到   post
 */
async function signin(timeout = 3 * 1000) {

  let url = {
    url: `https://bububao.duoshoutuan.com/user/sign`,
    headers: initRequestHeaders(),
  };

  let result = await httpPost(url, `签到`, timeout);
  if (result.code == 0) {
    console.log(`\n 签到:成功 🎉   签到获得 金币 ${result.jinbi} \n`);

    msg += `\n 签到:成功 🎉   签到获得 金币 ${result.jinbi} \n`
  } else {
    console.log(`\n 签到: ${result.msg} \n `);
  }
}


/**
 * 喝水信息  
 */
async function water_info(timeout = 3 * 1000) {

  let url = {
    url: `https://bububao.duoshoutuan.com/mini/water_info`,
    headers: initRequestHeaders(),
  };

  let result = await httpPost(url, `喝水信息`, timeout);
  if (result.code == 1) {
    console.log(
      `\n 已喝水: ${result.day_num} 次 `
    );
    if (result.day_num < 7 && result.next_time == 0) {
      $.log("开始喝水")
      await water_click(timeout, result.day_num)
    }
    else if (result.day_num < 7 && result.next_time > 0) {
      $.log(`时间还差${result.next_time}秒`)
    }
    else {
      $.log(`已喝水满7次`)
    }

  } else {
    console.log(`\n 喝水: ${result.msg} \n `);
  }
}

/**
 * 喝水 
 */
async function water_click(timeout = 3 * 1000, day_num) {

  let url = {
    url: `https://bububao.duoshoutuan.com/mini/water_click`,
    headers: initRequestHeaders(),
    body: `day_num=${day_num}`
  };

  let result = await httpPost(url, `喝水`, timeout);
  if (result.code == 1) {
    console.log(
      `\n 喝水: ${result.msg}  喝水获得 金币 ${result.jinbi} `
    );
    msg += `\n 喝水:成功 ${result.msg} 🎉   喝水获得 金币 ${result.jinbi}`
  } else {
    console.log(`\n 喝水: ${result.msg} \n `);
  }
}

//用户信息   
async function userInfo(timeout = 3 * 1000) {

  let url = {
    url: `https://bububao.duoshoutuan.com/user/profile`,
    headers: initRequestHeaders(),
  };

  let result = await httpPost(url, `用户信息`, timeout);
  console.log(
    `\n 用户名:${result.username} 🎉  金币:${result.jinbi} , 余额:${result.money} \n`
  );
}

//主页
async function home(timeout = 3 * 1000) {

  let url = {
    url: `https://bububao.duoshoutuan.com/user/home`,
    headers: initRequestHeaders(),
  };

  let result = await httpPost(url, `主页`, timeout);
  console.log(
    `\n 主页金币:${result.right_jinbi} 🎉 \n`
  );
  if (result.right_jinbi > 0) {
    await homejin();
  }
}

//主页金币
async function homejin(timeout = 3 * 1000) {

  let url = {
    url: `https://bububao.duoshoutuan.com/user/homejin`,
    headers: initRequestHeaders(),
  };

  let result = await httpPost(url, `领取主页金币`, timeout);
  if (result.code == 1) {
    console.log(
      `\n 主页金币: ${result.msg}  主页金币获得 金币 ${result.jinbi} `
    );
    msg += `\n 主页金币 ${result.msg} 🎉   主页金币获得 金币 ${result.jinbi}`
  } else {
    console.log(`\n 主页金币: ${result.msg} \n `);
  }
}

/**
 * 任务信息   
 */
async function taskInfo(timeout = 3 * 1000) {

  let url = {
    url: `https://bububao.duoshoutuan.com/user/renwu`,
    headers: initRequestHeaders(),
  };

  let result = await httpPost(url, `任务信息`, timeout);
  return new Promise(resolve => {
    resolve(result);
  });;
}

//完成任务
async function taskDone(timeout = 3 * 1000, taskStatus, taskid, taskName, jinbi) {

  console.log(taskStatus + taskid + taskName + jinbi);
  if (taskStatus == 0) {
    $.log(`${taskName} 未完成,无法领取金币${jinbi}`)
    return;
  }
  else if (taskStatus == 2) {
    $.log(`${taskName} 金币已领取无需完成`)
    return;
  }
  let url = {
    url: `https://bububao.duoshoutuan.com/user/done_renwu`,
    headers: initRequestHeaders(),
    body: `taskid=${taskid}`
  };

  $.log(`${taskName} 已完成,已领取金币${jinbi}`)
  msg += `${taskName} 已完成,已领取金币${jinbi}`;
}


//答题信息   
async function cyInfo(timeout = 3 * 1000) {

  let url = {
    url: `https://bububao.duoshoutuan.com/mini/cy_info`,
    headers: initRequestHeaders(),
  };

  let result = await httpPost(url, `答题信息`, timeout);
  if (result.day_num > 0) {

    $.log(`答题${result.day_num}/30 每次答一题`)
    if (result.is_sp == 1) {
      await cy_sp(timeout, result.day_num);
      await $.wait(1 * 1000);
    }
    await cy_click(timeout, result.cy_id, result.site)
  }
  else {
    $.log("答题次数已达上限")
  }
}

//答题看视频
async function cy_sp(timeout = 3 * 1000, day_num) {

  let url = {
    url: `https://bububao.duoshoutuan.com/mini/cy_sp`,
    headers: initRequestHeaders(),
    body: `day_num=${day_num}`
  };

  let result = await httpPost(url, `答题看视频`, timeout);
  if (result.code == 1) {
    console.log(
      `\n 答题看视频: ${result.msg} `
    );
  } else {
    console.log(`\n 答题: ${result.msg} \n `);
  }
}

//答题
async function cy_click(timeout = 3 * 1000, cy_id, site) {

  let url = {
    url: `https://bububao.duoshoutuan.com/mini/cy_click`,
    headers: initRequestHeaders(),
    body: `cy_id=${cy_id}&site=${site}`
  };

  let result = await httpPost(url, `答题`, timeout);
  if (result.code == 1) {
    console.log(
      `\n 答题: ${result.msg}  答题获得 金币 ${result.jinbi} `
    );
    msg += `\n 答题:成功 ${result.msg} 🎉   答题获得 金币 ${result.jinbi}`
  } else {
    console.log(`\n 答题: ${result.msg} \n `);
  }
}

//抽奖信息
async function lucky(timeout = 3 * 1000) {

  let url = {
    url: `https://bububao.duoshoutuan.com/user/lucky`,
    headers: initRequestHeaders(),
  };

  let result = await httpPost(url, `抽奖信息`, timeout);
  if (result.lucky_num > 0) {

    $.log(`抽奖${result.lucky_count}/100 每次抽5次`)
    for (let i = 0; i < 5; i++) {
      await lucky_click(timeout);
      await $.wait(1 * 1000);
    }

  }
  else {
    $.log("抽奖次数已达上限")
  }
}

//抽奖
async function lucky_click(timeout = 3 * 1000) {

  let url = {
    url: `https://bububao.duoshoutuan.com/user/lucky_click`,
    headers: initRequestHeaders(),
  };

  let result = await httpPost(url, `抽奖`, timeout);
  if (result.code == 1) {
    console.log(
      `\n 抽奖: ${result.msg}  抽奖获得 金币 ${result.jinbi} `
    );
    msg += `\n 抽奖:成功 ${result.msg} 🎉   抽奖获得 金币 ${result.jinbi}`
  } else {
    console.log(`\n 抽奖: ${result.msg} \n `);
  }
}

//刮卡信息
async function guainfo(timeout = 3 * 1000) {

  let url = {
    url: `https://bububao.duoshoutuan.com/gua/gualist`,
    headers: initRequestHeaders(),
  };

  let result = await httpPost(url, `刮卡信息`, timeout);
  if (result.ka > 0) {

    $.log(`刮卡${result.ka}/15 每次刮1次`)
    var max = Math.max.apply(Math, result.list.map(item => { return item.jine }))
    await gua(timeout, result.list.find(x => x.jine == max).id);
  }
  else {
    $.log("刮卡次数已达上限")
  }
}

//刮卡
async function gua(timeout = 3 * 1000, gid) {

  let url = {
    url: `https://bububao.duoshoutuan.com/gua/guadet`,
    headers: initRequestHeaders(),
    body: `gid=${gid}`
  };

  let result = await httpPost(url, `刮卡`, timeout);
  url = {
    url: `https://bububao.duoshoutuan.com/gua/guapost`,
    headers: initRequestHeaders(),
    body: `gid=${gid}&sign=${result.sign}&glid=${result.glid}`
  };

  await $.wait(1 * 1000);
  result = await httpPost(url, `刮卡`, timeout);
  if (result.suc == 1) {
    console.log(
      `\n 刮卡获得 金币 ${result.jf} `
    );
    msg += `\n 刮卡获得 金币 ${result.jf} 🎉 `
  } else {
    console.log(`\n 刮卡: ${result.msg} \n `);
  }
}

//砸金蛋
async function jindan(timeout = 3 * 1000) {

  let url = {
    url: `https://bububao.duoshoutuan.com/user/jindan_click`,
    headers: initRequestHeaders(),
  };

  let result = await httpPost(url, `砸金蛋`, timeout);
  if (result.code == 1) {

    console.log(
      `\n 砸金蛋  ${result.msg} `
    );

    await $.wait(1 * 1000);
    await jindan_click(timeout, result.taskid, result.nonce_str)

  } else {
    console.log(`\n 砸金蛋: ${result.msg} \n `);
  }
}

//砸金蛋金币
async function jindan_click(timeout = 3 * 1000, taskid, str) {

  var date = Math.round(new Date().getTime());
  let url = {
    url: `https://bububao.duoshoutuan.com/user/jindan_finish`,
    headers: initRequestHeaders(),
    body: `taskid=${taskid}&nonce_str=${str}&clicktime=${date}&donetime=${date + 2}`
  };

  let result = await httpPost(url, `砸金蛋得金币`, timeout);
  await $.wait(2 * 1000);

  url = {
    url: `https://bububao.duoshoutuan.com/user/jindan_jinbi`,
    headers: initRequestHeaders(),
    body: `taskid=${taskid}&nonce_str=${str}`
  };

  result = await httpPost(url, `砸金蛋得金币`, timeout);
  if (result.code == 1) {
    console.log(
      `\n 砸金蛋获得 金币 ${result.jinbi}  🎉`
    );
    msg += `\n 砸金蛋获得 金币 ${result.jinbi} 🎉 `
  } else {
    console.log(`\n 砸金蛋: ${result.msg} \n `);
  }
}

//睡觉
async function sleep(timeout = 3 * 1000) {

  let url = {
    url: `https://bububao.duoshoutuan.com/mini/sleep_info`,
    headers: initRequestHeaders(),
  };

  let result = await httpPost(url, `睡觉信息`, timeout);
  if (result.code == 1) {

    console.log(
      `\n 睡觉信息  是否睡觉:${result.is_sleep == 0 ? "是" : "否"} `
    );

    if (result.is_sleep == 0) {
      url = {
        url: `https://bububao.duoshoutuan.com/user/sleep_start`,
        headers: initRequestHeaders(),
      };

      result = await httpPost(url, `开始睡觉`, timeout);
      $.log("开始睡觉")
    }
    else {

      url = {
        url: `https://bububao.duoshoutuan.com/user/sleep_end`,
        headers: initRequestHeaders(),
      };

      result = await httpPost(url, `结束睡觉`, timeout);
      if (result.code == 1) {
        console.log(
          `\n 结束睡觉 获得 金币 ${result.jinbi}  🎉`
        );
        msg += `\n 结束睡觉 获得 金币 ${result.jinbi} 🎉 `
      } else {
        console.log(`\n 结束睡觉: ${result.msg} \n `);
      }
    }

  } else {
    console.log(`\n 睡觉信息: ${result.msg} \n `);
  }
}

//打卡
async function dk_click(timeout = 3 * 1000) {
  let url = {
    url: `https://bububao.duoshoutuan.com/mini/dk_click`,
    headers: initRequestHeaders(),
    body: `now_time=2`
  };

  let result = await httpPost(url, `打卡`, timeout);
  if (result.code == 1) {
    console.log(
      `\n 打卡获得 金币 ${result.jinbi}  🎉`
    );
    msg += `\n 打卡获得 金币 ${result.jinbi} 🎉 `
  } else {
    console.log(`\n 打卡: ${result.msg} \n `);
  }
}

//阅读
async function news(timeout = 3 * 1000, type, tip) {
  let url = {
    url: `https://bububao.duoshoutuan.com/user/news`,
    headers: initRequestHeaders(),
    body: `type_class=${type}`
  };

  let result = await httpPost(url, tip, timeout);
  if (result.code == 1) {
    var str = result.nonce_str;
    url = {
      url: `https://bububao.duoshoutuan.com/user/donenews`,
      headers: initRequestHeaders(),
      body: `nonce_str=${str}`
    };

    await $.wait(20 * 1000)
    result = await httpPost(url, tip, timeout);
    if (result.code == 1) {
      console.log(
        `\n 模拟${tip}获得 金币 ${result.jinbi}  🎉`
      );
      msg += `\n 模拟${tip}获得 金币 ${result.jinbi} 🎉 `
    } else {
      console.log(`\n 模拟${tip}: ${result.msg} \n `);
    }

  } else {
    console.log(`\n ${str}信息: ${result.msg} \n `);
  }
}

//小程序刮卡
async function weguaInfo(timeout = 3 * 1000) {

  let url = {
    url: `https://bububao.duoshoutuan.com/weapp/mini_clicks`,
    headers: initRequestHeaders(),
    body: `mini_id=30`
  };

  let result = await httpPost(url, `小程序信息`, timeout);
  let path = result.mini_path;
  var postJson = path.substring(path.indexOf('{'), path.indexOf('}'));
  var uid = JSON.parse(`${postJson}}`).uid;
  var nonce_str = JSON.parse(`${postJson}}`).nonce_str;

  url = {
    url: `https://bububao.duoshoutuan.com/gua/welist`,
    headers: {
      'Host': 'bububao.duoshoutuan.com',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "nonce_str": nonce_str,
      "uid": uid,
      "mini_id": "30",
      "j_st": 1,
      "ver": "1.3.5",
      "v3": randomDid(12),
      "toto": randomDid(32),
      "token": ""
    })
  };

  result = await httpPost(url, `小程序刮卡信息`, timeout);
  if (result.ka > 0) {

    $.log(`刮卡${result.ka}/15 每次刮1次`)
    var max = Math.max.apply(Math, result.list.map(item => { return item.jine }))
    await wegua(3 * 1000, result.list.find(x => x.jine == max && x.is_ad == 0).id, uid);
  }
  else {
    $.log("刮卡次数已达上限")
  }

}


//刮卡
async function wegua(timeout = 3 * 1000, gid, uid) {
  var addJson = `,"ver":"1.3.5","v3":"232521exhghx","toto":"263d8494554fb3402b7edd22578597fb","token":""`;

  var urlJosn = `{"uid":"${uid}","gid":"${gid}"${addJson}}`;
  console.log(urlJosn)
  let url = {
    url: `https://bububao.duoshoutuan.com/gua/wedet`,
    headers: {
      'Host': 'bububao.duoshoutuan.com',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "gid": gid,
      "uid": uid,
      "ver": "1.3.5",
      "v3": randomDid(12),
      "toto": randomDid(32),
      "token": ""
    })
  };

  let result = await httpPost(url, `小程序刮卡`, timeout);
  var postBody = JSON.stringify({
    "glid": result.glid,
    "gid": gid,
    "uid": uid,
    "sign": result.sign,
    "ver": "1.3.5",
    "v3": randomDid(12),
    "toto": randomDid(32),
    "token": ""
  });
  url = {
    url: `https://bububao.duoshoutuan.com/gua/gua_post`,
    headers: {
      'Host': 'bububao.duoshoutuan.com',
      'Content-Type': 'application/json',
    },
    body: postBody
  };

  await $.wait(1 * 1000);
  result = await httpPost(url, `刮卡`, timeout);
  if (result.suc == 1) {
    console.log(
      `\n 刮卡获得 金币 ${result.jf} `
    );

    url = {
      url: `https://bububao.duoshoutuan.com/gua/fanbei`,
      headers: {
        'Host': 'bububao.duoshoutuan.com',
        'Content-Type': 'application/json',
      },
      body: postBody
    };

    await $.wait(1 * 1000);
    result = await httpPost(url, `刮卡翻倍`, timeout);
    console.log(
      `\n 刮卡翻倍获得 金币 ${result.fb_jinbi} `
    );

    msg += `\n 刮卡获得 金币 ${result.fb_jinbif} 🎉 `

  } else {
    console.log(`\n 刮卡: ${result.msg} \n `);
  }
}

/**
 * 提现   httpPost
 * https://t-api.chyouhui.com/auth/withdraw/apply
 */
async function cash(timeout = 3 * 1000) {

  let url = {
    url: `https://t-api.chyouhui.com/auth/withdraw/apply`,
    headers: {
      'androidToken': ck[0],
      'Host': 't-api.chyouhui.com',
    },
    body: JSON.stringify({
      "amountId": 2,
      "payment": "ALIPAY"
    }),
  };

  let result = await httpPost(url, `提现`, timeout);
  if (result.code == 0) {
    console.log(`\n 提现: ${result.message}  🎉 \n`);
    msg += `\n 提现: ${result.message}  🎉 \n`
  } else if (result.code == -1) {
    console.log(`\n 提现:${result.message} \n`);
    msg += `\n 提现: ${result.message} \n`
  } else {
    console.log(`\n 提现: 提现失败 ❌ ${result} \n `);
  }
}























//#region 固定代码
// ============================================变量检查============================================ \\

async function getCks(ck, str) {


  return new Promise((resolve, reject) => {

    let ckArr = []
    if (ck) {
      if (ck.indexOf("@") != -1) {

        ck.split("@").forEach((item) => {
          ckArr.push(item);
        });
      } else {
        ckArr.push(ck);
      }
      resolve(ckArr)
    } else {
      console.log(`\n 【${$.name}】：未填写变量 ${str}`)
    }

  })
}

// ============================================发送消息============================================ \\

async function SendMsg(message) {
  if (!message) return;

  if (Notify > 0) {
    if ($.isNode()) {
      var notify = require("./sendNotify");
      await notify.sendNotify($.name, message);
    } else {
      $.msg(message);
    }
  } else {
    console.log(message);
  }
}

/**
 * 随机数生成
 */

function randomString(e) {
  e = e || 32;
  var t = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890",
    a = t.length,
    n = "";

  for (i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
  return n;
}

/**
 * 随机整数生成
 */

function randomDid(T = 32) {
  let p = "abcdef0123456789",
    C = p["length"],
    S = '';

  for (i = 0; i < T; i++) {
    S += p["charAt"](Math["floor"](Math["random"]() * C));
  }

  return S;
}

//每日网抑云
function wyy(timeout = 3 * 1000) {
  return new Promise((resolve) => {
    let url = {
      url: `https://keai.icu/apiwyy/api`
    }
    $.get(url, async (err, resp, data) => {
      try {
        data = JSON.parse(data)
        console.log(`\n 【网抑云时间】: ${data.content}  by--${data.music}`);

      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve()
      }
    }, timeout)
  })
}
// ============================================ get请求 ============================================ \\
async function httpGet(getUrlObject, tip, timeout = 3 * 1000) {
  return new Promise((resolve) => {
    let url = getUrlObject;
    if (!tip) {
      let tmp = arguments.callee.toString();
      let re = /function\s*(\w*)/i;
      let matches = re.exec(tmp);
      tip = matches[1];
    }
    if (debug) {
      console.log(
        `\n 【debug】=============== 这是 ${tip} 请求 url ===============`
      );
      console.log(url);
    }

    $.get(
      url,
      async (error, response, _data) => {
        try {
          if (debug) {
            console.log(
              `\n\n 【debug】===============这是 ${tip} 返回data==============`
            );
            console.log(_data);
            console.log(`======`);
            console.log(JSON.parse(_data));
          }
          let result = JSON.parse(_data);
          resolve(result);
        } catch (e) {
          console.log(e);
        } finally {
          resolve();
        }
      },
      timeout
    );
  });
}

// ============================================ post请求 ============================================ \\
async function httpPost(postUrlObject, tip, timeout = 3 * 1000) {
  return new Promise((resolve) => {
    let url = postUrlObject;
    if (!tip) {
      let tmp = arguments.callee.toString();
      let re = /function\s*(\w*)/i;
      let matches = re.exec(tmp);
      tip = matches[1];
    }
    if (debug) {
      console.log(
        `\n 【debug】=============== 这是 ${tip} 请求 url ===============`
      );
      console.log(url);
    }

    $.post(
      url,
      async (error, response, data) => {
        try {
          if (debug) {
            console.log(
              `\n\n 【debug】===============这是 ${tip} 返回data==============`
            );
            console.log(data);
            console.log(`======`);
            console.log(JSON.parse(data));
          }
          let result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          console.log(e);
        } finally {
          resolve();
        }
      },
      timeout
    );
  });
}

async function requestPost(postUrlObject, tip, timeout = 3 * 1000) {
  return new Promise((resolve) => {
    var options = {
      'method': 'POST',
      'url': postUrlObject.url,
      'headers': postUrlObject.headers,
      body: postUrlObject.body
    };
    if (debug) {
      console.log(
        `\n 【debug】=============== 这是 ${tip} 请求 url ===============`
      );
      console.log(options);
    }
    request(options, function (error, response) {
      if (error) throw new Error(error);
      if (debug) {
        console.log(
          `\n\n 【debug】===============这是 ${tip} 返回data==============`
        );
        console.log(response.body);
        console.log(`======`);
        console.log(JSON.parse(response.body));
      }
      let result = JSON.parse(response.body);
      resolve(result);
    });


  });
}

// ============================================ debug调试 ============================================ \\
function debugLog(...args) {
  if (debug) {
    console.log(...args);
  }
}

//#endregion

// prettier-ignore
function MD5Encrypt(a) {
  function b(a, b) {
    return a << b | a >>> 32 - b
  }

  function c(a, b) {
    var c, d, e, f, g;
    return e = 2147483648 & a, f = 2147483648 & b, c = 1073741824 & a, d = 1073741824 & b, g = (1073741823 & a) + (
      1073741823 & b), c & d ? 2147483648 ^ g ^ e ^ f : c | d ? 1073741824 & g ? 3221225472 ^ g ^ e ^ f :
        1073741824 ^ g ^ e ^ f : g ^ e ^ f
  }

  function d(a, b, c) {
    return a & b | ~a & c
  }

  function e(a, b, c) {
    return a & c | b & ~c
  }

  function f(a, b, c) {
    return a ^ b ^ c
  }

  function g(a, b, c) {
    return b ^ (a | ~c)
  }

  function h(a, e, f, g, h, i, j) {
    return a = c(a, c(c(d(e, f, g), h), j)), c(b(a, i), e)
  }

  function i(a, d, f, g, h, i, j) {
    return a = c(a, c(c(e(d, f, g), h), j)), c(b(a, i), d)
  }

  function j(a, d, e, g, h, i, j) {
    return a = c(a, c(c(f(d, e, g), h), j)), c(b(a, i), d)
  }

  function k(a, d, e, f, h, i, j) {
    return a = c(a, c(c(g(d, e, f), h), j)), c(b(a, i), d)
  }

  function l(a) {
    for (var b, c = a.length, d = c + 8, e = (d - d % 64) / 64, f = 16 * (e + 1), g = new Array(f - 1), h = 0, i =
      0; c > i;) b = (i - i % 4) / 4, h = i % 4 * 8, g[b] = g[b] | a.charCodeAt(i) << h, i++;
    return b = (i - i % 4) / 4, h = i % 4 * 8, g[b] = g[b] | 128 << h, g[f - 2] = c << 3, g[f - 1] = c >>> 29, g
  }

  function m(a) {
    var b, c, d = "",
      e = "";
    for (c = 0; 3 >= c; c++) b = a >>> 8 * c & 255, e = "0" + b.toString(16), d += e.substr(e.length - 2, 2);
    return d
  }

  function n(a) {
    a = a.replace(/\r\n/g, "\n");
    for (var b = "", c = 0; c < a.length; c++) {
      var d = a.charCodeAt(c);
      128 > d ? b += String.fromCharCode(d) : d > 127 && 2048 > d ? (b += String.fromCharCode(d >> 6 | 192), b +=
        String.fromCharCode(63 & d | 128)) : (b += String.fromCharCode(d >> 12 | 224), b += String.fromCharCode(
          d >> 6 & 63 | 128), b += String.fromCharCode(63 & d | 128))
    }
    return b
  }
  var o, p, q, r, s, t, u, v, w, x = [],
    y = 7,
    z = 12,
    A = 17,
    B = 22,
    C = 5,
    D = 9,
    E = 14,
    F = 20,
    G = 4,
    H = 11,
    I = 16,
    J = 23,
    K = 6,
    L = 10,
    M = 15,
    N = 21;
  for (a = n(a), x = l(a), t = 1732584193, u = 4023233417, v = 2562383102, w = 271733878, o = 0; o < x.length; o +=
    16) p = t, q = u, r = v, s = w, t = h(t, u, v, w, x[o + 0], y, 3614090360), w = h(w, t, u, v, x[o + 1], z,
      3905402710), v = h(v, w, t, u, x[o + 2], A, 606105819), u = h(u, v, w, t, x[o + 3], B, 3250441966), t = h(t,
        u, v, w, x[o + 4], y, 4118548399), w = h(w, t, u, v, x[o + 5], z, 1200080426), v = h(v, w, t, u, x[o + 6],
          A, 2821735955), u = h(u, v, w, t, x[o + 7], B, 4249261313), t = h(t, u, v, w, x[o + 8], y, 1770035416), w =
      h(w, t, u, v, x[o + 9], z, 2336552879), v = h(v, w, t, u, x[o + 10], A, 4294925233), u = h(u, v, w, t, x[o + 11],
        B, 2304563134), t = h(t, u, v, w, x[o + 12], y, 1804603682), w = h(w, t, u, v, x[o + 13], z, 4254626195), v =
      h(v, w, t, u, x[o + 14], A, 2792965006), u = h(u, v, w, t, x[o + 15], B, 1236535329), t = i(t, u, v, w, x[o + 1],
        C, 4129170786), w = i(w, t, u, v, x[o + 6], D, 3225465664), v = i(v, w, t, u, x[o + 11], E, 643717713), u =
      i(u, v, w, t, x[o + 0], F, 3921069994), t = i(t, u, v, w, x[o + 5], C, 3593408605), w = i(w, t, u, v, x[o + 10],
        D, 38016083), v = i(v, w, t, u, x[o + 15], E, 3634488961), u = i(u, v, w, t, x[o + 4], F, 3889429448), t =
      i(t, u, v, w, x[o + 9], C, 568446438), w = i(w, t, u, v, x[o + 14], D, 3275163606), v = i(v, w, t, u, x[o + 3],
        E, 4107603335), u = i(u, v, w, t, x[o + 8], F, 1163531501), t = i(t, u, v, w, x[o + 13], C, 2850285829), w =
      i(w, t, u, v, x[o + 2], D, 4243563512), v = i(v, w, t, u, x[o + 7], E, 1735328473), u = i(u, v, w, t, x[o + 12],
        F, 2368359562), t = j(t, u, v, w, x[o + 5], G, 4294588738), w = j(w, t, u, v, x[o + 8], H, 2272392833), v =
      j(v, w, t, u, x[o + 11], I, 1839030562), u = j(u, v, w, t, x[o + 14], J, 4259657740), t = j(t, u, v, w, x[o + 1],
        G, 2763975236), w = j(w, t, u, v, x[o + 4], H, 1272893353), v = j(v, w, t, u, x[o + 7], I, 4139469664), u =
      j(u, v, w, t, x[o + 10], J, 3200236656), t = j(t, u, v, w, x[o + 13], G, 681279174), w = j(w, t, u, v, x[o + 0],
        H, 3936430074), v = j(v, w, t, u, x[o + 3], I, 3572445317), u = j(u, v, w, t, x[o + 6], J, 76029189), t = j(
          t, u, v, w, x[o + 9], G, 3654602809), w = j(w, t, u, v, x[o + 12], H, 3873151461), v = j(v, w, t, u, x[o +
            15], I, 530742520), u = j(u, v, w, t, x[o + 2], J, 3299628645), t = k(t, u, v, w, x[o + 0], K, 4096336452),
      w = k(w, t, u, v, x[o + 7], L, 1126891415), v = k(v, w, t, u, x[o + 14], M, 2878612391), u = k(u, v, w, t, x[o +
        5], N, 4237533241), t = k(t, u, v, w, x[o + 12], K, 1700485571), w = k(w, t, u, v, x[o + 3], L, 2399980690),
      v = k(v, w, t, u, x[o + 10], M, 4293915773), u = k(u, v, w, t, x[o + 1], N, 2240044497), t = k(t, u, v, w, x[o +
        8], K, 1873313359), w = k(w, t, u, v, x[o + 15], L, 4264355552), v = k(v, w, t, u, x[o + 6], M, 2734768916),
      u = k(u, v, w, t, x[o + 13], N, 1309151649), t = k(t, u, v, w, x[o + 4], K, 4149444226), w = k(w, t, u, v, x[o +
        11], L, 3174756917), v = k(v, w, t, u, x[o + 2], M, 718787259), u = k(u, v, w, t, x[o + 9], N, 3951481745),
      t = c(t, p), u = c(u, q), v = c(v, r), w = c(w, s);
  var O = m(t) + m(u) + m(v) + m(w);
  return O.toLowerCase()
}

function Env(t, e) {
  "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);
  class s {
    constructor(t) {
      this.env = t
    }
    send(t, e = "GET") {
      t = "string" == typeof t ? {
        url: t
      } : t;
      let s = this.get;
      return "POST" === e && (s = this.post), new Promise((e, i) => {
        s.call(this, t, (t, s, r) => {
          t ? i(t) : e(s)
        })
      })
    }
    get(t) {
      return this.send.call(this.env, t)
    }
    post(t) {
      return this.send.call(this.env, t, "POST")
    }
  }
  return new class {
    constructor(t, e) {
      this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [],
        this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date)
          .getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`)
    }
    isNode() {
      return "undefined" != typeof module && !!module.exports
    }
    isQuanX() {
      return "undefined" != typeof $task
    }
    isSurge() {
      return "undefined" != typeof $httpClient && "undefined" == typeof $loon
    }
    isLoon() {
      return "undefined" != typeof $loon
    }
    toObj(t, e = null) {
      try {
        return JSON.parse(t)
      } catch {
        return e
      }
    }
    toStr(t, e = null) {
      try {
        return JSON.stringify(t)
      } catch {
        return e
      }
    }
    getjson(t, e) {
      let s = e;
      const i = this.getdata(t);
      if (i) try {
        s = JSON.parse(this.getdata(t))
      } catch { }
      return s
    }
    setjson(t, e) {
      try {
        return this.setdata(JSON.stringify(t), e)
      } catch {
        return !1
      }
    }
    getScript(t) {
      return new Promise(e => {
        this.get({
          url: t
        }, (t, s, i) => e(i))
      })
    }
    runScript(t, e) {
      return new Promise(s => {
        let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
        i = i ? i.replace(/\n/g, "").trim() : i;
        let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
        r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r;
        const [o, h] = i.split("@"), n = {
          url: `http://${h}/v1/scripting/evaluate`,
          body: {
            script_text: t,
            mock_type: "cron",
            timeout: r
          },
          headers: {
            "X-Key": o,
            Accept: "*/*"
          }
        };
        this.post(n, (t, e, i) => s(i))
      }).catch(t => this.logErr(t))
    }
    loaddata() {
      if (!this.isNode()) return {}; {
        this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
        const t = this.path.resolve(this.dataFile),
          e = this.path.resolve(process.cwd(), this.dataFile),
          s = this.fs.existsSync(t),
          i = !s && this.fs.existsSync(e);
        if (!s && !i) return {}; {
          const i = s ? t : e;
          try {
            return JSON.parse(this.fs.readFileSync(i))
          } catch (t) {
            return {}
          }
        }
      }
    }
    writedata() {
      if (this.isNode()) {
        this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
        const t = this.path.resolve(this.dataFile),
          e = this.path.resolve(process.cwd(), this.dataFile),
          s = this.fs.existsSync(t),
          i = !s && this.fs.existsSync(e),
          r = JSON.stringify(this.data);
        s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r)
      }
    }
    lodash_get(t, e, s) {
      const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
      let r = t;
      for (const t of i)
        if (r = Object(r)[t], void 0 === r) return s;
      return r
    }
    lodash_set(t, e, s) {
      return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(
        0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >>
          0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t)
    }
    getdata(t) {
      let e = this.getval(t);
      if (/^@/.test(t)) {
        const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : "";
        if (r) try {
          const t = JSON.parse(r);
          e = t ? this.lodash_get(t, i, "") : e
        } catch (t) {
          e = ""
        }
      }
      return e
    }
    setdata(t, e) {
      let s = !1;
      if (/^@/.test(e)) {
        const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o ||
          "{}" : "{}";
        try {
          const e = JSON.parse(h);
          this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i)
        } catch (e) {
          const o = {};
          this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i)
        }
      } else s = this.setval(t, e);
      return s
    }
    getval(t) {
      return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(
        t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] ||
          null
    }
    setval(t, e) {
      return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(
        t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !
          0) : this.data && this.data[e] || null
    }
    initGotEnv(t) {
      this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough :
        require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t &&
        (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar &&
          (t.cookieJar = this.ckjar))
    }
    get(t, e = (() => { })) {
      t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() ||
        this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(
          t.headers, {
          "X-Surge-Skip-Scripting": !1
        })), $httpClient.get(t, (t, s, i) => {
          !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
        })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
          hints: !1
        })), $task.fetch(t).then(t => {
          const {
            statusCode: s,
            statusCode: i,
            headers: r,
            body: o
          } = t;
          e(null, {
            status: s,
            statusCode: i,
            headers: r,
            body: o
          }, o)
        }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => {
          try {
            if (t.headers["set-cookie"]) {
              const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
              s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar
            }
          } catch (t) {
            this.logErr(t)
          }
        }).then(t => {
          const {
            statusCode: s,
            statusCode: i,
            headers: r,
            body: o
          } = t;
          e(null, {
            status: s,
            statusCode: i,
            headers: r,
            body: o
          }, o)
        }, t => {
          const {
            message: s,
            response: i
          } = t;
          e(s, i, i && i.body)
        }))
    }
    post(t, e = (() => { })) {
      if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] =
        "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this
          .isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers ||
            {}, Object.assign(t.headers, {
              "X-Surge-Skip-Scripting": !1
            })), $httpClient.post(t, (t, s, i) => {
              !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            });
      else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(
        t.opts, {
        hints: !1
      })), $task.fetch(t).then(t => {
        const {
          statusCode: s,
          statusCode: i,
          headers: r,
          body: o
        } = t;
        e(null, {
          status: s,
          statusCode: i,
          headers: r,
          body: o
        }, o)
      }, t => e(t));
      else if (this.isNode()) {
        this.initGotEnv(t);
        const {
          url: s,
          ...i
        } = t;
        this.got.post(s, i).then(t => {
          const {
            statusCode: s,
            statusCode: i,
            headers: r,
            body: o
          } = t;
          e(null, {
            status: s,
            statusCode: i,
            headers: r,
            body: o
          }, o)
        }, t => {
          const {
            message: s,
            response: i
          } = t;
          e(s, i, i && i.body)
        })
      }
    }
    time(t, e = null) {
      const s = e ? new Date(e) : new Date;
      let i = {
        "M+": s.getMonth() + 1,
        "d+": s.getDate(),
        "H+": s.getHours(),
        "m+": s.getMinutes(),
        "s+": s.getSeconds(),
        "q+": Math.floor((s.getMonth() + 3) / 3),
        S: s.getMilliseconds()
      };
      /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length)));
      for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ?
        i[e] : ("00" + i[e]).substr(("" + i[e]).length)));
      return t
    }
    msg(e = t, s = "", i = "", r) {
      const o = t => {
        if (!t) return t;
        if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? {
          "open-url": t
        } : this.isSurge() ? {
          url: t
        } : void 0;
        if ("object" == typeof t) {
          if (this.isLoon()) {
            let e = t.openUrl || t.url || t["open-url"],
              s = t.mediaUrl || t["media-url"];
            return {
              openUrl: e,
              mediaUrl: s
            }
          }
          if (this.isQuanX()) {
            let e = t["open-url"] || t.url || t.openUrl,
              s = t["media-url"] || t.mediaUrl;
            return {
              "open-url": e,
              "media-url": s
            }
          }
          if (this.isSurge()) {
            let e = t.url || t.openUrl || t["open-url"];
            return {
              url: e
            }
          }
        }
      };
      if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() &&
        $notify(e, s, i, o(r))), !this.isMuteLog) {
        let t = ["", "==============📣系统通知📣=============="];
        t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(
          t)
      }
    }
    log(...t) {
      t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator))
    }
    logErr(t, e) {
      const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
      s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t)
    }
    wait(t) {
      return new Promise(e => setTimeout(e, t))
    }
    done(t = {}) {
      const e = (new Date).getTime(),
        s = (e - this.startTime) / 1e3;
      this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() ||
        this.isLoon()) && $done(t)
    }
  }(t, e)
}