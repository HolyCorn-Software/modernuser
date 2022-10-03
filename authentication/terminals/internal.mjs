/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * 
 * This module provides methods to other faculties
 */

import UserAuthenticationController from "../controller.mjs";


export default class UserAuthenticationInternalMethods {

    /**
     * 
     * @param {UserAuthenticationController} controller 
     */
    constructor(controller) {


        /** @type {UserAuthenticationController} */
        this[controller_symbol] = controller;

    }

    /**
     * This method is called by other faculties (other than modernuser) to verify a user's login.
     * 
     * It returns the user's id
     * @param {object} param0 
     * @param {string} param0.token
     * @returns {Promise<string>}
     */
    async verify({ token }) {
        token = arguments[1]?.token
        return await this[controller_symbol].tokenAuth({ token })
    }

    /**
     * This method authenticates the given token, and then finds the associated user profile
     * @param {object} param0 
     * @param {string} param0.token
     * @returns {Promise<import("faculty/modernuser/profile/types.js").UserProfileData>}
     */
    async getProfile({ token }) {
        return await this[controller_symbol].getProfile({ token: arguments[1]?.token })
    }

}


const controller_symbol = Symbol(`SecurityInternalMethods.prototype.controller`)