/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * 
 * This module provides remote methods to the public for the purpose of authenticating users
 */

import UserAuthenticationController from "../controller.mjs";

import muser_common from "muser_common";


const faculty = FacultyPlatform.get();

export default class UserAuthenticationPublicMethods {

    /**
     * 
     * @param {UserAuthenticationController} controller 
     */
    constructor(controller) {

        /** @type {UserAuthenticationController} */
        this[controller_symbol] = controller;


    }

    /**
     * This method is called on the frontend by a client who wants to login using a specific provider, e.g Google
     * @param {string} plugin 
     * @param {object} data 
     * @returns {Promise<modernuser.authentication.PublicTokenData>}
     */
    async provider_login(plugin, data) {
        plugin = arguments[1]
        data = arguments[2];


        /** @type {FacultyPublicJSONRPC} */
        const client = arguments[0];


        let session = await client.resumeSessionFromMeta();


        let credentials = await this[controller_symbol].login({ provider: plugin, data });

        session.setVar(UserAuthenticationController.sessionVarName, credentials.token)

        return credentials
    }


    /**
     * This method is called when a user wants to add a login to his account.
     * @param {object} param0 
     * @param {string} param0.plugin
     * @param {object} param0.data
     */
    async addLogin({ plugin, data }) {
        plugin = arguments[1]?.plugin
        data = arguments[1]?.data

        await this[controller_symbol].createLogin({
            userid: (await muser_common.getUser(arguments[0])).id,
            clientRpc: arguments[0],
            data,
            plugin: plugin
        })
    }



    /**
     * This method is the advanced way of logging in.
     * This method gets all the profiles attached to the given login
     * @param {string} provider 
     * @param {object} data 
     */
    async getProfiles(provider, data) {

        provider = arguments[1]
        data = arguments[2];

        return await this[controller_symbol].getProfiles({ data, provider })
    }

    /**
     * This method is used to log a user in while specifying the specific user account
     * @param {object} param0 
     * @param {string} param0.provider
     * @param {object} param0.data
     * @param {string} param0.userid
     * @returns {Promise<{token: string, expires:number}>}
     */
    async advancedLogin({ provider, data, userid }) {
        const credentials = await this[controller_symbol].advancedLogin({
            ...arguments[1]
        });

        /** @type {FacultyPublicJSONRPC} */ const client = arguments[0]

        const session = await client.resumeSessionFromMeta()

        session.setVar(UserAuthenticationController.sessionVarName, credentials.token)

        return new JSONRPC.MetaObject({}, {
            rmCache: ['/modernuser.*profile/'],
            events: [
                {
                    type: 'modernuser-authentication-login-complete'
                }
            ]
        })
    }


    /**
     * This method deletes a user's login
     * @param {object} param0 
     * @param {string} param0.id ID of the login being deleted
     * @returns {Promise<void>}
     */
    async deleteLogin({ id }) {
        await this[controller_symbol].deleteLogin({ id: arguments[1]?.id, userid: (await muser_common.getUser(arguments[0])).id })
    }


    /**
     * @deprecated Use .getPluginsPublicData() instead
     */
    async getProvidersData() {
        return await this.getPluginsPublicData()
    }


    /**
     * Gets data about all the security providers
     * @returns {Promise<modernuser.authentication.AuthPluginPublicData[]>}
     */
    async getPluginsPublicData() {
        return new JSONRPC.MetaObject(
            await this[controller_symbol].getPluginsPublicData(),
            {
                cache: {
                    expiry: 10 * 60 * 1000 // Keep information about providers, for up to 10 minutes
                }
            }
        )
    }


    /**
     * Begins the process of resetting a login
     * @param {string} provider 
     * @param {object} data 
     */
    async initiate_reset(provider, data) {
        const clientRpc = arguments[0]
        provider = arguments[1]
        data = arguments[2]
        await this[controller_symbol].resetLogin({ plugin: provider, data, clientRpc });
    }

    /**
     * Used to return a user's profile to him
     */
    async whoami(ignoreOnboarding) {
        ignoreOnboarding = arguments[1]

        const profile = await muser_common.getUser(arguments[0])

        if (!ignoreOnboarding && (!profile.label || !profile.icon)) {
            throw new Exception(`You did not complete the onboarding (registration) process. <a href='/$/${faculty.descriptor.name}/onboarding/static/request/'>Click here</a> to complete it.`)
        }

        return new JSONRPC.MetaObject(profile, { cache: { expiry: 10 * 60 * 1000, tag: ['modernuser.profile'] } })
    }

    /**
     * This method signs the user out
     * @returns {Promise<void>}
     */
    async signout() {
        /** @type {FacultyPublicJSONRPC} */
        const client = arguments[0];

        const session = await client.resumeSessionFromMeta();
        const token = await session.getVar(UserAuthenticationController.sessionVarName);
        
        await session.rmVar(UserAuthenticationController.sessionVarName)

        await this[controller_symbol].destroyToken({
            token
        });
        return new JSONRPC.MetaObject(undefined, {
            rmCache: ['/modernuser.*profile/']
        })
    }

    /**
     * This method gets the logins of the calling user.
     * 
     * The logins contain the bare minimum data
     */
    async getMyLoginsMin() {
        const user = await muser_common.getUser(arguments[0]);

        return (await this[controller_symbol].getUserLogins({ userid: user.id })).map(x => ({ id: x.id, label: x.label || this[controller_symbol].findPlugin(x.plugin, { throwError: false })?.descriptor.label || x.plugin, plugin: x.plugin, creationTime: x.creationTime }))
    }


    /**
     * This interface contains public methods from all plugins.
     * @returns {modernuser.authentication.PluginMethods}
     */
    get pluginMethods() {
        const tree = {}
        UserAuthenticationController.plugins.forEach(plugin => {
            tree[plugin.descriptor.name] = plugin.instance.remote?.public
        })

        return tree
    }




}
const controller_symbol = Symbol(`UserProfileInternalMethods.prototype.controller`)