import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'oicq'
import axios from 'axios'
import appList from '../config/appList.json' assert { type: 'json' };
import { dealForwardMsg, Chehui } from '../tools/dealMsg.js';
import chcd from '../config/chcd.json' assert { type: 'json' }
import { checkOnline } from '../tools/check.js';
import avapi from '../api/avapi.json' assert { type: 'json' }

let thisApp = appList.app.find(array => array.id === `jrtj`)

export class AV extends plugin {
    constructor() {
        super(thisApp)
    }

    async jrtj(e) {
        // 校验该功能是否上线
        let check_online = await checkOnline(thisApp, `4-1`)

        try {
            if (!check_online.online) throw {
                msg: check_online.msg,
                type: check_online.type
            }

            let forwardMsg = []
            let api = `${avapi.todayAv.javBUS}page/${Math.floor(Math.random() * 101)}`

            console.log(api);

            // 车牌号
            let linklist = []
            // 预览图
            let imglist = []
            // 番号标题
            let tlist = []
            // 随机编号
            let indexList = []
            // 卡片标题
            let cardTitle = []
            await e.reply(`正在获取今日推荐，获取成功后消息将会在${chcd.todayav / 1000}秒后撤回，建议搭配 #搜车牌 命令使用`, true)
            await axios.get(api).then(async (result) => {
                if (result.status === 200 && result.data.length) {
                    // let avlist = result.data.replace(/[\r\n]/g, "").match(/<div class="item"(.*?)\/div>/g)
                    // 获取数据列表
                    let lists = result.data.replace(/[\r\n]/g, "").match(/<div id="waterfall"><div id="waterfall"(.*?)\/div><\/div>/g)

                    let link = lists[0].match(/<a class="movie-box" href=(.*?)>/g)
                    link.forEach(item => {
                        // console.log(item.substring(26).replace(/[">'https://www.seejav.cc/']/g, ''));
                        linklist.push(item.substring(26).replace(/[">'https://www.seejav.cc/']/g, ''))
                    })

                    let img = lists[0].match(/<img src="(.*?)"/g)
                    img.forEach(item => {
                        // console.log(item.replace(/[<="]/g,'').substring(7));
                        imglist.push(`https://www.seejav.cc/${item.replace(/[<="]/g, '').substring(7)}`)
                    })

                    let t = lists[0].match(/<span>(.*?)</g)
                    t.forEach(item => {
                        // console.log(item.replace(/[<>]/g,'').substring(4));
                        tlist.push(item.replace(/[<>]/g, '').substring(4))
                    })

                    for (let i = 0; i < 3; i++) {
                        indexList.push(Math.floor(Math.random() * linklist.length))
                    }

                    indexList.forEach(item => {
                        cardTitle.push(linklist[item])
                        forwardMsg.push(
                            {
                                message: [segment.image(imglist[item]), '\n\n标题:  ', tlist[item], '\n\n车牌号: ' + linklist[item]],
                                nickname: e.sender.card || e.sender.nickname,
                                user_id: e.sender.user_id
                            }
                        )
                    })

                    let resMsg = await dealForwardMsg(e, forwardMsg,cardTitle)
                    indexList = []
                    console.log(indexList);
                    Chehui(resMsg, e, chcd.todayav)
                    return true
                } else {
                    throw {
                        type:`请求失败`,
                        msg:`接口请求失败！`
                    }
                }
            }).catch(async (err) => {
                logger.error(err);
                await e.reply(err)
                return err
            });
        } catch (err) {
            returnErr(e, err)
        }
    }
}