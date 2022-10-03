/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module contains the more logic-inclined parts of the widget (e.g loading widgets for all providers)
 */

import { provider_data_symbol } from "/$/modernuser/static/authentication/lib/widget-model.mjs";
import muserRpc from "../../lib/rpc.mjs";
import systemRpc from "/$/system/static/comm/rpc/system-rpc.mjs";
import ChooseAccount from "./choose-account/widget.mjs";




/**
 * This method returns an array of widgets for each provider
 * @returns {Promise<[import("./types.js").ProvidedWidget]>}
 */
async function fetchProviderWidgets() {
    let providers = (await muserRpc.modernuser.authentication.getProvidersData())?.reverse() //reverse is just a temporary hack so that Google Sign In is last

    let widgetPromises = providers.map(async provider => {
        try {
            let WidgetClass = (await import(`/$/modernuser/static/authentication/providers/${provider.name}/frontend/widget.mjs`)).default
            let instance = new WidgetClass({ ...provider.credentials });
            instance[provider_data_symbol] = provider
            return instance;
        } catch (e) {
            console.warn(`Failed to load provider ${provider.name}\n`, e);
            systemRpc.system.error.report(e.toString());
            window.eee = e;
        }
    });

    return (await Promise.allSettled(widgetPromises)).map(entry => entry.value).filter(entry => typeof entry !== 'undefined');
}


/**
 * This method is used to either login, sign up or reset password
 * @param {object} param0 
 * @param {('login'|'signup'|'reset'|'account_share')} param0.action
 * @param {string} param0.provider
 * @param {object} param0.data
 * @returns {Promise<object>}
 */
async function executeAction({ action, provider, data }) {


    switch (action) {
        case 'login': {


            const profiles = await muserRpc.modernuser.authentication.getProfiles(provider, data)
            if (profiles.length > 1) { //TODO: Change to >1
                const popup = new ChooseAccount({
                    login: {
                        provider,
                        data
                    },
                    profiles
                })
                popup.show()

                await new Promise((resolve, reject) => {
                    popup.hideOnOutsideClick = false;

                    popup.addEventListener('hide', () => {
                        reject(new Error(`You failed to choose an account`))
                    })
                    popup.addEventListener('complete', () => {
                        resolve()
                        popup.hide()
                    })
                })
            } else {
                await muserRpc.modernuser.authentication.advancedLogin({ provider, data, userid: profiles[0].profile.id })
            }
            break;
        }
        case 'signup': {
            await muserRpc.modernuser.signup(provider, data)
            break;
        }

        case 'reset': {
            await muserRpc.modernuser.authentication.initiate_reset(provider, data)
        }

        case 'account_share': {
            await muserRpc.modernuser.addTenant(provider, data)
            window.location = '/$/modernuser/onboarding/static/request/'

        }

    }
}


export default {
    fetchProviderWidgets,
    executeAction,
    provider_data_symbol
}