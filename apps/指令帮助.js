import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'oicq'
import fs from 'fs'
import appList from '../config/appList.json' assert { type: 'json' };
import { dealForwardMsg, Chehui } from '../tools/dealMsg.js';
import chcd from '../config/chcd.json' assert { type: 'json' }
import { checkParam, returnErr } from '../tools/check.js';

let thisApp = appList.app.find(array => array.id === `zlbz`)

export class ZhiLing extends plugin {
    constructor() {
        super(thisApp)
    }

    // 指令帮助
    async zlbz(e) {
        let forwardMsg = []
        for (let key in appList.app) {
            appList.app[key].rule.forEach(item => {
                if (item.isOnline && !item.hide) {
                    forwardMsg.push({
                        message: [`指令：${item.ml}\n`, `功能描述：${item.des}\n`],
                        nickname: e.sender.card || e.sender.nickname,
                        user_id: e.sender.user_id
                    })
                }
            })
        }
        let resMsg = await dealForwardMsg(e, forwardMsg, `指令列表`)
        Chehui(resMsg, e, chcd.zhiling)
    }

    async editzl(e) {
        let forwardMsg = []

        try {
            if (!e.isMaster) throw {
                msg: `暂无权限使用该指令`,
                type: `权限不足`
            }

            let check_param = await checkParam(e, 3)

            if (check_param.empty) {
                for (let key in appList.app) {
                    appList.app[key].rule.forEach(item => {
                        if (!item.hide) {
                            forwardMsg.push({
                                message: [`指令编号：${item.index}\n指令：${item.ml}\n状态：${item.isOnline ? '正常使用' : '维护中'}\n`, `如要上、下线某个指令，请回复#上线+指令编号|#下线+指令编号`],
                                nickname: e.sender.card || e.sender.nickname,
                                user_id: e.sender.user_id
                            })
                        }
                    })
                }

                let resMsg = await dealForwardMsg(e, forwardMsg, `指令列表`)
                Chehui(resMsg, e, chcd.zhiling)

                throw {
                    msg: check_param.msg,
                    type: check_param.type
                }
            }

            let result
            let judegeCz = []

            if (e.msg.includes('#上线')) {
                // console.log(appList.app);
                for (let key in appList.app) {
                    appList.app[key].rule.forEach(item => {
                        if (item.index === check_param.param) {
                            item.isOnline = true
                            // console.log(typeof(item));
                            result = JSON.stringify(item)
                            judegeCz.push(item)
                        }
                    })
                }
                if (!judegeCz.length) throw {
                    msg: `指令编号不存在`,
                    type: `无效的指令编号`
                }
                fs.writeFile('./plugins/suibian-plugin/config/appList.json', JSON.stringify(appList), async (err, data) => {
                    if (err) throw err
                    // let res = JSON.parse(data)
                    // console.log(typeof (data));
                    await e.reply(`指令【${judegeCz[0].ml}】上线成功！`, true)
                    return
                })
            } else if (e.msg.includes('#下线')) {
                for (let key in appList.app) {
                    appList.app[key].rule.forEach(item => {
                        if (item.index === check_param.param) {
                            item.isOnline = false
                            // console.log(typeof(item));
                            result = JSON.stringify(item)
                            judegeCz.push(item)
                        }
                    })
                }
                if (!judegeCz.length) throw {
                    msg: `指令编号不存在`,
                    type: `无效的指令编号`
                }
                fs.writeFile('./plugins/suibian-plugin/config/appList.json', JSON.stringify(appList), async (err, data) => {
                    if (err) throw err
                    // let res = JSON.parse(data)
                    // console.log(typeof (data));
                    await e.reply(`指令【${judegeCz[0].ml}】下线成功！`, true)
                    return
                })
            }

        } catch (err) {
            returnErr(e, err)
        }
    }
}