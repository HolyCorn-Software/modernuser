/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * 
 * This module allows other faculties benefit from some features of the google authentication provider
 */


export default class GoogleInternalMethods {

    /**
     * 
     * @param {GoogleProvider} provider 
     */
    constructor(provider) {

        this[provider_symbol] = provider;
    }

    async getClientID() {
        return this[provider_symbol].client_id
    }


}




const provider_symbol = Symbol(`GooglePublicMethods.prototype.provider`)