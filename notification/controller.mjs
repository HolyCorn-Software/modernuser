/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module determines the overall logic of everything that has to do with notifications.
 * 
 * Note that contacts here refer to users' personal contacts, not the concept of role contacts
 */

import muser_common from "muser_common";
import shortUUID from "short-uuid";
import modernuserPlugins from "../plugins.mjs";
import "./plugin/model.mjs"; //Just Import this, so that the NotificationPlugin will be globally accessible
import ModernuserEventsServer from "./events.mjs";
import WorkerWorld from "../../../system/util/worker-world/main.mjs";


const collections = Symbol()
const processor = Symbol()
const instance = Symbol()

export default class NotificationController {


    /**
     * 
     * @param {object} args 
     * @param {object} args.collections
     * @param {modernuser.notification.UserContactsCollection} args.collections.contacts
     * @param {modernuser.notification.TemplatesCollection} args.collections.templates
     * @param {modernuser.notification.NotificationJobsCollection} args.collections.jobs
     * @param {object} args.collections.inApp
     * @param {modernuser.notification.InAppNotificationsCollection} args.collections.inApp.unread
     * @param {modernuser.notification.InAppNotificationsCollection} args.collections.inApp.read
     */
    constructor(args) {

        this[collections] = args.collections
        NotificationController[instance] = this
        this.events = new ModernuserEventsServer()

        setTimeout(() => this.test().catch(e => console.log(e)), 2000);


        this[processor] = new WorkerWorld(
            {
                stages: [
                    {
                        label: `Notify`,
                        name: 'notify',
                        collection: args.collections.jobs,
                    }
                ],
                width: 3,
                execute: async (task) => {
                    // Need to send inApp notifications, then send provider-based notitications

                    let failed = { inApp: false, provider: false }

                    /**
                    * This method replaces text with array values E.g interpolate("Hello, how are {{1}} today?.", ["you"]) gives how are you today?
                    * @param {string} text 
                    * @returns {string}
                    */
                    function interpolate(text) {
                        task.data.data.forEach((x, i) => text = text?.replaceAll(`{{${i + 1}}}`, x))
                        return text
                    }

                    // First, inApp
                    const processInApp = async () => {
                        const template = await this[collections].templates.findOne({ name: task.data.template })
                        if (!template) {
                            const error = new Error(`Message template not found.`)
                            error.fatal = true
                            throw error
                        }
                        const inAppData = template.fields[task.data.language].inApp
                        inAppData.icon ||= `/$/shared/static/logo.png`
                        inAppData.title ||= template.label
                        inAppData.caption ||= inAppData.title



                        inAppData.icon = interpolate(inAppData.icon)
                        inAppData.title = interpolate(inAppData.title)
                        inAppData.caption = interpolate(inAppData.caption)


                        await this[collections].inApp.unread.insertOne(
                            {
                                ...inAppData,
                                time: Date.now(),
                                target: task.data.userid,
                                expires: Date.now() + (30 * 24 * 60 * 60 * 1000),
                                html: interpolate(template.fields[task.data.language].html),
                                text: interpolate(template.fields[task.data.language].text),
                                id: shortUUID.generate()
                            }
                        );


                    }

                    try {
                        await processInApp()
                    } catch (e) {
                        console.error(`Failed to issue inApp notification for notification job ${task.id}\n`, e)
                        failed.inApp = true
                    }


                    // Now, provider notifications


                    const results = await (
                        Promise.allSettled(
                            (await this[collections].contacts.find({ userid: task.data.userid }).toArray()).map(
                                (contact) => this.notify({
                                    contact, data: task.data.data, language: task.data.language, template: task.data.template
                                })
                            )
                        )
                    ).catch(e => {
                        console.warn(`Could not send notification to userid ${userid}, using template ${template}, in ${language} language\n`, e)
                        throw new Exception(`Could not notify user`)
                    });

                    let providerErrorMsg;

                    failed.provider = results.every(result => result.status == 'rejected');
                    const fatal = failed.inApp && results.every(result => result.reason?.fatal);

                    if (fatal) {
                        providerErrorMsg = results.map((x, i) => `${i + 1}\n${x.reason}`).join('\n\n')
                    }


                    return {
                        error: failed.provider && failed.inApp ? {
                            fatal,
                            message: providerErrorMsg,
                        } : undefined,
                    }


                }

            }
        );

        this[processor].start()

    }

    /**
     * This method is used to mark a notification as read
     * @param {object} param0 
     * @param {string[]} param0.ids The array of notification ids to be marked as read
     * @param {string} param0.userid If passed, this user id would be used to authenticate the mark as read action
     * @returns {Promise<void>}
     */
    async readInAppNotifications({ ids, userid }) {
        const notifications = await this[collections].inApp.unread.find({ id: { $in: ids } }).toArray();
        await Promise.all(
            [...(new Set(notifications.map(x => x.target)))].filter(x => x !== userid).map(target => muser_common.whitelisted_permission_check({
                userid,
                whitelist: [target],
                permissions: ['permissions.modernuser.notification.inApp.markRead'],
            }))
        );

        await this[collections].inApp.unread.deleteMany({ id: { $in: ids } });
        notifications.forEach(noti => noti.expires = Date.now() + (30 * 24 * 60 * 60 * 1000))
        this[collections].inApp.read.insertMany(notifications)
    }

    /**
     * This method fetches notifications sent to a target.
     * @param {object} param0 
     * @param {string} param0.target The user whose notifications are being fetched.
     * @param {string} param0.userid The user fetching the notifications.
     * 
     */
    async *getInAppNotifications({ userid, target }) {

        await muser_common.whitelisted_permission_check(
            {
                userid,
                whitelist: [target],
                permissions: ['permissions.modernuser.notification.inApp.read'],
            }
        );

        const cursor = this[collections].inApp.unread.find({ target })
        while (await cursor.hasNext()) {
            yield await cursor.next()
        }

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
     * @returns {Promise<modernuser.notification.ContactExtra>}
     */
    async createContact({ data, provider, userid }) {

        await this.checkContactData(provider, data);


        const id = shortUUID.generate()

        await this[collections].contacts.insertOne(
            {
                id,
                data,
                provider,
                userid
            }
        )

        return {
            id,
            caption: await this.getContactCaption({ data }),
            data,
            provider,
            userid
        }


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
        const contact = await this.getContact({ id, userid })

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

        await this.getContact({ id, userid })
        this[collections].contacts.deleteOne({ id })
    }

    /**
     * This method gets the contacts of a given user
     * @param {object} param0 
     * @param {string} param0.userid The userid of the calling user
     * @param {string} param0.target The id of the user whose contacts are being fetched
     * @returns {Promise<modernuser.notification.ContactExtra[]>}
     */
    async getContacts({ userid, target }) {

        await muser_common.whitelisted_permission_check(
            {
                userid,
                whitelist: [target],
                permissions: ['permissions.modernuser.notification.contacts.view'],
            }
        )
        const contacts = await this[collections].contacts.find({ userid: target }).toArray()

        return await Promise.all(contacts.map(async contact => ({ ...contact, caption: await this.getContactCaption(contact) })))
    }

    /**
     * This method is used to check if a user owns a contact with a given id
     * @param {object} param0 
     * @param {string} param0.id
     * @param {string} param0.userid
     */
    async getContact({ id, userid }) {
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
                permissions: ['permissions.modernuser.notification.contacts.modify'],
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

        const langs = Reflect.ownKeys(data.fields)
        for (const lang of langs) {
            soulUtils.checkArgs(data.fields[lang], { html: 'string', text: 'string' })
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
     * This method is used to directly notify a contact
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
        await this[collections].jobs.insertOne({
            id: shortUUID.generate(),
            created: Date.now(),
            expires: Date.now() + (30 * 24 * 60 * 60 * 1000),
            data: {
                data,
                template,
                language,
                userid
            },
        })
    }

    /**
     * This method returns caption data for a contact
     * @param {modernuser.notification.Contact} data 
     * @returns {Promise<modernuser.notification.ContactCaption>}
     */
    async getContactCaption(data) {
        const provider = await modernuserPlugins.loaded.namespaces.notification.find(x => x.descriptor.name === data.provider)
        if (!provider) {
            return await NotificationPlugin.prototype.captionContact.apply(undefined, [data.data])
        }
        return await provider.instance.captionContact(data.data)
    }



}



/** @type {modernuser.permission.PermissionDataInput[]} */
const PERMISSIONS = [
    {
        label: `View other's contacts`,
        name: 'permissions.modernuser.notification.contacts.view',
    },
    {
        label: `Modify other's contacts`,
        name: 'permissions.modernuser.notification.contacts.modify',
        inherit: ['permissions.modernuser.notification.contacts.view']
    },
    {
        label: `Mark InApp notifications read for others`,
        name: 'permissions.modernuser.notification.inApp.markRead',
    },
    {
        label: `Read InApp notifications of others`,
        name: 'permissions.modernuser.notification.inApp.read',
    }
]


export { PERMISSIONS }