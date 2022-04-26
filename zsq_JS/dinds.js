/**
 * 叮咚买菜APP，叮咚果园
 * 地址： https://raw.githubusercontent.com/sofm13/qinlongjs/master/dinds.js
 * 
 * cron  5 8,11,17 * * *     sofm13_qinlongjs_master/dinds.js
 * 
 * 4-26   叮咚买菜App签到,叮咚果园自动浇水，领福袋，每日签到，连续签到，浏览商品，完成任务等
 * 暂无叮咚鱼塘，有需求可加入tg：https://t.me/zsq_ql, https://t.me/zsq_sofm13 联系群主 @sofm_13 或Q群978963762来一起交流啊
 * 
 * 抓包方式 进入叮咚果园随机抓取接口取Cookie即可
 * 
 * ========= 青龙 =========
 * 变量格式：export dindong_cookie=' xxxx & xxx @  xxxx & xxx '  多个账号用 @分割 
 * 
 */

const jsname = "叮咚买菜";
const $ = Env(jsname);
const notify = $.isNode() ? require('./sendNotify') : ''; // 这里是 node（青龙属于node环境）通知相关的
const Notify = 1; //0为关闭通知，1为打开通知,默认为1
const debug = 0; //0为关闭调试，1为打开调试,默认为0
//////////////////////
let dindong_ck = process.env.dindong_cookie; // 这里是 从青龙的 配置文件 读取你写的变量
let dindong_ckArr = [];
let ck = '';
let uid = '';
let seedId = '';
let propid = '';
let propsCode = '';
let amount = 0;
let percent = 0;
let threeFood = {};
let meiriqd = {};
let lianxuqd = {};
let viewPro = {};
let timesFeed = {};
let msg = '';


!(async () => {

    if (!(await MoreUser())) //多账号分割 判断变量是否为空  初步处理多账号
        return;
    else {

        console.log(
            `\n\n=========================================    \n脚本执行 - 北京时间(UTC+8)：${new Date(
                new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 +
                8 * 60 * 60 * 1000).toLocaleString()} \n=========================================\n`
        );

        console.log(`\n=================== 共找到 ${dindong_ckArr.length} 个账号 ===================`)

        if (debug) {
            console.log(`【debug】 这是你的全部账号:\n ${dindong_ckArr}`);
        }


        for (let index = 0; index < dindong_ckArr.length; index++) {


            let num = index + 1
            console.log(`\n========= 开始【第 ${num} 个账号】=========\n`)

            ck = dindong_ckArr[index].split('&'); // 这里是分割你每个账号的每个小项   

            //个人信息
            await userDetail();
            if (debug) {
                console.log(`\n 【debug】 这是你第 ${num} 账号信息uid:\n ${uid}\n`);
            }

            console.log(`\n 开始签到 \n`);
            await signin();

            console.log(`\n 查询任务列表 \n`);
            await getTask()

            console.log(`\n 开始执行三餐开福袋 \n`);
            if (threeFood.buttonStatus == 'TO_ACHIEVE') {
                await achieve(3 * 1000, threeFood.taskCode, "三餐开福袋");
            }
            else {
                console.log(`\n 不在执行时间范围内或已完成 \n`);
            }

            console.log(`\n 开始执行每日签到,第${meiriqd.continuousDays}天 \n`);
            if (meiriqd.buttonStatus == 'TO_ACHIEVE') {
                await achieve(3 * 1000, meiriqd.taskCode, "每日签到");
            }
            else {
                console.log(`\n 已完成 \n`);
            }

            console.log(`\n 开始执行连续签到 \n`);
            if (lianxuqd.buttonStatus == 'TO_ACHIEVE') {
                await achieve(3 * 1000, lianxuqd.taskCode, "连续签到");
            }
            else {
                console.log(`\n 已完成 \n`);
            }

            console.log(`\n 开始执行浏览商品 \n`);
            if (viewPro.buttonStatus == 'TO_ACHIEVE') {
                let taksLogId = await achieve(3 * 1000, viewPro.taskCode, "浏览商品");
                await reward(3 * 1000, taksLogId);
            }
            else if (viewPro.buttonStatus == 'TO_REWARD') {
                await reward(3 * 1000, viewPro.userTaskLogId);
            }
            else {
                console.log(`\n 已完成 \n`);
            }

            //随机任务
            if (timesFeed != undefined && timesFeed.buttonStatus == 'TO_REWARD') {
                console.log(`\n 开始执行随机任务 \n`);
                await achieve(3 * 1000, timesFeed.taskCode, "领取浇水十次水滴");
            }
            else {
                console.log(`\n 已完成 \n`);
            }

            //放在最后
            await userDetail();
            console.log(`\n 开始浇水 \n`);

            while (amount > 10) {
                await jiaoSui();
            }

            // 这里是开始做任务    需要注意的点
            // 	1. await只能运行与async函数中
            // 	2. 函数的名字不可以相同
            //      3. 不够可以自己复制





            msg += `\n 第 ${num} 账号信息uid: ${uid} 已完成${percent}%完成 \n`;

        }
        console.log(msg);
        await SendMsg(msg); // 与发送通知有关系
    }

})()
    .catch((e) => console.log(e))
    .finally(() => $.done())


//果园信息
function userDetail(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `https://farm.api.ddxq.mobi/api/v2/userguide/orchard/detail`,    // 这是请求的 url 可以直接用我们抓包、精简后的URL
            headers: {            // headers 是请求体  可以直接用精简后的 hd  也就是服务器校验的部分，他需要啥，我们就给他啥  
                "Content-Type": "application/json;charset=UTF-8",
                "Host": "farm.api.ddxq.mobi",
                "User-Agent": "Mozilla/5.0 (Linux; Android 12; IN2020 Build/SKQ1.210216.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/89.0.4389.72 MQQBrowser/6.2 TBS/046011 Mobile Safari/537.36 xzone/9.44.0",
                "cookie": ck,
                "Connection": "keep-alive",
                "ddmc-game-tid": 2,
                "accept": "*/*"
            },
        }

        $.get(url, async (error, response, data) => {     // 这是一个 get 请求 , 如果是 post  记得把这里改了 
            try {
                if (debug) {
                    console.log(data)
                }

                let result = JSON.parse(data);
                if (result.code == 0) {        // 这里是根据服务器返回的数据做判断  方便我们知道任务是否完成了

                    console.log(`\n【获取个人信息】成功了呢 🎉 `)
                    uid = result.data.guideProVos.ORCHARD_FRIEND_ONE.userId;
                    seedId = result.data.baseSeed.seedId;
                    propid = result.data.feed.propsId;
                    amount = result.data.feed.amount;
                    propsCode = result.data.feed.propsCode;
                    percent = parseFloat(result.data.baseSeed.expPercent);
                } else {    // 这里是根据服务器返回的数据做判断  方便我们知道任务是否完成了

                    console.log(`\n【获取个人信息】 失败 ❌ 了呢,可能是网络被外星人抓走了!\n `)
                }

            } catch (e) {
                console.log(e);
            } finally {
                resolve()
            }
        }, timeout)
    })
}

//任务列表
function getTask(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `https://farm.api.ddxq.mobi/api/v2/task/list-orchard?uid=${uid}&reward=${propsCode}`,    // 这是请求的 url 可以直接用我们抓包、精简后的URL
            headers: {            // headers 是请求体  可以直接用精简后的 hd  也就是服务器校验的部分，他需要啥，我们就给他啥  
                "Content-Type": "application/json;charset=UTF-8",
                "Host": "farm.api.ddxq.mobi",
                "User-Agent": "Mozilla/5.0 (Linux; Android 12; IN2020 Build/SKQ1.210216.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/89.0.4389.72 MQQBrowser/6.2 TBS/046011 Mobile Safari/537.36 xzone/9.44.0",
                "cookie": ck,
                "Connection": "keep-alive",
                "ddmc-game-tid": 2,
                "accept": "*/*"
            },
        }

        if (debug) {
            console.log(`\n 【debug】=============== 这是 任务列表 请求 url ===============`);
            console.log(url);
        }

        $.get(url, async (error, response, data) => {     // 这是一个 get 请求 , 如果是 post  记得把这里改了 
            try {
                if (debug) {
                    console.log(data)
                }

                let result = JSON.parse(data);
                if (result.code == 0) {        // 这里是根据服务器返回的数据做判断  方便我们知道任务是否完成了

                    console.log(`\n【获取任务】成功了呢 🎉 `)
                    threeFood = result.data.userTasks.find(x => x.taskName == "三餐开福袋");
                    meiriqd = result.data.userTasks.find(x => x.taskName == "每日签到");
                    lianxuqd = result.data.userTasks.find(x => x.taskName == "连续签到");
                    viewPro = result.data.userTasks.find(x => x.taskName == "浏览商品奖水滴");
                    timesFeed = result.data.userTasks.find(x => x.taskName == "浇水10次送水滴");
                } else {    // 这里是根据服务器返回的数据做判断  方便我们知道任务是否完成了

                    console.log(`\n【获取任务】 失败 ❌ 了呢,可能是网络被外星人抓走了!\n `)
                }

            } catch (e) {
                console.log(e);
            } finally {
                resolve()
            }
        }, timeout)
    })
}

//执行任务
function achieve(timeout = 3 * 1000, code, str) {
    return new Promise((resolve) => {
        let url = {
            url: `https://farm.api.ddxq.mobi/api/v2/task/achieve?uid=${uid}&taskCode=${code}`,    // 这是请求的 url 可以直接用我们抓包、精简后的URL
            headers: {            // headers 是请求体  可以直接用精简后的 hd  也就是服务器校验的部分，他需要啥，我们就给他啥  
                "Content-Type": "application/json;charset=UTF-8",
                "Host": "farm.api.ddxq.mobi",
                "User-Agent": "Mozilla/5.0 (Linux; Android 12; IN2020 Build/SKQ1.210216.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/89.0.4389.72 MQQBrowser/6.2 TBS/046011 Mobile Safari/537.36 xzone/9.44.0",
                "cookie": ck,
                "Connection": "keep-alive",
                "ddmc-game-tid": 2,
                "accept": "*/*"
            },
        }

        $.get(url, async (error, response, data) => {     // 这是一个 get 请求 , 如果是 post  记得把这里改了 
            try {
                if (debug) {
                    console.log(data)
                }

                let result = JSON.parse(data);
                if (result.code == 0) {        // 这里是根据服务器返回的数据做判断  方便我们知道任务是否完成了

                    console.log(`\n【执行${str}】成功了呢 🎉 `)
                    if (result.data.userTaskLogId != '') {
                        return result.data.userTaskLogId;
                    }
                } else {    // 这里是根据服务器返回的数据做判断  方便我们知道任务是否完成了

                    console.log(`\n【执行${str}】 失败 ❌ 了呢,可能是网络被外星人抓走了!\n `)
                }

            } catch (e) {
                console.log(e);
            } finally {
                resolve()
            }
        }, timeout)
    })
}

//浇水
function jiaoSui(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `https://farm.api.ddxq.mobi/api/v2/props/feed?propsCode=${propsCode}&uid=${uid}&seedId=${seedId}&propsId=${propid}`,    // 这是请求的 url 可以直接用我们抓包、精简后的URL
            headers: {            // headers 是请求体  可以直接用精简后的 hd  也就是服务器校验的部分，他需要啥，我们就给他啥  
                "Content-Type": "application/json;charset=UTF-8",
                "Host": "farm.api.ddxq.mobi",
                "User-Agent": "Mozilla/5.0 (Linux; Android 12; IN2020 Build/SKQ1.210216.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/89.0.4389.72 MQQBrowser/6.2 TBS/046011 Mobile Safari/537.36 xzone/9.44.0",
                "cookie": ck,
                "Connection": "keep-alive",
                "ddmc-game-tid": 2,
                "accept": "*/*"
            },
            // body: '',       // 这是一个 get 请求，没有请求体 body   如果是 post 不要忘记他鸭！

        }

        $.get(url, async (error, response, data) => {     // 这是一个 get 请求 , 如果是 post  记得把这里改了 
            try {
                if (debug) {
                    console.log(data)
                }

                let result = JSON.parse(data);
                if (result.code == 0) {        // 这里是根据服务器返回的数据做判断  方便我们知道任务是否完成了

                    amount = result.data.props.amount;
                    percent = parseFloat(result.data.seed.expPercent);
                    console.log(`\n【浇水】 成功了呢,${result.data.seed.msg} 🎉 `)
                } else {    // 这里是根据服务器返回的数据做判断  方便我们知道任务是否完成了

                    console.log(`\n【第${num}次浇水】 失败 ❌ 了呢,可能是网络被外星人抓走了!\n `)
                }

            } catch (e) {
                console.log(e);
            } finally {
                resolve()
            }
        }, timeout)
    })
}

//领取水滴
function reward(timeout = 3 * 1000, taksLogId) {
    return new Promise((resolve) => {
        let url = {
            url: `https://farm.api.ddxq.mobi/api/v2/task/reward?uid=${uid}&userTaskLogId=${taksLogId}`,    // 这是请求的 url 可以直接用我们抓包、精简后的URL
            headers: {            // headers 是请求体  可以直接用精简后的 hd  也就是服务器校验的部分，他需要啥，我们就给他啥  
                "Content-Type": "application/json;charset=UTF-8",
                "Host": "farm.api.ddxq.mobi",
                "User-Agent": "Mozilla/5.0 (Linux; Android 12; IN2020 Build/SKQ1.210216.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/89.0.4389.72 MQQBrowser/6.2 TBS/046011 Mobile Safari/537.36 xzone/9.44.0",
                "cookie": ck,
                "Connection": "keep-alive",
                "ddmc-game-tid": 2,
                "accept": "*/*"
            },
            // body: '',       // 这是一个 get 请求，没有请求体 body   如果是 post 不要忘记他鸭！

        }

        $.get(url, async (error, response, data) => {     // 这是一个 get 请求 , 如果是 post  记得把这里改了 
            try {
                if (debug) {
                    console.log(data)
                }

                let result = JSON.parse(data);
                if (result.code == 0) {        // 这里是根据服务器返回的数据做判断  方便我们知道任务是否完成了

                    console.log(`\n 【领取水滴】 成功了呢 🎉 `)

                } else {    // 这里是根据服务器返回的数据做判断  方便我们知道任务是否完成了

                    console.log(`\n【领取水滴】 失败 ❌ 了呢,可能是网络被外星人抓走了!\n `)
                }

            } catch (e) {
                console.log(e);
            } finally {
                resolve()
            }
        }, timeout)
    })
}

//签到
function signin(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `https://sunquan.api.ddxq.mobi/api/v2/user/signin/`,    // 这是请求的 url 可以直接用我们抓包、精简后的URL
            headers: {            // headers 是请求体  可以直接用精简后的 hd  也就是服务器校验的部分，他需要啥，我们就给他啥  
                "Content-Type": "application/x-www-form-urlencoded",
                "Host": "sunquan.api.ddxq.mobi",
                "User-Agent": "Mozilla/5.0 (Linux; Android 12; IN2020 Build/SKQ1.210216.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/89.0.4389.72 MQQBrowser/6.2 TBS/046011 Mobile Safari/537.36 xzone/9.44.0",
                "cookie": ck,
                "Connection": "keep-alive",
                "accept": "*/*"
            },
        }

        $.post(url, async (error, response, data) => {     // 这是一个 get 请求 , 如果是 post  记得把这里改了 
            try {
                if (debug) {
                    console.log(data)
                }

                let result = JSON.parse(data);
                if (result.code == 0) {        // 这里是根据服务器返回的数据做判断  方便我们知道任务是否完成了

                    console.log(`\n【签到成功】成功了呢,第${result.data.sign_series}天 🎉 `)
                } else {    // 这里是根据服务器返回的数据做判断  方便我们知道任务是否完成了

                    console.log(`\n【签到成功】 失败 ❌ 了呢,可能是网络被外星人抓走了!\n `)
                }

            } catch (e) {
                console.log(e);
            } finally {
                resolve()
            }
        }, timeout)
    })
}

//#region 固定代码 可以不管他
// ============================================变量检查============================================ \\
async function MoreUser() {
    if (dindong_ck) {
        if (dindong_ck.indexOf("@") != -1) {
            dindong_ck.split("@").forEach((item) => {
                dindong_ckArr.push(item);
            });
        } else {
            dindong_ckArr.push(dindong_ck);
        }
    } else {
        console.log(`\n 【${$.name}】：未填写变量 dindong_ck`)
        return;
    }

    return true;
}

// ============================================发送消息============================================ \\
async function SendMsg(message) {
    if (!message)
        return;

    if (Notify > 0) {
        if ($.isNode()) {
            var notify = require('./sendNotify');
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
    for (i = 0; i < e; i++)
        n += t.charAt(Math.floor(Math.random() * a));
    return n
}

/**
 * 随机整数生成
 */
function randomInt(min, max) {
    return Math.round(Math.random() * (max - min) + min)
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
                return data.content;
            } catch (e) {
                console.log(e, resp);
            } finally {
                resolve()
            }
        }, timeout)
    })
}

//#endregion


// prettier-ignore   固定代码  不用管他
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