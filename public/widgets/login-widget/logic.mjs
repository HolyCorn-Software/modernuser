/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module contains the more logic-inclined parts of the widget (e.g loading widgets for all providers)
 */

import { pluginData } from "/$/modernuser/static/authentication/lib/widget-model.mjs";
import muserRpc from "../../lib/rpc.mjs";
import systemRpc from "/$/system/static/comm/rpc/system-rpc.mjs";
import ChooseAccount from "./choose-account/widget.mjs";




/**
 * This method returns an array of widgets for each provider
 * @returns {Promise<[import("./types.js").ProvidedWidget]>}
 */
async function fetchLoginWidgets() {
    let plugins = (await muserRpc.modernuser.authentication.getPluginsPublicData())?.reverse() //reverse is just a temporary hack so that Google Sign In is last

    let widgetPromises = plugins.map(async plugin => {
        try {
            let WidgetClass = (await import(`/$/modernuser/$plugins/${plugin.name}/@public/widget.mjs`)).default
            let instance = new WidgetClass({ ...plugin.credentials });
            instance[pluginData] = plugin
            return instance;
        } catch (e) {
            console.warn(`Failed to load provider ${plugin.name}\n`, e);
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
 * @param {string} param0.plugin
 * @param {object} param0.data
 * @returns {Promise<object>}
 */
async function executeAction({ action, plugin, data }) {
    

    switch (action) {
        case 'login': {


            const profiles = await muserRpc.modernuser.authentication.getProfiles(plugin, data)
            if (profiles.length > 1) {
                const popup = new ChooseAccount({
                    login: {
                        plugin,
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
                await muserRpc.modernuser.authentication.advancedLogin({ plugin, data, userid: profiles[0].profile.id })
            }
            break;
        }
        case 'signup': {
            await muserRpc.modernuser.signup(plugin, data)
            break;
        }

        case 'reset': {
            await muserRpc.modernuser.authentication.initiate_reset(plugin, data)
        }

        case 'account_share': {
            await muserRpc.modernuser.addTenant(plugin, data)
            window.location = '/$/modernuser/onboarding/static/request/'

        }

    }
}


export default {
    fetchLoginWidgets,
    executeAction,
    provider_data_symbol: pluginData
}