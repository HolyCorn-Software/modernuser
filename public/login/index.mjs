/**
 * Copyright 2023 HolyCorn Software
 * The Modern Faculty of Users
 * This page allows a user to authenticate himeself
 */

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { handle } from "/$/system/static/errors/error.mjs";


const doLoad = async () => {

    const LoginPage = (await import("../widgets/login-page/widget.mjs")).default;

    let widget = new LoginPage();


    document.body.appendChild(
        widget.html
    );
}

try {


    const page = await hcRpc.system.settings.get({ faculty: 'modernuser', namespace: 'appearance', name: 'loginPage' })
    if (page) {
        window.location = `${page}?continue=${new URLSearchParams(window.location.search).get('continue') || document.referrer || '/'}`
    } else {
        console.log(`There's no login page: ${page}`)
        doLoad().catch((e) => handle(e))
    }
} catch (e) {
    handle(e)
}