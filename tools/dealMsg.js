// 制作转发消息
const dealForwardMsg = async function (e, forwardMsg,title) {
    if (e.isGroup) {
        forwardMsg = await e.group.makeForwardMsg(forwardMsg)
    } else {
        forwardMsg = await e.friend.makeForwardMsg(forwardMsg)
    }
    // 处理转发卡片，规避群风控
    forwardMsg.data = forwardMsg.data
        .replace('<?xml version="1.0" encoding="utf-8"?>', '<?xml version="1.0" encoding="utf-8" ?>')
        .replace(/\n/g, '')
        .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
        .replace(/___+/, `<title color="#777777" size="26">${title}</title>`)
    // 采用转发形式发送消息，减少风控
    let resMsg = await e.reply(forwardMsg, false)
    if (!resMsg) await e.reply('消息发送失败，可能被风控')
    return resMsg
}

// 撤回消息
const Chehui = async function (msgRes, e, timeoutTime) {
    if (msgRes && msgRes.message_id) {
        let target = null;
        if (e.isGroup) {
            target = e.group;
        } else {
            target = e.friend;
        }
        if (target != null) {
            setTimeout(() => {
                target.recallMsg(msgRes.message_id);
            }, timeoutTime);
        }
    }
}



export {
    dealForwardMsg,
    Chehui,
}