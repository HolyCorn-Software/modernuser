/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This module provides the world with methods from the notifications module
 */

import muser_common from "muser_common";
import modernuserPlugins from "../../plugins.mjs";
import NotificationController from "../controller.mjs";



export default class NotificationPublicMethods {

    /**
     * 
     * @param {NotificationController} controller 
     */
    constructor(controller) {

        this[controller_symbol] = controller
        this.events = controller.events.public

    }
    async getProviders() {
        return new JSONRPC.MetaObject(
            modernuserPlugins.loaded.namespaces.notification.map(x => ({ name: x.descriptor.name, label: x.descriptor.label, faculty: x.descriptor.faculty, form: x.descriptor.credentials.form, contactForm: x.instance.contactForm })),
            {
                cache: {
                    expiry: 10 * 60 * 1000
                }
            }
        )
    }


    /**
     * This method gets the contacts of a given user
     * @param {object} param0 
     * @param {string} param0.target The id of the user whose contacts are being fetched. If omitted, the calling user's contact would be fetched
     * @returns {Promise<modernuser.notification.ContactExtra[]>}
     */
    async getContacts({ target }) {
        const userid = (await muser_common.getUser(arguments[0])).id
        target = arguments[1]?.target || userid
        return await this[controller_symbol].getContacts({ userid, target })
    }

    /**
     * This method is used to create a new contact
     * @param {object} param0 
     * @param {string} param0.provider
     * @param {object} param0.data
     * @returns {Promise<string>}
     */
    async createContact({ provider, data }) {

        provider = arguments[1].provider
        data = arguments[1].data

        return await this[controller_symbol].createContact(
            {
                userid: (await muser_common.getUser(arguments[0])).id,
                data,
                provider
            }
        )
    }

    /**
     * This method is called to edit a contact
     * @param {object} param0 
     * @param {string} param0.id
     * @param {object} param0.data
     * @returns {Promise<Pick<modernuser.notification.ContactExtra, "caption"|"data">>}
     */
    async updateContact({ id, data }) {
        id = arguments[1]?.id
        data = arguments[1]?.data
        await this[controller_symbol].updateContact(
            {
                id,
                data,
                userid: (await muser_common.getUser(arguments[0])).id,
            }
        );
        return {
            caption: await this[controller_symbol].getContactCaption({ data }),
            data,
            id,
        }
    }

    /**
     * This method is called to caption a contact, based on how the contact provider understands it
     * @param {object} param0 
     * @param {modernuser.notification.Contact} param0.contact
     */
    async captionContact({ contact }) {
        contact = arguments[1]?.contact
        soulUtils.checkArgs(contact, {
            data: 'object',
            provider: 'string',
        });
        return await this[controller_symbol].getContactCaption(contact)
    }

    /**
     * This method checks if a contact is correct.
     * @param {object} param0 
     * @param {modernuser.notification.Contact} param0.contact
     */
    async validateContact({ contact }) {
        contact = arguments[1]?.contact
        soulUtils.checkArgs(contact, {
            provider: 'string',
            data: 'object',
        })
        await this[controller_symbol].checkContactData(contact.provider, contact.data)
    }

    /**
     * This method deletes a contact
     * @param {object} param0 
     * @param {string} param0.id
     * @returns {Promise<void>}
     */
    async deleteContact({ id }) {
        await this[controller_symbol].deleteContact({ id: arguments[1]?.id, userid: (await muser_common.getUser(arguments[0])).id, })
    }

    /**
     * This method gets the inApp notifications for a given target user
     * @param {object} param0 
     * @param {string} param0.target Pass the id of the user whose notifications are being retrieved. If left blank, the calling user's would be fetched
     */
    async getInAppNotifications({ target } = {}) {
        const userid = (await muser_common.getUser(arguments[0])).id;
        return await this[controller_symbol].getInAppNotifications({
            target: arguments[1].target || userid,
            userid: userid,
        })
    }

    /**
     * This method is used to mark notifications as read
     * @param {object} param0 
     * @param {string[]} param0.ids
     * @returns {Promise<void>}
     */
    async markInAppNotificationsSeen({ ids }) {
        ids = arguments[1].ids
        await this[controller_symbol].markInAppNotificationsSeen({
            ids,
            userid: (await muser_common.getUser(arguments[0])).id
        })
    }

    /**
     * This method deletes several inApp notifications.
     * @param {object} param0 
     * @param {string[]} param0.ids
     * @returns {Promise<void>}
     */
    async deleteInAppNotifications({ ids }) {
        ids = arguments[1].ids
        await this[controller_symbol].deleteInAppNotifications({
            ids,
            userid: (await muser_common.getUser(arguments[0])).id
        })
    }

    /**
     * This method counts the number of unread notifications the calling user has
     * @returns {Promise<number>}
     */
    async countMyInAppUnread() {
        return await this[controller_symbol].countInAppUnread({
            userid: (await muser_common.getUser(arguments[0])).id
        })
    }


}


const controller_symbol = Symbol(`NotificationPublicMethods.prototype.controller`)