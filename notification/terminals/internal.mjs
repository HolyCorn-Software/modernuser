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
     * @param {NotificationController} controller 
     */
    constructor(controller) {
        this.events = new NotificationEventsInternalMethods(controller.events)
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