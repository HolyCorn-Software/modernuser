/*
Copyright 2023 HolyCorn Software

This module defines the structure of an authentication plugin

*/

import UserProfileController from "../../profile/controller.mjs";
import NotificationController from "../../notification/controller.mjs";
import UserAuthenticationController from "../controller.mjs";
import AuthenticationPluginSystemAPI from "./system-api.mjs";

const faculty = FacultyPlatform.get();


/**
 * @template CredentialsType
 * @template UserDataSchema
 * @template UserUniqueDataSchema
 * @extends PluginModelModel<CredentialsType>
 */
export default class AuthenticationPlugin extends PluginModelModel {

    constructor() {
        super();

        /** @type {AuthenticationPluginSystemAPI<UserDataSchema, UserUniqueDataSchema>} */ this.system

        let system;
        Reflect.defineProperty(this, 'system', {
            get: () => {
                return system ||= new AuthenticationPluginSystemAPI(this, UserAuthenticationController.instance, NotificationController.instance, UserProfileController.instance)
            }
        })



    }


    /**
     * This method returns a collection prefixed with the name of the plugin.
     * The reason to use this method, is for better management.
     * @param {string} name 
     * @returns {import('mongodb').Collection}
     */
    getCollection(name) {
        return faculty.database.collection(`${faculty.descriptor.name}.plugins.${this.descriptor.name}.${name}`)
    }


    /**
     * @override
     * This method will be called on the sub-class, by the system, in order that the plugin should 
     * do some long initializations
     */
    async _start() {

    }
    /**
     * @override
     * This method will be called on the sub-class, by the system, in order that the plugin should be safely shutdown
     */
    async _stop() {

    }

    /**
     * @override
     * Plugins should override this, so as to provide credentials to their frontend clients
     * @returns {Promise<object>}
     */
    async getClientCredentials() {

    }

    /**
     * The system calls this method during authentication.
     * 
     * This method should take a user's input e.g {password:'abc'} and return a unique object representing those credentials, e.g {key_hash: 'a33eff9da2d0fbc'}
     * This method is used in two places (login and sign up). During signup, it takes this unique representation and keeps in the database for future authentication.
     * During login, the user will provide input. This input will be passed again to this method to get a unique representation of it.
     * This new unique representation will be compared with the old representation, and if they are correct the user will be granted access.
     * If this method should return false, or undefined, the process will be aborted, in the assumption that the user has falsified data.
     * However, it's advisable to just throw an explicit error.
     * 
     * During sign up, the system expects the returns of this method to still be unique.
     * The unique data is stored in the system's database and the login is marked inactive.
     * Whenever the plugin deems it necessary that the login should become active, it calls the system.updateLoginState(true|false)
     * It is used to either activate or deactivate a login using it's id.
     * 
     * Take note that a login_id is only during signup
     * 
     * @param {object} param0
     * @param {string} param0.login_id
     * @param {object} param0.data
     * @param {modernuser.authentication.AuthAction} param0.intent
     * @param {FacultyPublicJSONRPC} param0.clientRpc Could be null
     * @return {Promise<object>}
     */
    async toUniqueCredentials({ data, login_id, intent, clientRpc }) {

    }

    /**
     * Plugins should override this method to provide a unique representation of the data with only the strictly necessary fields.
     * 
     * For example, if your plugin uses username and password to log a client in, then the minimal unique data, could be calculated using only the username, because the username alone is enough to distinguish a login
     * @param {object} param0 
     * @param {object} param0.data
     * @param {modernuser.authentication.AuthAction} param0.intent
     * @returns {Promise<UserUniqueDataSchema>}
     */
    async toMinimalUniqueCredentials({ data, intent }) {

    }


    /**
     * The plugin should override and return an interface which contains remote methods.
     * 
     * That is, methods which distant components can use.
     * 
     * The 'internal' field contains methods available to other faculties.
     * 
     * The 'public' field contains methods available to users on the public web
     * @returns {{public: object, internal: object}}
     */
    get remote() {
        return {
            public: {
                hello: () => "Hello, this is a public method"
            },
            internal: {
                hello: () => "Helloooo, this is an internal method. Other faculties will call it."
            }
        }
    }

}


global.AuthenticationPlugin ||= AuthenticationPlugin