import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'oicq'
import { checkOnline, returnErr } from '../tools/check.js';
import appList from '../config/appList.json' assert { type: 'json' };

let thisApp = appList.app.find(array => array.id === `dgmn`)
let qes = [
    { 'question': '夜间在没有路灯照明不良条件下行驶', 'daan': '远光灯' },
    { 'question': '夜间同方向近距离跟车行驶', 'daan': '近光灯' },
    { 'question': '请开启前照灯', 'daan': '近光灯' },
    { 'question': '夜间在窄路、窄桥与非机动车会车', 'daan': '近光灯' },
    { 'question': '夜间在道路上发生故障，妨碍交通又难以移动', 'daan': '双闪' },
    { 'question': '夜间通过急弯，坡路，拱桥', 'daan': '远近交替' },
    { 'question': '夜间通过没有交通信号灯控制的路口', 'daan': '远近交替' },
    { 'question': '超车', 'daan': '远近交替' },
    { 'question': '路边临时停车', 'daan': '双闪' },
    { 'question': '夜间通过有交通信号灯控制的路口', 'daan': '近光灯' },
    { 'question': '夜间与非机动车会车', 'daan': '近光灯' },
]
let userArr = [
    {
        "user_id": 110,
        "score": 100,
        "huihe": 1,
        "ks": 0,
        "questionList": []
    }
]

export class DengGuang extends plugin {
    constructor() {
        super(thisApp)
    }

    async dgmn(e) {
        console.log(thisApp);
        let check_online = await checkOnline(thisApp, `2-1`)
        try {
            if (!check_online.online) throw {
                msg: check_online.msg,
                type: check_online.type
            }

            let iscz = userArr.find(array => array.user_id === e.user_id)
            // console.log(userArr);
            if (!iscz) {
                userArr.push({
                    "user_id": e.user_id,
                    "score": 100,
                    "huihe": 1,
                    "ks": 0,
                    "questionList": []
                })
            }
            iscz = userArr.find(array => array.user_id === e.user_id)
            // console.log(iscz.ks);

            if (e.msg == "#灯光模拟" && iscz.ks === 0) {
                await e.reply([`考试回答请使用指令“#打+灯光名称”\n`, `灯光名称如下：\n`, `远光灯\n`, `近光灯\n`, `双闪\n`, `远近交替`])
                let par1 = '下面将进行模拟夜间行驶灯光的考试，请做出相应的灯光操作'
                await e.reply(segment.record(`https://apis.jxcxin.cn/api/yuyin?text=${encodeURI(par1)}`))
                iscz.ks = 1
                // 获取随机题目5题
                for (let i = 0; i < 5; i++) {
                    iscz.questionList.push(qes[Math.floor(Math.random() * 11)])
                }
                // await e.reply(`第${huihe}题`)
                await e.reply(segment.record(`https://apis.jxcxin.cn/api/yuyin?text=${encodeURI(iscz.questionList[iscz.huihe - 1].question)}`))
            } else if (e.msg == "#灯光模拟" && iscz.ks === 1 && e.sender.user_id !== 2726357082) {

                console.log(e.sender.user_id);

                await e.reply(`你有正在进行中的灯光模拟！请先发送指令“#结束灯光”结束灯光模拟`, true)
                return
            } else if (e.msg.includes('#打') && iscz.ks === 0 && e.sender.user_id !== 2726357082) {

                console.log(e.sender.user_id);

                await e.reply(`请先发送“#灯光模拟”开始考试`, true)
                return
            }

            if (e.msg.includes('#打') && iscz.ks === 1) {
                let caozuo = e.msg.slice(2).trim()
                if (caozuo !== iscz.questionList[iscz.huihe - 1].daan) {
                    await e.reply(segment.at(e.user_id))
                    let par2 = `等待监管系统回应，您的扣分项目是车辆${iscz.questionList[iscz.huihe - 1].question}时不能正确使用${iscz.questionList[iscz.huihe - 1].daan}，扣100分，考试结束，成绩不合格，请回中心打印成绩单`
                    await e.reply(segment.record(`https://apis.jxcxin.cn/api/yuyin?text=${encodeURI(par2)}`))
                    iscz.huihe = 1
                    iscz.ks = 0
                    return true
                } else if (caozuo === iscz.questionList[iscz.huihe - 1].daan && iscz.huihe < 5) {
                    iscz.huihe++
                    // await e.reply(`第${huihe}题`)
                    await e.reply(segment.record(`https://apis.jxcxin.cn/api/yuyin?text=${encodeURI(iscz.questionList[iscz.huihe - 1].question)}`))
                    return true
                }
                await e.reply(segment.at(e.user_id))
                let par3 = '灯光模拟考试结束，请关闭所有灯光'
                await e.reply(segment.record(`https://apis.jxcxin.cn/api/yuyin?text=${encodeURI(par3)}`))
                iscz.ks = 0
                iscz.huihe = 1
                return true
            }

        } catch (err) {
            returnErr(e, err)
        }
    }

    // 结束考试
    async jieshu(e) {
        let check_online = await checkOnline(thisApp, `2-2`)
        try {
            if (!check_online.online) throw {
                msg: check_online.msg,
                type: check_online.type
            }

            let iscz = userArr.find(array => array.user_id === e.user_id)
            // console.log(userArr);
            if (!iscz) {
                userArr.push({
                    "user_id": e.user_id,
                    "score": 100,
                    "huihe": 1,
                    "ks": 0,
                    "questionList": []
                })
            } else {
                iscz.huihe = 1
                iscz.ks = 0
                iscz.score = 100
                iscz.questionList = []
            }
            console.log(iscz);
            await e.reply(`已结束灯光模拟考试`, true)
            return true
        } catch (err) {
            returnErr(e, err)
        }
    }
}


