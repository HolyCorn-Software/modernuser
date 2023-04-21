/**
 * Copyright 2023 HolyCorn Software
 * The Modern Faculty of Users
 * This module defines the structure of Notification plugins
 */



/**
 * @template PluginCredentials
 * @template TemplateStructure
 * @template ContactStructure
 * @extends PluginModelModel<PluginCredentials>
 */
export default class NotificationPlugin extends PluginModelModel {


    constructor() {
        super()
    }


    /**
     * @override
     * Plugins should implement this method, so that the system can execute it, when it wishes for the plugin to start
     * @returns {Promise<void>}
     */
    async _start() {
        super._start()
    }

    /**
     * @override
     * Plugins should implement this method, so that the system can execute it, when it wishes for the plugin to stop
     * @returns {Promise<void>}
     */
    async _stop() {
        super._stop()
    }


    /**
     * @override
     * This method is called each time a template is created, or is updated
     * The plugin is expected to check if the template is usable by it.
     * And if usable, to check if the template is correct.
     * All remarks about the template must be returned in the results object.
     * Any exception being thrown, will be regarded as a failure to approve the template, not that the template is wrong
     * If the plugin has to add this template to a remote database, it better does so now, because no callback will be made asking it to do so
     * @param {object} param0 
     * @param {modernuser.notification.Template<TemplateStructure>} param0.data
     * @returns {Promise<modernuser.notification.TemplateReviewResult>}
     */
    async reviewTemplate({ data }) {

    }

    /**
     * @override
     * This method is called by the system so that the plugin checks if a contact is correct
     * @param {ContactStructure} data
     * @returns {Promise<modernuser.notification.ContactReviewResult>}
     */
    async reviewContact( data ) {

    }

    /**
     * @override
     * This method is used to notify someone, via his contact data
     * @param {object} param0 
     * @param {ContactStructure} param0.contact
     * @param {modernuser.notification.Template<TemplateStructure>} param0.template
     * @param {string} param0.language
     * @param {TemplateStructure} param0.data
     * @returns {Promise<void>}
     */
    async notify({ contact, template, data }) {
        
    }




}


global.NotificationPlugin = NotificationPlugin