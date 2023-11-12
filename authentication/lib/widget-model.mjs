/*
Copyright 2023 HolyCorn Software

The Modern Faculty of Users
This module defines a minimum structure that must be implemented by all authentication plugin widgets in the system
*/

import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";



export const pluginData = Symbol()
const pluginData0 = Symbol()

export default class ProviderLoginWidget extends Widget {

    /**
     * 
     * @param {object} credentials 
     */
    constructor(credentials) {
        super(...arguments);


        /** @type {function(ev:('complete'), cb:function(CustomEvent), opts?:AddEventListenerOptions)} */ this.addEventListener
    }
    /**
     * @param {modernuser.authentication.AuthPluginPublicData} val
     */
    set [pluginData](val) {
        this[pluginData0] = val
    }

    get [pluginData]() {
        return this[pluginData0]
    }

    /**
     * The plugin has to override this getter to provide access to data entered by the user
     * @returns {object}
     */
    get values() {
        throw new Error(`Dear user, the login method ${this[pluginData]?.name} is incomplete.`)
    }

    /**
     * The system calls this method when it wants to inform the plugin that an action is done. E.g login done
     * 
     * The plugin should override this method to decide on it's next step.
     * 
     * @param {object} param0
     * @param {modernuser.authentication.AuthAction} param0.action
     * @param {modernuser.authentication.frontend.LoginStatus} param0.data
     */
    async onSystemAction({ action, data }) {

    }

    /**
     * Override this setter to react to changes in the user's intention, and therefore show him the appropriate view
     * 
     * That is, if the user wants to login the face will be 'login'
     * 
     * For creating a new account the face will be 'signup'
     * 
     * @param {modernuser.authentication.AuthAction|"account_share"} face
     * 
     */
    set face(face) {

    }


}