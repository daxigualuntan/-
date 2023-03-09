import plugin from '../../../lib/plugins/plugin.js'
import appList from '../config/appList.json' assert { type: 'json' };
import axios from 'axios'
import { segment } from 'oicq'
import { checkOnline, checkParam, returnErr } from '../tools/check.js';

let thisApp = appList.app.find(array => array.id === `dtst`)

export class DuiTang extends plugin {
    constructor() {
        super(thisApp)
    }

    // 堆糖搜图
    async dtst(e) {
        let check_online = await checkOnline(thisApp, `1-1`)
        try {
            if (!check_online.online) throw {
                msg: check_online.msg,
                type: check_online.type
            }

            let check_param = await checkParam(e, 4)

            if (check_param.empty) throw {
                msg: check_param.msg,
                type: check_param.type
            }

            let msg
            let api = `http://www.plapi.cc`
            let url = `${api}/api/duitang.php?msg=${check_param.param}&type=json` // 拼接api调用链接
            logger.mark(`堆糖搜索了${check_param.param}`) // 打印操作日志
            await e.reply(`开始搜索，当前使用的堆糖接口是：${api}`)
            await axios.get(url).then(async (result) => {
                if (result.status === 200 && result.data.images) {
                    msg = segment.image(result.data.images)
                } else {
                    msg = `没有找到${check_param.param}相关的图片`
                }
                let sendMsg = await e.reply(msg)
                if (!sendMsg) {
                    await e.reply(`消息发送失败，可能被QQ风控`)
                    return true
                }
            }).catch(async (err) => {
                logger.error(err);
                await e.reply(`访问出错，请稍后重试！`)
                return
            });

        } catch (err) {
            returnErr(e, err)
        }
    }
}
