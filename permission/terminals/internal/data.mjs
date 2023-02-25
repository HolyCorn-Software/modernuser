/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This module provides methods to other faculties related to managing the data about permissions
 */

import PermissionDataController from "../../data/controller.mjs";


export default class PermissionDataInternalMethods {

    /**
     * 
     * @param {PermissionDataController} controller 
     */
    constructor(controller) {

        this[controller_symbol] = controller;
    }

    /**
     * This method is used to create a permission
     * @param {import("../../data/types.js").PermissionDataInput} param0 
     * @returns {Promise<void>}
     */
    createPermission({ name, label }) {
        return this[controller_symbol].createPermission(arguments[1])
    }

    /**
     * This method returns permissions that are associated with this permission.
     * As in... permissions that could be checked in place of this. In short, permissions that inherit this one
     * @param {string} name 
     * @returns {Promise<import("../../data/types.js").PermissionData[]>}
     */
    async getChildPermissions(name) {
        return await this[controller_symbol].getPermissionAndChildren(arguments[1])
    }



}



const controller_symbol = Symbol(`PermissionDataInternalMethods.prototype.controller`)