/*
Copyright 2022 HolyCorn Software
The CAYOFED People System

The Modern Faculty of Users
This module defines a minimum structure that must be implemented by all authentication provider widgets in the system
*/

import { Widget } from "/$/system/static/lib/hc/lib/widget.js"



export const provider_data_symbol = Symbol(`LoginProviderWidget.prototype.provider_data`)

export default class LoginProviderWidget extends Widget {

    constructor() {
        super(...arguments);

        /** @type {import("../types.js").SecurityProviderPublicData} */ this[provider_data_symbol]

        /** @type {function(('complete'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener
    }

    /**
     * The provider has to override this getter to provide access to data entered by the user
     * @returns {object}
     */
    get values() {
        throw new Error(`Dear user, the login provider ${this[provider_data_symbol]?.name} is incomplete.`)
    }

    /**
     * The system calls this method when it wants to inform the provider that an action is done. E.g login done
     * 
     * The provider should override this method to decide on it's next step.
     * 
     * @param {object} param0
     * @param {('login'|'signup'|'reset')} param0.action
     * @param {object} param0.data
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
     * @param {('login'|'signup'|'reset')} face
     * 
     */
    set face(face) {
        
    }


}