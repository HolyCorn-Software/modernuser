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
        this[controller_symbol].createPermission(arguments[1])
    }



}



const controller_symbol = Symbol(`PermissionDataInternalMethods.prototype.controller`)