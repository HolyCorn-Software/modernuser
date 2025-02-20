/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This module provides methods to other faculties related to managing who exercises which permission
 */

import PermissionGrantsController from "../../grants/controller.mjs";


export default class PermissionGrantsInternalMethods {

    /**
     * 
     * @param {PermissionGrantsController} controller 
     */
    constructor(controller) {

        this[controller_symbol] = controller;
    }



    /**
     * Checks if a user has at least one of the stated permissions
     * @param {object} param0
     * @param {string} param0.userid The user
     * @param {string[]} param0.permissions An array of permissions to checked
     * @param {modernuser.permission.PermissionIntent} param0.intent
     * @param {object} param0.flags
     * @param {boolean} param0.flags.throwError If set to false, we'll not throw a not authorized error
     * @returns {Promise<boolean>}
     */
    async userPermitted({ userid, permissions, intent, flags }) {

        return await this[controller_symbol].userPermitted({ ...arguments[1] })
    }


    /**
     * This method finds all users that have a given set of permissions.
     * 
     * For example, we could find all users that have the right to modify other's contacts
     * @param {object} param0 
     * @param {(keyof modernuser.permission.AllPermissions)[]} param0.permissions
     */
    async findUsersByPermission({ permissions }) {
        return await this[controller_symbol].getUsersWithPermissions({ ...arguments[1] })
    }




}



const controller_symbol = Symbol(`PermissionGrantsInternalMethods.prototype.controller`)