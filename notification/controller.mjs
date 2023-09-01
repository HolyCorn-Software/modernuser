/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module determines the overall logic of everything that has to do with notifications.
 * 
 * Note that contacts here refer to users' personal contacts, not the concept of role contacts
 */

import muser_common from "muser_common";
import shortUUID from "short-uuid";
import { ULTIMATE_PERMISSION } from "../permission/data/controller.mjs";
import modernuserPlugins from "../plugins.mjs";
import "./plugin/model.mjs"; //Just Import this, so that the NotificationPlugin will be globally accessible
import ModernuserEventsServer from "./events.mjs";


const collections = Symbol()

const instance = Symbol()

export default class NotificationController {


    /**
     * 
     * @param {object} args 
     * @param {object} args.collections
     * @param {modernuser.notification.UserContactsCollection} args.collections.contacts
     * @param {modernuser.notification.TemplatesCollection} args.collections.templates
     */
    constructor(args) {

        this[collections] = args.collections
        NotificationController[instance] = this
        this.events = new ModernuserEventsServer()

        setTimeout(() => this.test().catch(e => console.log(e)), 2000)
    }
    async test() {
        await this.createTemplate(
            {
                name: 'hello_holycorn_b',
                label: `Hello HolyCorn`,
                fields: {
                    en: {

                        /** @type {modernuser.plugins.notification.whatsapp.TemplateDefinition} */
                        whatsapp: {
                            category: 'UTILITY',
                            components: [
                                {
                                    type: 'BODY',
                                    text: 'Hello, and welcome to HolyCorn Software. Do well to read our user guide.\n Click the following link to get more information. {{1}}. Thank you!'
                                }
                            ]
                        }
                    }
                }
            }
        );

    }

    /**
     * @returns { NotificationController}
     */
    static get instance() {
        return this[instance]
    }

    /**
     * This method is used to create a contact
     * @param {object} param0 
     * @param {string} param0.provider
     * @param {object} param0.data
     * @param {string} param0.userid
     * @returns {Promise<string>}
     */
    async createContact({ data, provider, userid }) {

        await this.checkContactData(provider, data);


        const id = shortUUID.generate()

        this[collections].contacts.insertOne(
            {
                id,
                data,
                provider,
                userid
            }
        )

        return id

    }

    /**
     * This method is used to check that contact data is correct
     * @param {string} provider 
     * @param {object} data 
     * @returns {Promise<void>}
     */
    async checkContactData(provider, data) {
        const plugin = modernuserPlugins.loaded.namespaces.notification.find(x => x.descriptor.name === provider);

        if (!plugin) {
            throw new Exception(`The type of contact you are adding ('${provider}'), is not supported by the system`);
        }

        try {
            const reply = await plugin.instance.reviewContact(data);
            if (!reply.valid) {
                throw new Exception(`${reply.message || "Invalid contact data"}`);
            }
        } catch (e) {
            if (!(e instanceof Exception)) {
                const errId = shortUUID.generate();
                console.error(`Could not review contact `, data, `\nbecause\n`, e, `\nError ID: ${errId}`);
                throw new Exception(`Sorry, your contact could not be added, because the system is facing issues validating the contact.\nError ID: ${errId}`);
            }
            throw e;
        }
    }

    /**
     * This method is used to update contact data
     * @param {object} param0 
     * @param {string} param0.id
     * @param {object} param0.data
     * @param {string} param0.userid
     * @returns {Promise<void>}
     */
    async updateContact({ id, data, userid }) {
        const contact = await this.getAndCheckOwnership({ id, userid })

        await this.checkContactData(contact.provider, data)

        this[collections].contacts.updateOne({ id }, { $set: { data } })
    }


    /**
     * This method is used to delete a single contact
     * @param {object} param0 
     * @param {string} param0.id
     * @param {string} param0.userid If set, checks will be made to ensure that this user owns this contact
     * @returns {Promise<void>}
     */
    async deleteContact({ id, userid }) {

        await this.getAndCheckOwnership({ id, userid })
        this[collections].contacts.deleteOne({ id })
    }

    /**
     * This method is used to check if a user owns a contact with a given id
     * @param {object} param0 
     * @param {string} param0.id
     * @param {string} param0.userid
     */
    async getAndCheckOwnership({ id, userid }) {
        const data = await this[collections].contacts.findOne({ id })

        if (!data) {
            return
        }

        await muser_common.whitelisted_permission_check(
            {
                userid,
                whitelist: userid ? [data.userid] : undefined,
                intent: {
                    freedom: 'use'
                },
                permissions: [ULTIMATE_PERMISSION.name],
            }
        );

        return data
    }


    /**
     * This method creates a new notification template
     * @param {modernuser.notification.Template} data 
     * @returns {Promise<void>}
     */
    async createTemplate(data) {

        //Check if the data is the same as the previous
        const previous = await this[collections].templates.findOne({ name: data.name })
        if (previous && JSON.stringify(previous.fields) === JSON.stringify(data.fields)) {
            //In case it is same, we return
            return;
        }

        await modernuserPlugins.waitForLoad()
        const results = await modernuserPlugins.loaded.namespaces.notification.callback.reviewTemplate(data);

        if (results.failure.length > 0) {
            throw new Exception(`Could not create message template because some plugins failed to validate it\n\n${results.failure.map(x => x.error.stack || x.error.message || x.error).join('\n')}`)
        }

        //Now, find the providers that found the template usable, but data faulty
        const incorrect = results.success.filter(res => res.value.usable && !res.value.correct)
        if (incorrect.length > 0) {
            throw new Exception(`Some fields in this template are wrongly formatted.\n\n${incorrect.map((x, i, arr) => `${arr.length > 1 ? `${i + 1})\t` : ''}${x.value.remark}`).join('\n')}`)
        }

        this[collections].templates.updateOne(
            {
                name: data.name
            },
            {
                $set: data
            },
            { upsert: true }
        )

    }

    /**
     * This method is used to notify a contact
     * @param {object} param0 
     * @param {modernuser.notification.MinContactData<{}>} param0.contact
     * @param {string} param0.template
     * @param {string} param0.language
     * @param {string[]} param0.data
     * @returns {Promise<void>}
     */
    async notify({ contact, template, language, data }) {
        const provider = await modernuserPlugins.loaded.namespaces.notification.find(x => x.descriptor.name === contact.provider)
        if (!provider) {
            throw new Exception(`The message could not go through, because the system doesn't know how to send '${contact.provider}' messages`)
        }
        const templatedata = await this[collections].templates.findOne({ name: template })
        if (!templatedata) {
            const errorId = shortUUID.generate()
            console.error(`The template ${template} was not found\nError ID: ${errorId}`)
            throw new Exception(`Could not send notification. Error ID: ${errorId}`)
        }
        /**
         * This method replaces text with array values E.g interpolate("Hello, how are {{1}} today?.", ["you"]) gives how are you today?
         * @param {string} text 
         * @param {string[]} array 
         * @returns {string}
         */
        function interpolate(text, array) {
            array.forEach((x, i) => text = text?.replaceAll(`{{${i + 1}}}`, x))
            return text
        }

        //Do interpolation for text, and HTML
        templatedata.fields.text = interpolate(templatedata.fields.text, data)
        templatedata.fields.html = interpolate(templatedata.fields.html, data)

        await provider.instance.notify({ contact: contact.data, template: templatedata, language, data })
    }

    /**
     * This method notifies a user, via all his contacts
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.template
     * @param {string} param0.language
     * @param {string[]} param0.data
     * @returns {Promise<void>}
     */
    async notifyUser({ userid, template, language, data }) {
        const contacts = await this[collections].contacts.find({ userid }).toArray()

        return await (
            Promise.any(contacts.map((contact) => this.notify({ contact, data, language, template })))
        ).catch(e => {
            console.warn(`Could not send notification to userid ${userid}, using template ${template}, in ${language} language\n`, e)
            throw new Exception(`Could not notify user`)
        })
    }


}

