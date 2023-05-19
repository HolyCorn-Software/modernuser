/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This module provides the world with methods from the notifications module
 */

import modernuserPlugins from "../../plugins.mjs";
import NotificationController from "../controller.mjs";



export default class NotificationPublicMethods {

    /**
     * 
     * @param {NotificationController} controller 
     */
    constructor(controller) {

        this[controller_symbol] = controller
        this.events = controller.events.public

    }
    async getProviders() {
        return modernuserPlugins.loaded.namespaces.notification.map(x => ({ name: x.descriptor.name, label: x.descriptor.label, faculty: x.descriptor.faculty, form: x.descriptor.credentials.form }))
    }



}


const controller_symbol = Symbol(`NotificationPublicMethods.prototype.controller`)