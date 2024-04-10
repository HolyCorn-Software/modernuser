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
import nodeUtil from 'node:util'


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
                        task.data.forEach((x, i) => text = text?.replaceAll(`{{${i + 1}}}`, x))
                        text = text?.replaceAll(/\\\{\\\{(.+)\\\}\\\}/g, `{{$1}}`)
                        return text
                    }

                    // First, inApp
                    const processInApp = async () => {
                        const template = await this[collections].templates.findOne({ name: task.template })
                        if (!template) {
                            const error = new Error(`Message template not found.`)
                            error.fatal = true
                            throw error
                        }
                        const inAppData = template.fields[task.language].inApp
                        inAppData.icon ||= `/$/shared/static/logo.png`
                        inAppData.title ||= template.label
                        inAppData.caption ||= inAppData.title
                        inAppData.html ||= inAppData.text || inAppData.caption



                        inAppData.icon = interpolate(inAppData.icon)
                        inAppData.title = interpolate(inAppData.title)
                        inAppData.caption = interpolate(inAppData.caption)
                        inAppData.html = interpolate(inAppData.html)
                        inAppData.text = interpolate(inAppData.text)


                        await this[collections].inApp.unread.insertOne(
                            {
                                ...inAppData,
                                time: Date.now(),
                                target: task.userid,
                                expires: Date.now() + (30 * 24 * 60 * 60 * 1000),
                                id: shortUUID.generate()
                            }
                        );


                    }

                    try {
                        await processInApp()
                    } catch (e) {
                        console.error(`Failed to issue inApp notification for notification job ${task["@worker-world-task"].id}\n`, e)
                        failed.inApp = true
                    }


                    // Now, provider notifications


                    const results = await (
                        Promise.allSettled(
                            (await this[collections].contacts.find({ userid: task.userid }).toArray()).map(
                                (contact) => this.notify({
                                    contact, data: task.data, language: task.language, template: task.template
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

                    const providerFailedList = results.filter(res => res.status === 'rejected');

                    if (providerFailedList.length > 0) {
                        console.warn(
                            `Some notification channels failed to deliver notification template ${task.template.magenta} to user id ${task.userid.magenta}\n`,
                            providerFailedList.map(x => `${x.reason?.stack || x.reason}`).join('\n')
                        )
                    }


                    return {
                        error: failed.provider && failed.inApp ? {
                            fatal,
                            message: providerErrorMsg,
                        } : undefined,
                        delete: true
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
    async markInAppNotificationsSeen({ ids, userid }) {
        const notifications = await this.authenticateInAppNotifications(
            {
                ids,
                userid,
                permissions: ['permissions.modernuser.notification.inApp.markRead']
            }
        )
        await this[collections].inApp.unread.deleteMany({ id: { $in: ids } });
        await this[collections].inApp.read.deleteMany({ id: { $in: ids } });
        notifications.forEach(noti => {
            noti.expires = Date.now() + (30 * 24 * 60 * 60 * 1000)
            noti.seen = Date.now()
        })
        this[collections].inApp.read.insertMany(notifications)
    }

    /**
     * This method deletes inApp notifications
     * @param {object} param0 
     * @param {string[]} param0.ids
     * @param {string} param0.userid
     * @returns {Promise<void>}
     */
    async deleteInAppNotifications({ ids, userid }) {
        await this.authenticateInAppNotifications({
            ids,
            userid,
            permissions: ['permissions.modernuser.notification.inApp.delete']
        });

        [this[collections].inApp.unread, this[collections].inApp.read].map(collection => {
            collection.deleteMany({ id: { $in: ids } })
        })
    }


    /**
     * This method counts the number of unread notifications of a given user
     * @param {string} param0.target The id of the user, whose unread messages are being counted.
     * @param {string} param0.userid The id of the user performing the count
     * @returns {Promise<number>}
     */
    async countInAppUnread({ target, userid }) {
        // In case we only know one of the parties, then either the calling user is the target user, or vice versa
        target ||= userid
        userid ||= target

        await muser_common.whitelisted_permission_check(
            {
                userid,
                whitelist: [target],
                permissions: ['permissions.modernuser.notification.inApp.read'],
            }
        );

        return await this[collections].inApp.unread.countDocuments({ target })
    }


    /**
     * This method checks if a calling user has a given permission over a set of notifications.
     * If so, this method returns the notifications
     * @param {object} param0 
     * @param {string[]} param0.ids
     * @param {string} param0.userid
     * @param {modernuser.permission.PermissionEnum[]} param0.permissions
     */
    async authenticateInAppNotifications({ ids, userid, permissions }) {
        const notifications = (
            await Promise.all(
                [this[collections].inApp.unread, this[collections].inApp.read].map(
                    collection => collection.find({ id: { $in: ids } }).toArray()
                )
            )
        ).flat();


        await Promise.all(
            [...(new Set(notifications.map(x => x.target)))].filter(x => x !== userid).map(target => muser_common.whitelisted_permission_check({
                userid,
                whitelist: [target],
                permissions,
            }))
        );
        return notifications
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

        const cursorU = this[collections].inApp.unread.find({ target })
        while (await cursorU.hasNext()) {
            yield await cursorU.next()
        }
        cursorU.close()

        const cursorR = this[collections].inApp.read.find({ target })
        while (await cursorR.hasNext()) {
            yield await cursorR.next()
        }
        cursorR.close()

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

        console.log(`At this point, arguments are `, ...arguments)

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
            try {
                soulUtils.checkArgs(data.fields[lang], { html: 'string', text: 'string' })
                if (data.fields[lang].inApp) {
                    soulUtils.checkArgs(data.fields[lang], { inApp: { title: 'string', caption: 'string' } })
                }
            } catch (e) {
                throw new Error(`Could not create template with data\n${nodeUtil.inspect(data, { showHidden: true, depth: Infinity, colors: true })}\nBecause:\n${nodeUtil.inspect(e.message || e.stack || e, { colors: true })}`)
            }
        }

        await modernuserPlugins.waitForLoad()
        const results = await modernuserPlugins.loaded.namespaces.notification.callback.reviewTemplate(data);

        if (results.failure.length > 0) {
            throw new Exception(`Could not create message template ${data.name.magenta} because some plugins failed to validate it\n${results.failure.map(x => `${x.plugin.descriptor.label.red} (${x.plugin.descriptor.name.red.bold}) rejected the template.\n` + (x.error.message || x.error)).join('\n')}`)
        }

        //Now, find the providers that found the template usable, but data faulty
        const incorrect = results.success.filter(res => (res.value?.usable ?? true) && !(res.value?.correct ?? true))

        if (incorrect.length > 0) {
            throw new Exception(`Some fields in this template are wrongly formatted.\n\n${incorrect.map((x, i, arr) => `${arr.length > 1 ? `${i + 1})\t` : ''}${x.value?.remark}`).join('\n')}`)
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
        templatedata.fields[language].text = interpolate(templatedata.fields[language].text, data)
        templatedata.fields[language].html = interpolate(templatedata.fields[language].html, data)
        if (templatedata.fields[language].inApp) {
            templatedata.fields[language].inApp.caption = interpolate(templatedata.fields[language].inApp?.caption, data)
            templatedata.fields[language].inApp.icon = interpolate(templatedata.fields[language].inApp.icon, data)
            templatedata.fields[language].inApp.title = interpolate(templatedata.fields[language].inApp.title, data)
        }

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
        this[processor].insertOne(
            {
                data,
                language,
                userid,
                template,
            },
            {
                expires: Date.now() + (30 * 24 * 60 * 60 * 1000)
            }
        )
    }

    /**
     * This method returns caption data for a contact
     * @param {modernuser.notification.Contact} data 
     * @returns {Promise<modernuser.notification.ContactCaption>}
     */
    async getContactCaption(data) {
        const provider = await modernuserPlugins.loaded.namespaces.notification.find(x => x.descriptor.name === data.provider)
        await this.checkContactData(data.provider, data.data)
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
    },
    {
        label: `Delete InApp notifications of others`,
        name: 'permissions.modernuser.notification.inApp.delete'
    }
]


export { PERMISSIONS }