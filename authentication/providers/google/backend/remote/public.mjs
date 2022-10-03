/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * 
 * The Modern Faculty of Users
 * This module allows clients to access publicly available features of the google authentication provider
 */

import GoogleProvider from "../provider.mjs";



export default class GooglePublicMethods {
    
    /**
     * 
     * @param {GoogleProvider} provider 
     */
    constructor(provider){

        this[provider_symbol] = provider;
    }

    async getClientID(){
        return this[provider_symbol].client_id
    }
    
}


const provider_symbol = Symbol(`GooglePublicMethods.prototype.provider`)