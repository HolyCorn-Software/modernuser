/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module allows the system to send WhatsApp notifications to users
 */

import template_descriptions from "../../../lib/template_descriptions.mjs";
import { Exception } from "../../../../../../system/errors/backend/exception.js";
import NotificationProviderModel from "../../model.mjs";
import { WhatsAppNotificationCore } from "./core.mjs";


const template_map_symbol = Symbol()


export default class WhatsAppNotificationProvider extends NotificationProviderModel {


    constructor(params) {
        super()

        this[core_symbol] = new WhatsAppNotificationCore(this)

        this.templateMap = params.template_map
    }

    /**
     * This is a map between standard templates used by the system to communicate, unto templates that exist in a WhatsApp business API account.
     * @param {import("faculty/modernuser/notification/message-templates.js").TemplateMap}
     */
    set templateMap(map) {
        WhatsAppNotificationProvider.checkParams(map)
        this[template_map_symbol] = map
    }

    /**
     * @returns {import("faculty/modernuser/notification/message-templates.js").TemplateMap}
     */
    get tempateMap() {
        return this[template_map_symbol]
    }


    /**
     * This method checks that the credentials supplied for this provider (whatsapp) are correct.
     * @param {import("./types.js").WhatsAppProviderCredentials} template_map 
     * @returns {Promise<void>}
     */
    static checkParams(template_map) {


        const missing_keys = []

        for (let key in template_descriptions) {
            if (typeof template_map?.[key] !== 'string') {
                missing_keys.push(key)
            }
        }

        if (missing_keys.length > 0) {

            throw new Exception(
                `Please complete the ${'template_map'.yellow.dim} field of the whatsapp notification provider credentials by:\n\n`
                + missing_keys.map(
                    (key, index) => ` ${(index+1).toString().blue}) indicating the template message that is to play the role of ${key.yellow}.\n${template_descriptions[key].cyan}.\nSpecify the WhatsApp business messaging template to use for the role.\nFor example, to specify, you can edit the credentials such that we have ${`{template_map:{${key.blue}:${`'cayofedpeople_${key}'`.yellow}}}`.green}`
                ).join('\n\n')
                + `\nFor the complete description of templates, refer to ${new URL('../../../lib/template_descriptions.mjs', import.meta.url).href.blue}`
            )
        }

    }



    /**
     * Providers implement this method so that the system can call it when a message has to reach a user
     * @param {import("faculty/modernuser/notification/types.js").MessageData} message 
     * @param {import("./types.js").WhatsAppContact} contact 
     * @returns {Promise<void>}
     */
    async notify(message, contact) {
        await this[core_symbol].sendTextMessage({ phone: contact.phone, title: message.subject, content: message.content })
    }



    /**
     * 
     * @param {import("./types.js").WhatsAppContact} data 
     */
    authNewUser(data) {
        //TODO: Send a template message telling the user to press 'Yes' to continue. When he does so, WhatsApp will allow us to constantly message him afterwards
    }

    /**
     * This method is used to validate a WhatsApp contact
     * @param {import("./types.js").WhatsAppContact} data 
     * @returns {Promise<void>}
     */
    async validateContact(data) {
        if ((data.phone?.length || '') < 5) { //At least, there's no country with less than 5 digits for phone numbers
            throw new Exception(`Invalid input encountered when processing a WhatsApp contact. Make sure you have entered your phone number`)
        }
        //TODO: Detect country code and check the phone number accordingly
    }

    /**
     * Gets the bearer token from the database
     * @returns {Promise<import("./types.js").WhatsAppProviderCredentials>}
     */
    async getCredentials() {
        return (await this.$data.credentials_collection.findOne({ name: this.$data.name }))
    }

    static get credential_fields() {
        return ['bearer_token', 'phone_number_id', 'template_map']
    }

    static get client_credential_fields() {
        return []
    }

    async init() {
        console.log(`WhatsApp notification initialized!`.cyan)
    }

    get label() {
        return `WhatsApp`
    }
}

const core_symbol = Symbol(`WhatsAppNotificationProvider.prototype.core`)