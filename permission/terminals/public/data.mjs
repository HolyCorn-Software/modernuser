/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of User
 * This module provides the public methods that specifically deal with the data of permissions
 * 
 */

import PermissionDataController from "../../data/controller.mjs";


export default class PermissionDataPublicMethods {

    /**
     * 
     * @param {PermissionDataController} controller 
     */
    constructor(controller) {

        this[controller_symbol] = controller
    }


    /**
     * Searches the database for a permission
     * @param {string} filter 
     * @returns {Promise<[import("../../data/types.js").PermissionData]>}
     */
    async fetchPermissions(filter) {
        return await this[controller_symbol].fetchPermissions(arguments[1])
    }

    /**
     * This method returns information about a single permission.
     * @param {object} param0 
     * @param {string} param0.name
     * @returns {Promise<import("../../data/types.js").PermissionData>}
     */
    async getPermissionInfo({ name }) {
        return await this[controller_symbol].getPermission({ ...arguments[1] })
    }

    /**
     * Gets all the permissions
     * @returns {Promise<[import("../../data/types.js").PermissionData]>}
     */
    async getAll() {
        return await this[controller_symbol].getAll()
    }

}


const controller_symbol = Symbol(`PermissionnsPublicMethods.prototype.controller`)