/**
 * Copyright 2023 HolyCorn Software
 * The Modern Faculty of Users
 * This module allows other faculties to access methods related to user notification
 */

import NotificationController from "../controller.mjs";
import ModernuserEventsServer from "../events.mjs";

const controller = Symbol()

export default class NotificationInternalMethods {

    /**
     * 
     * @param {NotificationController} _controller 
     */
    constructor(_controller) {
        this.events = new NotificationEventsInternalMethods(_controller.events)
        this[controller] = _controller
    }


    /**
     * This method creates a new notification template
     * @param {modernuser.notification.Template} data 
     */
    async createTemplate(data) {
        return await this[controller].createTemplate(arguments[1])
    }


    /**
     * This method notifies a user, via all his contacts.
     * It succeeds, if the notification is sent via one of his contacts, and fails if all contacts fail.
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.template
     * @param {string} param0.language
     * @param {string[]} param0.data
     * @returns {Promise<void>}
     */
    async notifyUser({ userid, template, language, data }) {
        return await this[controller].notifyUser(arguments[1])
    }
}

class NotificationEventsInternalMethods {
    /**
     * 
     * @param {ModernuserEventsServer} _controller 
     */
    constructor(_controller) {
        this[controller] = _controller
        return new FunctionProxy.SkipArgOne(this)
    }

    /**
     * This method informs users of an event
     * @param {object} param0 
     * @param {string[]} param0.userids
     * @param {string} param0.event
     * @param {object} param0.detail
     * @returns {Promise<void>}
     */
    async inform({ userids, event, detail }) {
        await this[controller].inform(userids, new CustomEvent(event, { detail }))
    }
}