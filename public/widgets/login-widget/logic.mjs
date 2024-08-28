/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module contains the more logic-inclined parts of the widget (e.g loading widgets for all providers)
 */

import { pluginData } from "/$/modernuser/static/authentication/lib/widget-model.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs"
import ChooseAccount from "./choose-account/widget.mjs";




/**
 * This method returns an array of widgets for each provider
 * @returns {Promise<import("./types.js").ProvidedWidget[]>}
 */
async function fetchLoginWidgets() {
    let plugins = (await hcRpc.modernuser.authentication.getPluginsPublicData())?.reverse() //reverse is just a temporary hack so that Google Sign In is last

    let widgetPromises = plugins.map(async plugin => {
        try {
            let WidgetClass = (await import(`/$/modernuser/$plugins/${plugin.name}/@public/widget.mjs`)).default
            let instance = new WidgetClass({ ...plugin.credentials });
            instance[pluginData] = plugin
            return instance;
        } catch (e) {
            console.warn(`Failed to load provider ${plugin.name}\n`, e);
            hcRpc.system.error.report(e.toString());
        }
    });

    return (await Promise.allSettled(widgetPromises)).map(entry => entry.value).filter(entry => typeof entry !== 'undefined');
}


/**
 * This method is used to either login, sign up or reset password
 * @param {object} param0 
 * @param {modernuser.authentication.AuthAction|'account_share'} param0.action
 * @param {string} param0.provider
 * @param {object} param0.data
 * @returns {Promise<modernuser.authentication.frontend.LoginStatus>}
 */
async function executeAction({ action, provider, data }) {



    switch (action) {
        case 'login': {


            const profiles = await hcRpc.modernuser.authentication.getProfiles(provider, data)


            // Now, if the login is not active, we just return false, so that the
            // provider knows that the login requires activation
            if (profiles.length == 1 && !profiles[0].active) {
                return {
                    active: false,
                    onboarded: profiles[0].onboarded,
                }
            }

            /**
             * This method is used to finally log in
             * @param {modernuser.authentication.LoginProfileInfo} login 
             * @returns {Promise<modernuser.authentication.frontend.LoginStatus>}
             */
            async function doLogin(login) {
                if (!login.active) {
                    return {
                        active: false,
                        onboarded: login.onboarded,
                    }
                }
                await hcRpc.modernuser.authentication.advancedLogin({ provider, data, userid: login.profile.id })
                return {
                    active: true,
                    onboarded: login.onboarded,
                }
            }


            if (profiles.length > 1) {
                const popup = new ChooseAccount({
                    login: {
                        plugin: provider,
                        data
                    },
                    profiles: profiles
                })
                popup.show()

                return await new Promise((resolve, reject) => {
                    popup.hideOnOutsideClick = false;

                    popup.addEventListener('hide', () => {
                        reject(new Error(`You failed to choose an account`))
                    })
                    popup.addEventListener('complete', async () => {
                        try {
                            resolve(await doLogin(profiles.find(x => x.profile.id == popup.value)))
                        } catch (e) {
                            reject(e)
                        }
                        popup.hide()
                    })
                })
            } else {
                // Now, the user could be signing up to an inactive login
                return await doLogin(profiles[0])
            }

        }
        case 'signup': {
            await hcRpc.modernuser.signup(provider, data)
            return {
                active: false
            }
        }

        case 'reset': {
            await hcRpc.modernuser.authentication.initiate_reset(provider, data)
            return {
                active: true
            }
        }

        case 'account_share': {
            await hcRpc.modernuser.addTenant(provider, data)
            window.location = '/$/modernuser/onboarding/static/request/'
            return {
                active: true
            }

        }

    }
}


export default {
    fetchLoginWidgets,
    executeAction,
    provider_data_symbol: pluginData
}