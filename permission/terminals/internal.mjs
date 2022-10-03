/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * 
 * This module allows other faculties to access functionalities related to managing permissions
 */

import PermissionDataController from "../data/controller.mjs"
import PermissionGrantsController from "../grants/controller.mjs"
import PermissionDataInternalMethods from "./internal/data.mjs"
import PermissionGrantsInternalMethods from "./internal/grants.mjs"



export default class PermissionsInternalMethods {

    /**
     * 
     * @param {PermissionDataController} data_controller 
     * @param {PermissionGrantsController} grants_controller 
     */
    constructor(data_controller, grants_controller) {

        this[data_controller_symbol] = data_controller
        this[grants_controller_symbol] = grants_controller


        this.data = new PermissionDataInternalMethods(data_controller)
        this.grants = new PermissionGrantsInternalMethods(grants_controller)

    }
}


const data_controller_symbol = Symbol(`PermissionsInternalMethods.prototype.data_controller`)
const grants_controller_symbol = Symbol(`PermissionsInternalMethods.prototype.grants_controller`)