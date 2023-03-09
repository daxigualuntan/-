import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'oicq'
import fs from 'fs'
import { checkOnline, returnErr } from '../tools/check.js'
import { dealForwardMsg, Chehui } from '../tools/dealMsg.js';
import appList from '../config/appList.json' assert { type: 'json' };
import chcd from '../config/chcd.json' assert { type: 'json' }

let thisApp = appList.app.find(array => array.id === `cd`)

export class ZhiLing extends plugin {
    constructor() {
        super(thisApp)
    }
    // 王冰冰
    async bb(e) {
        try {
            let check_online = await checkOnline(thisApp, `114514`)
            if (!check_online.online) throw {
                msg: check_online.msg,
                type: check_online.type
            }

            await e.reply(`恭喜你发现了一条神秘指令！`, true)

            let forwardMsg = []

            // directory path
            const dir = './plugins/suibian-plugin/res/bb/img';
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

                forwardMsg.push(
                    {
                        message: [msg],
                        nickname: e.sender.card || e.sender.nickname,
                        user_id: e.sender.user_id
                    }
                )


                let resMsg = await dealForwardMsg(e, forwardMsg, `恭喜你发现了神秘指令！`)
                if (!resMsg) resMsg = await e.reply(`图片发送失败，可能被QQ风控`)
                Chehui(resMsg, e, chcd.caidan_img)
                return resMsg
            })
        } catch (err) {
            returnErr(e, err)
        }
    }

    async bing(e) {
        let check_online = await checkOnline(thisApp, `114514`)
        if (!check_online.online) throw {
            msg: check_online.msg,
            type: check_online.type
        }

        await e.reply(`恭喜你发现了一条神秘指令！`, true)

        let forwardMsg = []
        // let url = `./plugins/suibian-plugin/res/bb/video/wbb1.mp4`

        // console.log(gifList);
        forwardMsg.push(
            {
                message:`我用夸克网盘分享了「wbb（解压密码javbus，文件扩展名改为.zip）.font」，点击链接即可保存,链接：https://pan.quark.cn/s/f2ab5262c11a`,
                nickname: e.sender.card || e.sender.nickname,
                user_id: e.sender.user_id
            }
        )
        // let resMsg = await e.reply(msg)
        let resMsg = await dealForwardMsg(e, forwardMsg, `恭喜你发现了一条神秘指令！`)
        Chehui(resMsg, e, chcd.caidan_img)
        return resMsg

    } catch(err) {
        returnErr(e, err)
    }

}
