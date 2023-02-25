/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module contains methods that will be publicly available to users.
 * These methods are provided by phonelogin provider
 */

import muser_common from 'muser_common'
import PhoneLoginProvider from "../provider.mjs";



export default class PhoneLoginPublicMethods {

    /**
     * 
     * @param {PhoneLogin} provider 
     */
    constructor(provider) {

        /** @type {PhoneLoginProvider} */
        this[provider_symbol] = provider

    }

    /**
     * This method is used to verify and activate a pending account
     * @param {object} param0 
     * @param {string} param0.token
     * @returns {Promise<void>}
     */
    async verifyPendingAccount({ token }) {
        token = arguments[1]?.token
        const auth_token = await this[provider_symbol].verifyPendingAccount({ token })
        await (muser_common.setAuthToken(arguments[0], auth_token))
    }

    /**
     * This method is used to reset the password to an account
     * @param {object} param0 
     * @param {string} param0.token
     * @returns {Promise<void>}
     */
    async resetAccount({ token }) {
        token = arguments[1]?.token
        return await this[provider_symbol].resetPassword({ token })
    }



}

const provider_symbol = Symbol(`PhoneLoginPublicMethods.prototype.provider`)