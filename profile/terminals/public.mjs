/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * 
 * This module provides secured public methods in relation to user profiles
 */

import PermissionGrantsController from "../../permission/grants/controller.mjs";
import UserAuthenticationController from "../../authentication/controller.mjs"
import UserProfileController from "../controller.mjs"
import muser_common from "muser_common";



const controller_symbol = Symbol(`UserProfileInternalMethods.prototype.controller`)

const authentication_controller_symbol = Symbol(`UserProfileInternalMethods.prototype.authentication_controller`)

const permission_grants_controller_symbol = Symbol()

export default class UserProfilePublicMethods {

    /**
     * 
     * @param {UserProfileController} controller 
     * @param {UserAuthenticationController} authenticationController 
     * @param {PermissionGrantsController} permission_grants_controller
     */
    constructor(controller, authenticationController, permission_grants_controller) {

        /** @type {UserProfileController} */
        this[controller_symbol] = controller;

        /** @type {UserAuthenticationController} */
        this[authentication_controller_symbol] = authenticationController;

        /** @type {PermissionGrantsController} */
        this[permission_grants_controller_symbol] = permission_grants_controller;
    }

    /**
     * Searches all users that match a particular filter
     * @param {string} filter 
     */
    async fetchUsers(filter) {
        const userid = (await muser_common.getUser(arguments[0])).id
        await this[permission_grants_controller_symbol].userPermitted(
            {
                userid,
                intent: { freedom: 'use' },
                permissions: ['permissions.modernuser.profiles.search'],
            }
        );
        return await this[controller_symbol].fetchUsers(arguments[1])
    }

    /**
     * This method is used to update a user's own profile
     * @param {modernuser.profile.MutableUserProfileData} data 
     * @returns {Promise<void>}
     */
    async updateMyProfile(data) {
        data = arguments[1]

        await this[controller_symbol].setProfile(
            {
                id: (await muser_common.getUser(arguments[0])).id,
                profile: data
            }
        )
    }

    /**
     * This method automatically creates a user, if this is the first time anyone is signing up
     * to the platform.
     * It does so, and logs in the user, and the user will be assigned superuser permissions
     */
    async adam() {
        if (!await this[controller_symbol].noProfileExists()) {
            throw new Exception(`This method only works when there's no user on the platform`)
        }
        const id = await this[controller_symbol].createProfile({ icon: '/$/shared/static/logo.png', label: 'Adam' })
        //The permissions would have already been granted
        const token = await this[authentication_controller_symbol].issueToken({ userid: id })

        /** @type {FacultyPublicJSONRPC} */
        const client = arguments[0];
        (await client.resumeSessionFromMeta()).setVar(UserAuthenticationController.sessionVarName, token);
    }

    /**
     * This method gets the label on a user's account
     * @param {string} id 
     * @returns {Promise<string>}
     */
    async getLabel(id) {
        return (await this[controller_symbol].getProfile({ id: arguments[1] })).label
    }

    /**
     * This method returns data about a single user profile
     * @param {string} id 
     * @returns {Promise<modernuser.profile.UserProfileData>}
     */
    async getProfile(id) {
        await muser_common.whitelisted_permission_check(
            {
                userid: (await muser_common.getUser(arguments[0])).id,
                permissions: ['permissions.modernuser.profiles.search'],
            }
        )
        return await this[controller_symbol].getProfile({ id: arguments[1] })
    }


}



/**
 * @type {modernuser.permission.PermissionData[]}
 */
export const permissions = [
    {
        label: `Search user profiles`,
        name: 'permissions.modernuser.profile.search'
    }
]