/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module is responsible for providing a usable interface through which providers can access the system
 * Updated in 2023 as modernuser is now plugin-based, not provider-based.
 * 
 */

import UserAuthenticationController from "../controller.mjs";
import AuthenticationPlugin from "./model.mjs";


const platform = FacultyPlatform.get();

export default class AuthPluginSystemAPI {

    /**
     * 
     * @param {AuthenticationPlugin} plugin 
     * @param {UserAuthenticationController} auth_controller 
     */
    constructor(plugin, auth_controller) {
        this[pluginSymbol] = plugin;
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
        const login = await this[auth_controller_symbol].setLoginEnabled({ data: mindata, plugin: this[pluginSymbol].descriptor.name }, true)
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
        return await this[auth_controller_symbol].setLoginEnabled({ data: mindata, plugin: this[pluginSymbol].descriptor.name }, false)
    }

    /**
     * This method is used to override a login
     * @param {object} mindata 
     * @param {object} newdata
     * @returns {Promise<void>}
     */
    async updateLogin(mindata, newdata) {
        return await this[auth_controller_symbol].updateLogin({ data: mindata, newdata, plugin: this[pluginSymbol].descriptor.name }, false)
    }

    /**
     * This method is used to override a login
     * @param {object} data
     * @param {boolean} active
     * @param {Omit<import("faculty/modernuser/profile/types.js").UserProfileData, "id">} profile
     * @returns {Promise<void>}
     */
    async createProfileAndLogin(data, active, profile) {
        let id = await this[auth_controller_symbol].createUserProfile(profile)

        return await this[auth_controller_symbol].createLoginDirect({ data, userid: id, active, plugin: this[pluginSymbol].descriptor.name })
    }

    /**
     * This method finds a login.
     * 
     * Of course, it doesn't go through the process of obtaining a unique representation of the data
     * @param {object} data 
     */
    async findLoginDirect(data) {
        return await this[auth_controller_symbol].searchLoginByDataDirect({ data, plugin: this[pluginSymbol].descriptor.name })
    }

}


const auth_controller_symbol = Symbol(`AuthenticationProviderSystemAPI.prototype.auth_controller`)
const pluginSymbol = Symbol(`AuthenticationProviderSystemAPI.prototype.provider`)