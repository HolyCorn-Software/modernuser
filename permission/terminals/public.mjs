/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module contains the methods that are publicly available, and relate to permission management
 * 
 */

import { FacultyPublicMethods } from "../../../../system/comm/rpc/faculty-public-methods.mjs";
import PermissionDataController from "../data/controller.mjs";
import PermissionGrantsController from "../grants/controller.mjs";
import PermissionDataPublicMethods from './public/data.mjs'
import PermissionGrantsPublicMethods from "./public/grants.mjs";




export default class PermissionsPublicMethods extends FacultyPublicMethods {

    /**
     * 
     * @param {PermissionDataController} data_controller 
     * @param {PermissionGrantsController} grants_controller
     */
    constructor(data_controller, grants_controller) {
        super();

        this[data_controller_symbol] = data_controller
        this[grants_controller_symbol] = grants_controller

        this.data = new PermissionDataPublicMethods(data_controller)
        this.grants = new PermissionGrantsPublicMethods(grants_controller)
    }


}



const data_controller_symbol = Symbol(`PermissionnsPublicMethods.prototype.data_controller`)
const grants_controller_symbol = Symbol(`PermissionnsPublicMethods.prototype.grants_controller`)