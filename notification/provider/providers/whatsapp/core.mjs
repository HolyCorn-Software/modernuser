/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module contains the main functional features of the WhatsApp notification provider
 */

import WhatsAppNotificationProvider from "./provider.mjs"


const provider_symbol = Symbol()

export class WhatsAppNotificationCore {



    /**
     * 
     * @param {WhatsAppNotificationProvider} provider 
     */
    constructor(provider) {
        this[provider_symbol] = provider
    }


    /**
     * This method is used to send a text message via WhatsApp.
     * @param {object} param0 
     * @param {string} param0.phone
     * @param {string} param0.title
     * @param {string} param0.content
     * @returns {Promise<void>}
     */
    async sendTextMessage({ phone, title, content }) {
        await this.rawRequest(
            {
                to: phone,
                body: {
                    type: 'text',
                    text: {
                        body: `${title ? `*${title}*\n` : ''}${content}`,
                        preview_url: false
                    }
                }
            }
        )
    }



    /**
     *  Used to send a text-based template image
     * @param {object} param0 
     * @param {string} param0.template
     * @param {string} param0.language
     * @param {string} param0.phone
     * @param {{body: [string], header: [string], footer:[string]}} param0.params
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
            recipient_type: 'individual',
            ...body
        }

        let credentials = await this.getCredentials()

        return await fetch(await this.get_api_url(credentials.phone_number_id), {
            method: 'POST',

            headers: {
                Authorization: `Bearer ${credentials.bearer_token}`,
                'Content-Type': 'application/json',
                ...headers
            },
            body: JSON.stringify(fullBody),

            ...request_params,
        })
    }

    async get_api_url(phone_id) {
        return `https://graph.facebook.com/v13.0/${phone_id || (await this[provider_symbol].getCredentials()).phone_number_id}/messages`
    }



    async getCredentials() {
        return await this[provider_symbol].getCredentials()
    }




}