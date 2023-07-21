/**
 * Copyright 2023 HolyCorn Software
 * The Modern Faculty of Users
 * This module provides users over the public web, with access to functionality
 * related to rolegroup management
 */

import muser_common from "muser_common";
import RoleGroupController from "../controller.mjs";




export default class RoleGroupPublicMethods extends muser_common.UseridAuthProxy.createClass(RoleGroupController.prototype) {
    /**
     * 
     * @param {RoleGroupController} controller 
     */
    constructor(controller) {
        super(controller);
        
    }
}