/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module is part of the phonelogin provider in the Modern Faculty of Users.
 * 
 * This module allows the provider to send notifications to a user over WhatsApp
 */


import fetch from 'node-fetch'
import { Exception } from '../../../../../../../../system/errors/backend/exception.js';

const template_map_symbol = Symbol()

export default class PhoneLoginWhatsAppNotifier {


    /**
     * 
     * @param {object} param0 
     * @param {WhatsAppMessagingAPI} param0.api
     * @param {string} param0.provider_name
     * @param {import('./types.js').WhatsAppTemplateMap} param0.template_map
     */
    constructor({ api, provider_name, template_map }) {
        this.provider_name = provider_name
        Object.assign(this, arguments[0])
    }

    /**
     * @param {import('./types.js').WhatsAppTemplateMap} map
     */
    set template_map(map) {
        PhoneLoginWhatsAppNotifier.checkParams(map, { provider_name: this.provider_name })
        this[template_map_symbol] = map
    }

    /**
     * @returns {import('./types.js').WhatsAppTemplateMap}
     */
    get template_map() {
        return this[template_map_symbol]
    }


    /**
     * This method checks that the credentials supplied for this provider (whatsapp) are correct.
     * @param {import("./types.js").WhatsAppTemplateMap} template_map 
     * @param {object} param1
     * @param {string} param1.provider_name
     * @returns {Promise<void>}
     */
    static checkParams(template_map, { provider_name }) {

        /** @type {import("./types.js").WhatsAppTemplateMap} */
        const error_messages = {
            msg_activate_new_account: `This message is sent to a client after he has created an account. It takes one parameter: The activation link.`,
            msg_reset_password: `This message is sent to a client who wishes to reset his account. It takes one parameter: The reset link.`
        }

        const missing_keys = []

        for (let key in error_messages) {
            if (typeof template_map?.[key] !== 'string') {
                missing_keys.push(key)
            }
        }
        if (missing_keys.length > 0) {
            let error_message = `The credentials for the ${provider_name} provider are not properly set.\nPlease complete the ${'whatsapp_template_map'.blue} field by:\n\n`
            for (let key of missing_keys) {
                error_message += `\tindicating the WhatsApp template message that is to play the role of ${key.blue}.\n${error_messages[key]}\nFor example ${`{whatsapp_template_map:{${key.green}:${`\'cayofedpeople_${key.replace(/^msg_/, '')}\'`.yellow}}}`.blue}\n\n`

            }
            throw new Exception(error_message)
        }

    }



    /**
     * Call this method to send the message that's supposed to be sent to a new user, asking him to activate his account
     * @param {object} param0 
     * @param {string} param0.phone
     * @param {string} param0.link
     * @param {string} param0.language
     * @returns {Promise<void>}
     */
    async msg_activate_new_account({ phone, link, language = 'en' }) {
        await this.api.sendTextTemplate({
            template: this.template_map.msg_activate_new_account,
            language,
            phone,
            params: {
                body: [link]
            }
        });

    }


    /**
     * Call this method to send the message that's supposed to be sent to a who wishes to reset his password
     * @param {object} param0 
     * @param {string} param0.phone
     * @param {string} param0.link
     * @param {string} param0.language
     * @returns {Promise<void>}
     */
    async msg_reset_password({ phone, link, language = 'en' }) {
        await this.api.sendTextTemplate({
            template: this.template_map.msg_reset_password,
            language,
            phone,
            params: {
                body: [link]
            }
        });

    }


}



export class WhatsAppMessagingAPI {

    /**
     * 
     * @param {object} param0 
     * @param {WhatsAppMessagingAPIHooks} param0.hooks
     */
    constructor({ hooks }) {

        if (!hooks?.getBearerToken) {
            throw new Error(`Please pass an object for the parameter 'hooks', that follows the pattern defined by the class WhatAppMessagingAPIHooks`)
        }

        /** @type {WhatsAppMessagingAPIHooks} */
        this.hooks = hooks


        //TODO: Implement Developer Notifications

    }

    /**
     *  Used to send a text-based template image
     * @param {object} param0 
     * @param {string} param0.template
     * @param {string} param0.language
     * @param {string} param0.phone
     * @param {{body: [string], header: [string]}} param0.params
     * @returns {Promise<void>}
     */
    async sendTextTemplate({ template, language, phone, params }) {

        /**
         * Transforms text params to full params
         * @param {[string]} strings 
         */
        const transform_params = (strings) => {
            return strings?.map(string => ({ type: 'text', text: string }))
        }


        return await this.sendTemplateMessage({
            template,
            language,
            phone,
            params: (() => {
                const new_params = {}
                for (let section in params) {
                    new_params[section] = transform_params(params[section])
                }
                return new_params
            })()
        })
    }

    /**
     * This method is used to send a template message on WhatsApp
     * @param {object} param0 
     * @param {string} param0.template
     * @param {string} param0.language
     * @param {string} param0.phone
     * @param {{body: [import("./types.js").WhatsAppTemplateTextParam], header: [import("./types.js").WhatsAppTemplateParam]}} param0.params
     * @returns {Promise<void>}
     */
    async sendTemplateMessage({ template, language, phone, params }) {


        let data = await (await this.rawRequest({
            request_params: {
                method: 'POST'
            },

            body: {
                recipient_type: 'individual',
                type: 'template',
                to: phone,
                template: {
                    name: template,
                    language: {
                        code: language
                    },
                    components: (() => {
                        let results = []
                        for (let key in params) {
                            results.push(

                                {
                                    type: key,
                                    parameters: params[key]
                                }

                            )
                        }
                        return results
                    })()
                }
            }
        })).json();

        if (data.error) {
            throw new Error(`Could not send WhatsApp message\n ${JSON.stringify(data.error)}`)
        }


        return data;
    }

    async rawRequest({ body, headers, request_params }) {

        const fullBody = {
            messaging_product: 'whatsapp',
            ...body
        }

        return await fetch(await this.get_api_url(), {
            method: 'POST',

            headers: {
                Authorization: `Bearer ${await this.hooks.getBearerToken()}`,
                'Content-Type': 'application/json',
                ...headers
            },
            body: JSON.stringify(fullBody),

            ...request_params,
        })
    }

    async get_api_url() {
        return `https://graph.facebook.com/v13.0/${await this.hooks.getPhoneNumberID()}/messages`
    }


}


export class WhatsAppMessagingAPIHooks {

    constructor() {

    }

    /**
     * This method should be overriden.
     * 
     * The use of the method is to fetch the Bearer auth token to be used for subsequent calls
     * @returns {Promise<string>}
     */
    async getBearerToken() {
        throw new Error(`WhatsAppMessagingAPIHooks not properly implemented. There's no real way to retrieve a bearer token`)
    }


    /**
     * This method should be overriden.
     * 
     * The use of the method is to fetch the phone number id to be used for subsequent calls
     * @returns {Promise<string>}
     */
    async getPhoneNumberID() {
        throw new Error(`WhatsAppMessagingAPIHooks not properly implemented. There's no real way to retrieve the phone number to be used`)
    }

}