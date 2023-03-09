import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'oicq'
import axios from 'axios'
import appList from '../config/appList.json' assert { type: 'json' };
import { dealForwardMsg, Chehui } from '../tools/dealMsg.js';
import chcd from '../config/chcd.json' assert { type: 'json' }
import { checkOnline, checkParam, returnErr } from '../tools/check.js'
import avapi from '../api/avapi.json' assert { type: 'json' }

let thisApp = appList.app.find(array => array.id === `scl`)

export class AV extends plugin {
    constructor() {
        super(thisApp)
    }

    async scl(e) {

        try {
            // 校验该功能是否上线
            let check_online = await checkOnline(thisApp, `6-1`)
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
            let api = `${avapi.magnetLinks.javDB}search?q=${check_param.param}&f=all`
            // console.log(api);
            let tempHtml
            // 定义跳转的api
            let fact_url
            // 标题
            let title
            // 演员
            let actors = []
            // 封面
            let cover
            // 临时数据
            let tempActors // 临时演员数据
            let tempBT  //临时磁力数据
            let tempImg  // 临时封面数据
            // 磁力链接
            let btLink = []
            let arr = []
            await e.reply(`正在搜索，搜索成功后消息将会在${chcd.scl / 1000}秒后自动撤回，请及时复制保存`, true)
            await axios.get(api).then(async (result) => {
                if (result.status === 200 && result.data.length) {

                    tempImg = result.data.replace(/[\r\n]/g, "").match(/<img loading="lazy".*?\/>/g)
                    cover = tempImg[0].replace(/["=<>]/g, '').slice(19, -2)
                    // console.log(cover);

                    tempHtml = result.data.replace(/[\r\n]/g, "").match(/<div class="item">(.*?)<\/strong>/g)

                    title = tempHtml[0].match(/<strong>.*?<\/strong>/g)[0].slice(8, -9)

                    fact_url = `${avapi.magnetLinks.javDB}${tempHtml[0].match(/href="(.*?)"/g)[0].slice(7, -1)}`

                    await axios.get(fact_url).then(async (result) => {
                        if (result.status === 200 && result.data.length) {
                            tempActors = result.data.replace(/[\r\n]/g, "").match(/<a href="\/actors\/(.*?)<\/a>/g)
                            tempActors.forEach(item => {
                                item = item.match(/>.*?</g)[0].replace(/[<>]/g, '')
                                actors.push(item)
                            });
                            tempBT = result.data.replace(/[\r\n]/g, "").match(/<button class="button is-info is-small copy-to-clipboard" data-clipboard-text="magnet(.*?)>/g)

                            forwardMsg.push(
                                {
                                    message: [segment.image(cover), `\n标题:${title}`, `\n演员：\n${actors}\n`,],
                                    nickname: e.sender.card || e.sender.nickname,
                                    user_id: e.sender.user_id
                                }
                            )

                            tempBT.forEach((item) => {
                                item = item.match(/magnet.*?"/g)[0].replace(/"/g, '')
                                forwardMsg.push({
                                    message: item,
                                    nickname: e.sender.card || e.sender.nickname,
                                    user_id: e.sender.user_id
                                })
                            })

                            let resMsg = await dealForwardMsg(e, forwardMsg, `共找到${tempBT.length}条关于${check_param.param}的链接`)
                            Chehui(resMsg, e, chcd.scl)
                        }
                    }).catch(err => {
                        logger.error(err);
                        throw {
                            type: `无效资源`,
                            msg: `暂未找到${check_param.param}相关的数据`
                        }
                    })
                }
            }).catch(async (err) => {
                logger.error(err);
                throw err
            });

        } catch (err) {
            returnErr(e, err)
        }
    }

    async sls(e) {

        try {
            // 校验该功能是否上线
            let check_online = await checkOnline(thisApp, `6-2`)
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
            let resMsg
            let api = `${avapi.magnetLinks.javDB}search?q=${check_param.param}&f=actor`
            console.log(`链接是：${api}`);

            // 获取演员链接
            let actLink
            // 获取影片信息列表
            let avList = []

            // 标题
            let title
            let titleList = []

            // 页面
            let page

            // 封面
            let cover
            let coverList = []

            // 车牌号
            let cph
            let cphList = []

            // 链接
            let url
            let urlList = []

            // 临时总页数
            let tempPage

            // 数据总页数
            let pageNum

            await e.reply(`正在搜索，搜索成功后消息将会在${chcd.sls / 1000}秒后自动撤回，请及时复制保存`, true)
            await axios.get(api).then(async (result) => {
                if (result.status === 200 && result.data.length) {
                    try {
                        actLink = result.data.replace(/[\r\n]/g, "").match(/<div class="box actor-box">(.*?)<figure/g)[0]
                    } catch (error) {
                        throw {
                        type:`无效资源`,
                        msg:`暂未找到关于${check_param.param}的信息`
                    }
                    }
                    // console.log(actLink);
                    actLink = actLink.replace(/[<>=]/g, "").match(/href".*?"/g)[0].slice(6, -1)
                    actLink = avapi.magnetLinks.javDB + actLink
                    // console.log(actLink);

                    // 获取影片
                    await axios.get(actLink).then(async (result) => {
                        if (result.status === 200 && result.data.length) {

                            // 获取资源总页数
                            tempPage = result.data.replace(/[\r\n]/g, "").match(/<ul class="pagination-list">.*?\/ul>/g)
                           
                            tempPage ? tempPage = tempPage[0].match(/<a class="pagination-link(.*?)</g) : tempPage = []

                            pageNum = tempPage.length+1
                            await e.reply(`已为你找到${pageNum}页关于${check_param.param}的数据`)

                            for (let i = 1; i <= pageNum; i++) {
                                // logger.info(`${actLink}?page=${i}`)
                                await axios.get(`${actLink}?page=${i}`).then(async (result) => {
                                    page = result.data.replace(/[\r\n]/g, "").match(/<div class="item">(.*?)<span class="value">/g)
                                    page.forEach(item => {
                                        // 获取封面
                                        cover = item.replace(/[\r\n]/g, "").match(/<img loading="lazy".*?\/>/g)[0].replace(/["=<>]/g, '').slice(19, -2)
                                        coverList.push(cover)

                                        // 获取车牌号
                                        cph = item.replace(/[\r\n]/g, "").match(/<strong>(.*?)</g)[0].replace(/[<>]/g, '').slice(6)
                                        cphList.push(cph)

                                        // 获取标题
                                        title = item.replace(/[\r\n]/g, "").match(/<\/strong>(.*?)</g)[0].replace(/[/<>]/g, '').slice(6)
                                        titleList.push(title)

                                        // 获取第二次axios链接
                                        url = avapi.magnetLinks.javDB + item.replace(/[\r\n]/g, "").match(/href="(.*?)"/g)[0].replace(/[="]/g, '').slice(5)
                                        urlList.push(url)
                                    })

                                    for (let i = 0; i < coverList.length; i++) {
                                        forwardMsg.push({
                                            message: [segment.image(coverList[i]), `\n\n车牌号：${cphList[i]}\n\n`, `链接：${urlList[i]}`],
                                            nickname: e.sender.card || e.sender.nickname,
                                            user_id: e.sender.user_id
                                        })
                                    }
                                    resMsg = await dealForwardMsg(e, forwardMsg, `第${i}页`)
                                    forwardMsg.length = 0
                                    cphList.length = 0
                                    titleList.length = 0
                                    urlList.length = 0
                                    coverList.length = 0
                                    Chehui(resMsg, e, chcd.sls)
                                }).catch(async (err) => {
                                    logger.error(err)
                                    throw err
                                })
                            }

                        }
                        else throw {
                            type: `无效资源`,
                            msg: `暂未找到关于${check_param.param}的信息`
                        }
                    }).catch(async(err) => {
                        await e.reply(err)
                        throw err
                    });

                }
            }).catch(async (err) => {
                returnErr(e, err)
            });

        } catch (err) {
            returnErr(e, err)
        }
    }
}