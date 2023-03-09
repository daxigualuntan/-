import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'oicq'
import axios from 'axios'
import { checkOnline, checkParam, returnErr } from '../tools/check.js';
import appList from '../config/appList.json' assert { type: 'json' };
import { dealForwardMsg, Chehui } from '../tools/dealMsg.js';
import chcd from '../config/chcd.json' assert { type: 'json' }
import pixivApi from '../api/pixivApi.json' assert { type: 'json' }

let thisApp = appList.app.find(array => array.id === `pixiv`)

export class Pixiv extends plugin {
    constructor() {
        super(thisApp)
    }

    async pSt(e) {
        try {
            // 校验该功能是否上线
            let check_online = await checkOnline(thisApp, `3-1`)

            if (!check_online.online) throw {
                msg: check_online.msg,
                type: check_online.type
            }

            // 检测指令后参数是否为空
            let check_param = await checkParam(e, 4)
            if (check_param.empty) throw {
                msg: check_param.msg,
                type: check_param.type
            }

            let forwardMsg = []
            let url = `${pixivApi.LoliconAPI}/setu/v2?tag=${check_param.param}&num=6&r18=0`
            console.log(url);
            await e.reply(`正在搜索，多个关键词请使用"|"隔开，搜索成功后图片将会在${chcd.pixiv / 1000}秒后自动撤回，请及时保存`, true)

            await axios.get(url).then(async (result) => {
                if (result.status === 200 && result.data.data.length) {
                    // 遍历并push进消息数组
                    result.data.data.forEach(item => {
                        forwardMsg.push(
                            {
                                message: [segment.image(item.urls.original), '\n标题:', item.title, '\n作者：', item.author, '\n标签：' + item.tags, '\n原图链接:https://www.pixiv.net/artworks/' + item.pid],
                                nickname: e.sender.card || e.sender.nickname,
                                user_id: e.sender.user_id
                            }
                        )
                    })
                    let resMsg = await dealForwardMsg(e, forwardMsg, `富强、民主、文明、和谐，自由、平等、公正、法治，爱国、敬业、诚信、友善`)
                    Chehui(resMsg, e, chcd.pixiv)
                } else {
                    logger.error(err)
                    throw err
                }
            }).catch(async (err) => {
                logger.error(err)
                throw err
            });
        } catch (err) {
            returnErr(e, err)
        }
    }
}