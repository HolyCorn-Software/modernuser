/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * 
 * This module is part of the phonelogin provider and controls how notifications are sent to a user
 * 
 */

import PhoneLoginProvider from "../provider.mjs";
import PhoneLoginWhatsAppNotifier, { WhatsAppMessagingAPI, WhatsAppMessagingAPIHooks } from "./whatsapp/notifier.mjs";



const credentials_last_fetch_time_symbol = Symbol(`PhoneLoginProvider.prototype.credentials_last_fetch_time`)
const credentials_cache_symbol = Symbol(`PhoneLoginProvider.prototype.credentials_cache`)




export default class PhoneLoginNotifier {

    /**
     * 
     * @param {PhoneLoginProvider} provider
     * @param {import("./whatsapp/types.js").WhatsAppTemplateMap} template_map 
     */
    constructor(provider, template_map) {

        this.provider = provider;

        this.whatsapp = new PhoneLoginWhatsAppNotifier({ api: new WhatsAppMessagingAPI({ hooks: new DefaultWhatsAppMessagingAPIHooks(this) }), provider_name: provider.$data.name, template_map })
        
    }

    async activate_new_account({ phone, link, language }) {
        await this.whatsapp.msg_activate_new_account({ phone, language, link })
    }

    /**
     * This is used to send a message to a user who wants to reset his password
     * @param {object} param0 
     * @param {string} param0.phone
     * @param {string} param0.link
     * @param {string} param0.language
     */
    async reset_password({ phone, link, language }) {
        await this.whatsapp.msg_reset_password({ phone, language, link })
    }

    /**
     * Fetches the credentials for this provider (PhoneLoginProvider) afresh from the database
     * @returns {Promise<import("../types.js").PhoneLoginCredentials>}
     */
    async fetch_credentials_from_database() {

        //caching time is 10s
        if (((Date.now() - this[credentials_last_fetch_time_symbol]) < 10_000) && typeof this[credentials_cache_symbol] !== 'undefined') {
            return this[credentials_cache_symbol]
        }

        let data = await this.provider.$data.credentials_collection.findOne({ name: this.provider.$data.name });
        this[credentials_last_fetch_time_symbol] = Date.now();
        this[credentials_cache_symbol] = data;
        return data;
    }

}


export class DefaultWhatsAppMessagingAPIHooks extends WhatsAppMessagingAPIHooks {

    /**
     * 
     * @param {PhoneLoginNotifier} notifier 
     */
    constructor(notifier) {
        super();
        this.notifier = notifier;
    }

    async getBearerToken() {
        return (await this.notifier.fetch_credentials_from_database()).whatsapp_api_bearer_auth_token
    }

    async getPhoneNumberID() {
        return (await this.notifier.fetch_credentials_from_database()).whatsapp_api_phone_number_id
    }
}