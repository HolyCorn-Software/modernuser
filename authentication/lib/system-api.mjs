/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module is responsible for providing a usable interface through which providers can access the system
 * 
 */

import UserAuthenticationController from "../controller.mjs";
import UserAuthenticationProvider from "./provider.mjs";

const platform = FacultyPlatform.get();

export default class AuthenticationProviderSystemAPI {

    /**
     * 
     * @param {UserAuthenticationProvider} provider 
     * @param {UserAuthenticationController} auth_controller 
     */
    constructor(provider, auth_controller, profile_controller) {
        this[provider_symbol] = provider;
        this[auth_controller_symbol] = auth_controller
    }

    /**
     * This method is used to activate a login.
     * 
     * This method returns a token for the login
     * @param {object} mindata 
     * @returns {Promise<string>}
     */
    async activateLogin(mindata) {
        const login = await this[auth_controller_symbol].setLoginEnabled({ data: mindata, provider: this[provider_symbol].$data.name }, true)
        return await this[auth_controller_symbol].issueToken({
            userid: login.userid
        })
    }
    /**
     * This method is used to disable a login
     * @param {object} mindata 
     * @returns {Promise<void>}
     */
    async deactivateLogin(mindata) {
        return await this[auth_controller_symbol].setLoginEnabled({ data: mindata, provider: this[provider_symbol].$data.name }, false)
    }

    /**
     * This method is used to override a login
     * @param {object} mindata 
     * @param {object} newdata
     * @returns {Promise<void>}
     */
    async updateLogin(mindata, newdata) {
        return await this[auth_controller_symbol].updateLogin({ data: mindata, newdata, provider: this[provider_symbol].$data.name }, false)
    }

    /**
     * This method is used to override a login
     * @param {object} data
     * @param {boolean} active
     * @returns {Promise<void>}
     */
    async createProfileAndLogin(data, active) {
        let id = await this[auth_controller_symbol].createUserProfile()

        return await this[auth_controller_symbol].createLoginDirect({ data, userid: id, active, provider: this[provider_symbol].$data.name })
    }

    /**
     * This method finds a login.
     * 
     * Of course, it doesn't go through the process of obtaining a unique representation of the data
     * @param {object} data 
     */
    async findLoginDirect(data) {
        return await this[auth_controller_symbol].searchLoginByDataDirect({ data, provider: this[provider_symbol].$data.name })
    }

    get frontendPath() {
        return `$/${platform.descriptor.name}/static/authentication/providers/${this[provider_symbol].$data.name}/frontend/`
    }

}


const auth_controller_symbol = Symbol(`AuthenticationProviderSystemAPI.prototype.auth_controller`)
const provider_symbol = Symbol(`AuthenticationProviderSystemAPI.prototype.provider`)