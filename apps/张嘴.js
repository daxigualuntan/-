import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'oicq'
import fs from 'fs'
import { checkOnline, returnErr } from '../tools/check.js'
import { Chehui } from '../tools/dealMsg.js';
import appList from '../config/appList.json' assert { type: 'json' };
import chcd from '../config/chcd.json' assert { type: 'json' }

let thisApp = appList.app.find(array => array.id === `zz`)

export class ZhangZui extends plugin {
    constructor() {
        super(thisApp)
    }
    // 张嘴有急事
    async zz(e) {
        try {
            let check_online = await checkOnline(thisApp, `5-1`)
            if (!check_online.online) throw {
                msg: check_online.msg,
                type: check_online.type
            }

            // directory path
            const dir = './plugins/suibian-plugin/res/zz';
            let gifList = []

            // list all files in the directory
            fs.readdir(dir, async (err, files) => {
                if (err) {
                    throw err;
                }

                files.forEach(file => {
                    gifList.push(file)
                })
                // console.log(gifList);
                let msg = segment.image(`${dir}/${gifList[Math.floor(Math.random() * gifList.length)]}`)
                let resMsg = await e.reply(msg, true)
                if (!resMsg) resMsg = await e.reply(`图片发送失败，可能被QQ风控`)
                Chehui(resMsg, e, chcd.zhangzui)
                return resMsg
            })
        } catch (err) {
            returnErr(e, err)
        }
    }

}