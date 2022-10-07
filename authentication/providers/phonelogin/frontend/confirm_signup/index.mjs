/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * 
 * The Modern Faculty of Users
 * This script is part of the phonelogin provider
 * It is used to reset the password of a user
 */

import ActionPopup from "../widgets/action-popup/widget.mjs";
import muserRpc from "/$/modernuser/static/lib/rpc.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";



async function begin() {

    let popup = new ActionPopup(
        {
            action: async () => {

                /** @type {import("../../backend/remote/public.mjs").default} */
                let phone_login_provider = muserRpc.modernuser.authentication.providers.phonelogin
                let params = new URLSearchParams(window.location.search)
                let token = params.get('token')

                await phone_login_provider.verifyPendingAccount({ token })
            },
            done:()=>{
                window.location = '/$/modernuser/onboarding/static/request/'
            },
            strings:{
                pending: `Activating your account. Please wait...`,
                complete: `Account Activated. You'll be redirected to the setup page`
            }
        }
    );
    popup.show();

}




begin()

hc.importModuleCSS(import.meta.url);