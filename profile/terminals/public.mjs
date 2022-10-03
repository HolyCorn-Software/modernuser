/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * 
 * This module provides secured public methods in relation to user profiles
 */

import PermissionGrantsController from "../../permission/grants/controller.mjs";
import muser_common from "../../../../common/modules/modernuser.mjs";
import UserAuthenticationController from "../../authentication/controller.mjs"
import UserProfileController from "../controller.mjs"



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
     * This method returns the label on a user's account
     * @param {string} id 
     * @returns {Promise<string>}
     */
    async getLabel(id) {
        //TODO: Check for permissions like assign permission, or that the user 
        //TODO: Find alternatives for components that depend on this method, and abandon this method.
        id = arguments[1]
        return (await this[controller_symbol].getProfile({ id })).label
    }



}



/**
 * @type {[import("faculty/modernuser/permission/data/types.js").PermissionData]}
 */
export const permissions = [
    {
        label: `Search user profiles`,
        name: 'permissions.modernuser.profile.search'
    }
]