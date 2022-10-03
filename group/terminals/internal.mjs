/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module contains functions that have been made available to other faculties. 
 */

import GroupMembershipController from "../membership/controller.mjs";
import GroupDataController from "../data/controller.mjs";



export default class UserGroupInternalMethods {

    /**
     * 
     * @param {GroupMembershipController} membership_controller 
     */
    constructor(data_controller, membership_controller) {

        /** @type {GroupMembershipController} */
        this[membership_controller_symbol] = membership_controller

        /** @type {GroupDataController} */
        this[data_controller_symbol] = data_controller
    }

}


const membership_controller_symbol = Symbol(`UserGroupInternalMethods.prototype.controller`)
const data_controller_symbol = Symbol(`UserGroupInternalMethods.prototype.controller`)