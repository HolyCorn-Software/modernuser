/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module is a model for all providers of notification
 * 
 */

import { BaseModel } from "../../../../system/lib/libFaculty/provider-driver.js";



export default class NotificationProviderModel extends BaseModel {

    constructor() {
        super();


    }

    /**
     * This method is used by the provider to do whatever it has to, so that it can be assured of being able to reach the user with these details.
     * 
     * @param {object} data 
     * @returns {Promise<void>}
     */
    async authNewUser(data){
        
    }

    /**
     * This method is used by the system to validate a user's contact. Are the details actually correct ? The provider should tell us either by throwing exceptions
     * @param {object} data 
     * @returns {Promise<void>}
     */
    async validateContact(data){
        
    }
    

    /**
     * Providers implement this method so that the system can call it when a message has to reach a user
     * @param {import("faculty/modernuser/notification/types.js").MessageData} message 
     * @param {object} contact_data 
     * @returns {Promise<void>}
     */
    async notify(message, contact_data){

    }


    /**
    * The fields to that make up the credentials for the provider.
    * Specifying this will make the system check for incomplete data
    */
    static get client_credential_fields() {

    }

    /**
     * The fields of the providers credentials in the database
     * that will be sent to the client
     */
    static get credential_fields() {

    }

    /**
     * Initializations that providers must make during boot time
     */
    async init() {

    }

    /**
     * This is a human-friendly name for the provider
     */
    get label(){
        
    }




}