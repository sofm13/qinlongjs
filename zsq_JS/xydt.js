/**
 * 幸运答题，余额达50元即可提现，定时收货红包与答题卡，答题需要自己手动
 * 
 * 地址： https://raw.githubusercontent.com/sofm13/qinlongjs/master/zsq_JS/xydt.js
 * 
 * cron  5 * * * *     sofm13_qinlongjs_master/xydt.js
 * 
 * 有需求可加入tg：https://t.me/zsq_ql, https://t.me/zsq_sofm13 联系群主 @sofm_13 或Q群978963762来一起交流啊
 * 
 * 抓包方式 进入小程序随机抓取接口 xcx.szlzyd.com 取body内的openid与customKey即可
 * 
 * ========= 青龙 =========
 * 变量格式：export xydt='openId=?&key=? @ openId=?&key=? '  多个账号用 @分割 
 * 
 */


// @ts-ignore
const $ = new Env("幸运答题")
const request = require('request');
// @ts-ignore
const Notify = 1 //0为关闭通知，1为打开通知,默认为1
const debug = 0 //0为关闭调试，1为打开调试,默认为0
//////////////////////

const initRequestHeaders = () => {
	return {
		"User-Agent": "Mozilla/5.0 (Linux; Android 12; IN2020 Build/SKQ1.210216.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3211 MMWEBSDK/20211001 Mobile Safari/537.36 MMWEBID/87 MicroMessenger/8.0.16.2040(0x2800105F) Process/appbrand2 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android",
		"content-type": "application/json",
		'Host': 'xcx.szlzyd.com',
	};
}

let msg = ''
let ck = ''
// @ts-ignore
let ckStr = process.env.xydt
//let ckStr = 'openId=o0T6Q4kfZv690MLnnu3NPEBJtqGg&key=0840CB4E77D3AB3A234B'
let ckStrArr = []
let guids = '';
/////////////////////////////////////////////////////////
const taskType = [{ "name": "领取红包", "value": 54 }, { "name": "漂浮答题卡", "value": 90 }, { "name": "领取答题卡", "value": 92 }];
const signDay = {
	"1": 72,
	"2": 74,
	"3": 76,
	"4": 78,
	"5": 80,
	"6": 82,
	"7": 84
}

!(async () => {

	if (!(await MoreUser())) //多账号分割 判断变量是否为空  初步处理多账号
		return;
	else {

		await wyy();
		console.log(
			`\n\n=========================================    \n脚本执行 - 北京时间(UTC+8)：${new Date(
				new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 +
				8 * 60 * 60 * 1000).toLocaleString()} \n=========================================\n`
		);

		console.log(`\n=================== 共找到 ${ckStrArr.length} 个账号 ===================`)

		if (debug) {
			console.log(`【debug】 这是你的全部账号:\n ${ckStrArr}`);
		}


		for (let index = 0; index < ckStrArr.length; index++) {

			let num = index + 1
			console.log(`\n========= 开始【第 ${num} 个账号】=========\n`)

			ck = ckStrArr[index].split('&'); // 这里是分割你每个账号的每个小项   

			let openid = ck[0].split('=')[1];
			let key = ck[1].split('=')[1];

			for (let i = 0; i < taskType.length; i++) {

				$.log(`开始执行${taskType[i].name} `)
				await postKa(openid, key, taskType[i].value, generateUUID())
			}

			for (const [k, v] of Object.entries(signDay)) {
				$.log(`开始签到 ${v}`)
				await postKa(openid, key, v, generateUUID())
			}

			await sign(openid, key, generateUUID())
			var datika = await getBonusesNum(openid, key, generateUUID())

			var answerId = 0;
			var correct = "";
			var isfirst = 1;

			if (datika >= 20 && datika % 2 == 0) {
				$.log(`答题卡大于20张开始答题`);
				for (let i = 0; i < parseInt(datika); i++) {

					$.log(`开始答题第${i + 1}道`);
					let answer = await answerQuery(openid, key, generateUUID());
					answerId = answer.answerId;
					correct = answer.correct;

					//延时
					await sleep(1000);
					let result = await finish(openid, key, generateUUID(), answerId, correct, isfirst);

					isfirst = isfirst == 1 ? 0 : 1;
					if (result.find(element => element.type == 1) != undefined) {
						$.log(`获得金币${result.find(element => element.type == 0).amount} 余额${parseFloat(result.find(element => element.type == 1).amount / 10000)} 🎉`);
					}
					else {
						$.log(`获得金币${result.find(element => element.type == 0).amount} 🎉`);
					}
					//延时
					await sleep(1000);
					await getBonusesNum(openid, key, generateUUID());
					await sleep(1000);
				}
			}


			await user(openid, key, generateUUID())

		}

		await SendMsg(msg);
		$.done()
	}

})()
	.catch((e) => $.logErr(e))
	.finally()

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
async function user(openId, key, guid) {
	let url = `https://xcx.szlzyd.com/new/api/user/account/wxb405959bf31342b2/v=030101_${openId}`;
	let body = JSON.stringify({
		"b": {
			"appId": "wxb405959bf31342b2",
			"productId": 10,
			"productName": "幸运答题赚",
			"openId": openId,
			"customKey": key,
			"unionId": "",
			"uuid": guid,
			"platform": "android",
			"version": "030101"
		},
		"o": {}
	});

	var result = await requestPost(url, body)

	if (request.code == 0) {
		$.logErr(result.msg);
	}
	else {
		let addmsg = `\n 账号${openId} 金币 ${result.data[0].validGold} 余额${parseFloat(result.data[0].validMoney / 10000)} \n`;
		$.log(addmsg);
		msg += addmsg;

		//如果金币大于10000自动兑换
		if (result.data[0].validGold > 10000) {
			$.log("金币大于10000,自动兑换10元余额 🎉")
			await exchange(openId, key, generateUUID());
		}
	}
}

//答题卡
async function getBonusesNum(openId, key, guid) {
	let url = `https://xcx.szlzyd.com/new/api/task/getBonusesNum/wxb405959bf31342b2/v=030101_${openId}`;
	let body = JSON.stringify({
		"b": {
			"appId": "wxb405959bf31342b2",
			"productId": 10,
			"productName": "幸运答题赚",
			"openId": openId,
			"customKey": key,
			"unionId": "",
			"uuid": guid,
			"platform": "android",
			"version": "030101"
		},
		"o": { "rightsId": 8 }
	});

	var result = await requestPost(url, body)

	if (request.code == 0) {
		$.logErr(result.msg);
	}
	else {
		$.log(`共有${result.data[0]}张答题卡`)
		return result.data[0]
	}
}

//签到
async function sign(openId, key, guid) {
	let url = `https://xcx.szlzyd.com/new/api/sign/serialSign/wxb405959bf31342b2/v=030101_${openId}`;
	let body = JSON.stringify({
		"b": {
			"appId": "wxb405959bf31342b2",
			"productId": 10,
			"productName": "幸运答题赚",
			"openId": openId,
			"customKey": key,
			"unionId": "",
			"uuid": guid,
			"platform": "android",
			"version": "030101"
		},
		"o": {
			"1": 72,
			"2": 74,
			"3": 76,
			"4": 78,
			"5": 80,
			"6": 82,
			"7": 84
		}
	});

	var result = await requestPost(url, body)

	if (request.code == 0) {
		$.logErr(result.msg);
	}
	else {
		$.log(`签到成功 🎉`)
	}
}

//查题目
async function answerQuery(openId, key, guid) {
	let url = `https://xcx.szlzyd.com/new/api/answer/query/wxb405959bf31342b2/v=030101_${openId}`;
	let body = JSON.stringify({
		"b": {
			"appId": "wxb405959bf31342b2",
			"productId": 10,
			"productName": "幸运答题赚",
			"openId": openId,
			"customKey": key,
			"unionId": "",
			"uuid": guid,
			"platform": "android",
			"version": "030101"
		},
		"o": { "answerType": 2 }
	});

	var result = await requestPost(url, body)

	if (request.code == 0) {
		$.logErr(result.msg);
	}
	else {
		return result.data[0];
	}
}

//完成题目
async function finish(openId, key, guid, answerId, correct, isfirst) {
	let url = `https://xcx.szlzyd.com/new/api/answer/finish/wxb405959bf31342b2/v=030101_${openId}`;
	let body = JSON.stringify({
		"b": {
			"appId": "wxb405959bf31342b2",
			"productId": 10,
			"productName": "幸运答题赚",
			"openId": openId,
			"customKey": key,
			"unionId": "",
			"uuid": guid,
			"platform": "android",
			"version": "030101"
		},
		"o": { "answer": correct, "answerId": answerId, "isFirst": isfirst }
	});

	var result = await requestPost(url, body)

	if (request.code == 0) {
		$.logErr(result.msg);
	}
	else {
		return result.data;
	}
}

async function exchange(openId, key, guid) {
	let url = `https://xcx.szlzyd.com/new/api/user/exchange/wxb405959bf31342b2/v=030101_${openId}`;
	let body = JSON.stringify({
		"b": {
			"appId": "wxb405959bf31342b2",
			"productId": 10,
			"productName": "幸运答题赚",
			"openId": openId,
			"customKey": key,
			"unionId": "",
			"uuid": guid,
			"platform": "android",
			"version": "030101"
		},
		"o": {}
	});

	var result = await requestPost(url, body)

	if (request.code == 0) {
		$.logErr(result.msg);
	}
	else {
		$.log(result.msg);
	}
}


async function postKa(openId, key, type, guid) {

	//$.log(`${openId} ${key} ${type} ${guid}`)

	let url = `https://xcx.szlzyd.com/new/api/task/minute/wxb405959bf31342b2/v=030101_${openId}`;
	let body = JSON.stringify({
		"b": {
			"appId": "wxb405959bf31342b2",
			"productId": 10,
			"productName": "幸运答题赚",
			"openId": openId,
			"customKey": key,
			"unionId": "",
			"uuid": guid,
			"platform": "android",
			"version": "030101"
		},
		"o": {
			"bonusesTypeIds": [
				type
			]
		}
	});

	var result = await requestPost(url, body)

	if (request.code == 0) {
		$.logErr(result.msg);
	}
	else {
		$.log(result.msg);
	}
	// body: '{"b": {"appId": "wxb405959bf31342b2","productId": 10,"productName": "幸运答题赚","openId": "o0T6Q4j28SW7VtnOlNFcIY4Js6PQ","customKey": "8EFF631B3BC2D9020FB7","unionId": "","uuid": "7cddb7ae-6a85-4a47-9790-99c8b5cfc379","platform": "android","version": "030101"},"o": {"bonusesTypeIds": [92]}}'
}


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

function generateUUID() { // Public Domain/MIT
	var d = new Date().getTime();//Timestamp
	var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16;//random number between 0 and 16
		if (d > 0) {//Use timestamp until depleted
			r = (d + r) % 16 | 0;
			d = Math.floor(d / 16);
		} else {//Use microseconds since page-load if supported
			r = (d2 + r) % 16 | 0;
			d2 = Math.floor(d2 / 16);
		}
		return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
}

function requestPost(url, body) {
	var options = {
		'method': 'POST',
		'url': url,
		'headers': initRequestHeaders(),
		body: body

	};
	return new Promise((resolve, reject) => {
		const req = request(options, (error, res, body) => {
			if (!error && res.statusCode == 200) {
				resolve(JSON.parse(body));
			} else {
				reject(error);
			}
		});
	});
}
//#region 固定代码
// ============================================变量检查============================================ \\
// @ts-ignore
async function MoreUser() {
	if (ckStr) {
		if (ckStr.indexOf("@") != -1) {
			ckStr.split("@").forEach((item) => {
				ckStrArr.push(item);
			});
		} else {
			ckStrArr.push(ckStr);
		}
	} else {
		console.log(`\n 【${$.name}】：未填写变量 xydt`)
		return;
	}

	return true;
}

// ============================================发送消息============================================ \\
// @ts-ignore
async function SendMsg(message) {
	if (!message)
		return;

	if (Notify > 0) {
		if ($.isNode()) {
			// @ts-ignore
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
// @ts-ignore
function randomString(e) {
	e = e || 32;
	var t = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890",
		a = t.length,
		n = "";
	// @ts-ignore
	for (i = 0; i < e; i++)
		n += t.charAt(Math.floor(Math.random() * a));
	return n
}

/**
 * 随机整数生成
 */
// @ts-ignore
function randomInt(min, max) {
	return Math.round(Math.random() * (max - min) + min)
}


//#endregion




// prettier-ignore
// @ts-ignore
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }