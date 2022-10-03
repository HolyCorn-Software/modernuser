/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * 
 * The Modern Faculty of Users
 * This script is part of the phonelogin provider
 * It is used to activate the account of a user
 */

import ActionPopup from "../widgets/action-popup/widget.mjs";
import muserRpc from "/$/modernuser/static/lib/rpc.mjs";
import { hc } from "/$/system/static/lib/hc/lib/index.js";



async function begin() {

    new ActionPopup(
        {
            action: async () => {

                /** @type {import("../../backend/remote/public.mjs").default} */
                let phone_login_provider = muserRpc.modernuser.authentication.providers.phonelogin
                let params = new URLSearchParams(window.location.search)
                let token = params.get('token')

                await phone_login_provider.resetAccount({ token })
            },
            strings: {
                pending: `Resetting your password. Please wait...`,
                complete: `Your password has been reset. You'll be redirected to the login page`
            }
        }
    ).show();

}




begin()

hc.importModuleCSS(import.meta.url);