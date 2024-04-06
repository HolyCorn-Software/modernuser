/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * 
 * This module provides methods to other faculties. Methods related to retrieving user profiles
 */

import UserAuthenticationController from "../../authentication/controller.mjs"
import UserProfileController from "../controller.mjs"



export default class UserProfileInternalMethods {

    /**
     * 
     * @param {UserProfileController} controller 
     * @param {UserAuthenticationController} authenticationController 
     */
    constructor(controller, authenticationController) {

        /** @type {UserProfileController} */
        this[controller_symbol] = controller;

        /** @type {UserAuthenticationController} */
        this[authentication_controller_symbol] = authenticationController;
    }

    /**
     * This method retrieves a user's profile.
     * 
     * @param {object} param0 
     * @param {string} param0.id
     * @param {string} param0.token If specified, the id will be fetched by using this auth token
     * @returns {Promise<modernuser.profile.UserProfileData>}
     */
    async get_profile({ id, token }) {

        if (!arguments[1]) {
            console.trace(`How did this happen ? `.red)
        }
        id = arguments[1].id
        token = arguments[1].token

        if ((typeof token !== 'undefined') && token != null || !id) {
            id = await this[authentication_controller_symbol].tokenAuth({ token })
        }

        return await this[controller_symbol].getProfile({ id })
    }

    /**
     * This method is used to retrieve many user profiles at once
     * @param {string[]} ids The ids of the users
     * @returns {Promise<modernuser.profile.UserProfileData[]>}
     */
    async getProfiles(ids) {
        return await this[controller_symbol].getProfiles(arguments[1])
    }

    /**
     * This method is used to search profiles, and with optional restrictions on allowed profiles.
     * @param {object} param0
     * @param {string} param0.text 
     * @param {string[]} param0.restriction If specified (an array of userids), the search will only include the specied profiles
     * @returns {Promise<modernuser.profile.UserProfileData[]>}
     */
    async searchProfiles({ text, restriction }) {
        return await this[controller_symbol].fetchUsers(arguments[1]?.text, arguments[1]?.restriction)
    }


    /**
     * This is used to directly set a user's profile information
     * @param {object} param0 
     * @param {string} param0.id
     * @param {{label: string, icon:string}} param0.profile
     * @returns {Promise<void>}
     */
    async setProfile({ id, profile }) {
        await this[controller_symbol].setProfile({ ...arguments[1] })
    }


    /**
     * This method is used to create a new user profile
     * @param {Omit<modernuser.profile.UserProfileData, "id"|"time">} data 
     * @returns {Promise<string>}
     */
    async createProfile(data) {
        return await this[controller_symbol].createProfile(arguments[1])
    }

    /**
     * This method creates a temporary user profile
     * @param {object} param0
     * @param {string} param0.label
     * @param {string} param0.icon
     * @param {boolean} param0.temporal
     * @returns {Promise<{token: string, profile: modernuser.profile.UserProfileData}>}
     */
    async createTemporalProfile({ label, icon, temporal }) {
        const userid = await this[controller_symbol].createProfile({
            icon: arguments[1]?.icon || `${FacultyPlatform.get().server_domains.secure}/$/shared/static/logo.png`,
            label: arguments[1]?.label || `Temporal ${new Date().toTimeString()}`,
            temporal: arguments[1]?.temporal || true
        });

        const token = await this[authentication_controller_symbol].issueToken({ userid })

        return {
            profile: await this.get_profile(arguments[0], { id: userid }),
            token
        }

    }

}


const controller_symbol = Symbol(`UserProfileInternalMethods.prototype.controller`)

const authentication_controller_symbol = Symbol(`UserProfileInternalMethods.prototype.authentication_controller`)
