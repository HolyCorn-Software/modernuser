/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This module provides the world with methods from the notifications module
 */

import NotificationController from "../controller.mjs";



export default class NotificationPublicMethods {

    /**
     * 
     * @param {NotificationController} controller 
     */
    constructor(controller) {

        this[controller_symbol] = controller

    }

    /**
     * This method retrieves the list of all providers
     * @returns {Promise<[{name: string, label:string}]>}
     */
    async getProviders() {
        return this[controller_symbol].providers.provider_public_data
    }


}


const controller_symbol = Symbol(`NotificationPublicMethods.prototype.controller`)