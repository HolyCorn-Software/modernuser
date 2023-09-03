/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * 
 * The Modern Faculty of Users
 * This module controls authentication
 * 
 * Upated 2023 to bring about use of the modern concept of plugins.
 */

import shortUUID from "short-uuid";
import UserProfileController from "../profile/controller.mjs";

import('./plugin/model.mjs').catch(e => console.error(e))


const faculty = FacultyPlatform.get();

const instance = Symbol()


export default class UserAuthenticationController {


    /**
     * 
     * @param {object} param0 
     * @param {object} param0.collections
     * @param {modernuser.authentication.UserAuthTokenCollection} param0.collections.token
     * @param {modernuser.authentication.UserAuthTokenCollection} param0.collections.login
     * @param {UserProfileController} param0.user_profile_controller
     */
    constructor({ collections, user_profile_controller }) {


        /** @type {modernuser.authentication.UserAuthTokenCollection} */
        this[token_collection_symbol] = collections.token

        /** @type {modernuser.authentication.UserLoginCollection} */
        this[login_collection_symbol] = collections.login

        /** @type {UserProfileController} */
        this[user_profile_controller_symbol] = user_profile_controller


        //Now, let's make sure whenever a profile is deleted, we delete associated logins
        faculty.events.addListener(`${faculty.descriptor.name}.profile-delete`, (id) => {
            this[token_collection_symbol].deleteMany({ userid: id })
        })
        UserAuthenticationController[instance] = this

    }
    static get instance() {
        return this[instance]
    }


    /**
     * @readonly
     */
    static get sessionVarName() {
        return `${faculty.descriptor.name}-authentication-token`
    }

    /**
     * This method is used to log in a publicly contacted client (user)
     * 
     * It takes the data for the login and the provider for the log in
     * @param {object} param0 
     * @param {object} param0.data
     * @param {string} param0.provider
     * @returns {Promise<{token: string, expires: number, login_data: modernuser.authentication.UserLogin}>}
     */
    async login({ data, provider }) {

        //This method is very simple.
        // 1) Create a unique representation of the data
        // 2) Find a login in the database that matches that unique data
        // 3) If found, issue a token 

        let plugObj = this.findPlugin(provider);

        let unique_data = await plugObj.toUniqueCredentials({
            data,
            intent: 'login',
            login_id: undefined
        });

        let login_data = await this[login_collection_symbol].findOne({
            plugin: provider,
            data: unique_data
        });

        if (!login_data) {
            throw new Exception(`Invalid login. Please try again.`)
        }
        if (!login_data.active) {
            throw new Exception(`This login is not yet active. If you are just from creating your account, follow the proper procedure for activating it.`)
        }

        return {
            token: this.issueToken({ userid: login_data.userid }),
            expires: Date.now() + ((UserAuthenticationController.token_expiry_seconds - 5) * 1000),
            login_data
        }
    }



    /**
     * This method gets all the profiles associated with a login
     * @param {object} param0 
     * @param {object} param0.data
     * @param {string} param0.provider
     * @returns {Promise<modernuser.authentication.LoginProfileInfo[]>}
     */
    async getProfiles({ data, provider }) {

        let pluginObject = this.findPlugin(provider);

        let unique_data = await pluginObject.toUniqueCredentials({
            data,
            intent: 'login',
            login_id: undefined
        });

        const results = await Promise.all(
            (await this[login_collection_symbol].find({
                plugin: provider,
                data: unique_data
            }).toArray()).map(async login => {
                return {
                    active: login.active,
                    profile: await this[user_profile_controller_symbol].getProfile({ id: login.userid })
                }
            })
        );

        if (results.length === 0) {
            throw new Exception(`Invalid login. Please try again.`)
        }

        return results
    }

    /**
     * This method is the modern login method. It allows a user to specify the user account he's logging into
     * @param {object} param0 
     * @param {string} param0.provider
     * @param {object} param0.data
     * @param {string} param0.userid
     * @returns {Promise<{token: string, expires:number}>}
     */
    async advancedLogin({ data, provider, userid }) {

        soulUtils.checkArgs(arguments[0], {
            provider: 'string',
            userid: 'string'
        })

        let pluginObj = this.findPlugin(provider);

        let unique_data = await pluginObj.toUniqueCredentials({
            data,
            intent: 'login',
            login_id: undefined
        });

        let login_data = await this[login_collection_symbol].findOne({
            plugin: provider,
            data: unique_data,
            userid
        });

        if (!login_data) {
            throw new Exception(`Invalid login, please try again.`)
        }
        if (!login_data.active) {
            throw new Exception(`This login is not yet active. If you are just from creating your account, follow the proper procedure for activating it.`)
        }

        return {
            token: this.issueToken({ userid: login_data.userid }),
            expires: Date.now() + ((UserAuthenticationController.token_expiry_seconds - 5) * 1000)
        }
    }


    /**
     * Finds a plugin by name
     * @param {string} name 
     * @returns {AuthenticationPlugin}
     */
    findPlugin(name, { throwError = true } = {}) {

        let pluginDat = UserAuthenticationController.plugins.find(x => x.descriptor.name === name)

        if (!pluginDat && throwError) {
            throw new Exception(`Login method ${name} not found!`)
        }

        return pluginDat.instance;
    }

    static get plugins() {
        /** @type {import('system/lib/libFaculty/plugin/manager.mjs').default <{auth: AuthenticationPlugin[]}>} */
        const pluginMan = FacultyPlatform.get().pluginManager
        return pluginMan.loaded.namespaces.auth
    }

    /**
     * This method gets information about all plugins on the system.
     * It gives only data we're not afraid to have in the wrong hands. (Harmless data)
     * 
     * @returns {Promise<modernuser.authentication.AuthPluginPublicData[]>}
     */
    async getPluginsPublicData() {

        return await Promise.all(
            UserAuthenticationController.plugins.map(async plugin => {
                return {
                    name: plugin.descriptor.name,
                    credentials: await plugin.instance.getClientCredentials()
                }
            })
        )
    }

    /**
     * This method creates a new login.
     * @param {object} param0 
     * @param {string} param0.userid - This can be omitted
     * @param {object} param0.data
     * @param {string} param0.plugin
     * @param {FacultyPublicJSONRPC} param0.clientRpc
     * @returns {Promise<string>}
     */
    async createLogin({ userid, data, plugin, clientRpc }) {

        //First things first, does the plugin exist ?
        let pluginObject = await this.findPlugin(plugin)

        const existing = await this.searchLoginByData({ plugin, intent: 'signup', data });
        //Then, we check for duplicates
        if (existing?.active) {
            throw new Exception(`Sorry, there's already an account with those credentials. If you forgot your password, consider resetting it instead.`)
        }

        const id = `${shortUUID.generate()}${shortUUID.generate()}`


        //We can call the plugin and ask it for a unique representation of the data)

        let unique_data = await pluginObject.toUniqueCredentials({
            data,
            login_id: id,
            intent: 'signup',
            clientRpc
        });

        if (!unique_data) {
            throw new Exception(`Your input is invalid. We could not create a login for you. Check that you've entered the details correctly!`, {
                code: 'error.inputValidation'
            })
        }

        if (existing) {
            await this[login_collection_symbol].deleteOne({ id: existing.id })
        }

        await this[login_collection_symbol].insertOne({
            userid,
            plugin,
            id,
            data: unique_data,
            active: false,
            creationTime: Date.now()
        });

        return id;
    }

    /**
     * This method creates a login directly
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {object} param0.data
     * @param {string} param0.plugin
     * @param {boolean} param0.active
     * @returns {Promise<string>}
     */
    async createLoginDirect({ userid, data, plugin, active = false }) {

        this.findPlugin(plugin) //Let's just make sure the plugin exists

        const id = `${shortUUID.generate()}${shortUUID.generate()}`

        await this[login_collection_symbol].insertOne({
            userid,
            plugin,
            id,
            data,
            active,
            creationTime: Date.now()
        });

        return id;
    }

    /**
     * This method binds a login to a user.
     * 
     * It does this by simply duplicating the data, however, with a different userid
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.login
     * @returns {Promise<void>}
     */
    async bindLogin({ userid, login }) {

        const previous = await this[login_collection_symbol].findOne({ id: login })
        if (!previous) {
            throw new Exception(`Unfortunately, the login you are trying to share doesn't even exist in the first place.`)
        }

        await this[login_collection_symbol].insertOne({ id: login, ...previous, creationTime: Date.now(), userid, _id: undefined })

    }

    /**
     * This method is used to activate or deactivate a login.
     * 
     * The data passed to this method should already be minified Using plugin.toMinimalUniqueCredentials()
     * 
     * It returns the associated login
     * @param {object} param0
     * @param {string} param0.plugin
     * @param {object} param0.data 
     * @param {boolean} state
     * @returns {Promise<modernuser.authentication.UserLogin>}
     */
    async setLoginEnabled({ plugin, data }, state) {
        let login = await this.searchLoginByDataDirect({ data, plugin })

        if (!login) {
            throw new Exception(`The login you wish to activate was not found.`)
        }

        await this[login_collection_symbol].updateOne({
            id: login.id
        },
            {
                $set: {
                    active: state
                }
            }
        );

        return login
    }

    /**
     * This method is used to activate or deactivate a login.
     * 
     * The data passed to this method should already be minified Using plugin.toMinimalUniqueCredentials()
     * @param {object} param0
     * @param {string} param0.plugin
     * @param {object} param0.data 
     * @param {object} param0.newdata
     * @returns {Promise<void>}
     */
    async updateLogin({ plugin, data, newdata }) {
        let login = await this.searchLoginByDataDirect({ data, plugin });

        if (!login) {
            throw new Exception(`Login not found. Could not update!`)
        }

        await this[login_collection_symbol].updateMany({
            data: login.data,
            plugin,
        },
            {
                $set: {
                    data: newdata
                }
            }
        )
    }

    /**
     * Begins the process of resetting a login
     * @param {object} param0
     * @param {string} param0.plugin 
     * @param {object} param0.data 
     * @param {FacultyPublicJSONRPC} param0.clientRpc
     */
    async resetLogin({ plugin, data, clientRpc }) {
        let pluginObject = this.findPlugin(plugin);

        //Let's search if a login even exists like that
        let login = await this.searchLoginByData({ data, plugin, intent: 'signup' })

        if (!login) {
            throw new Exception(`Sorry, the login you're trying to reset doesn't even exist.`)
        }

        //The plugin will handle it from here
        await pluginObject.toUniqueCredentials({
            data,
            intent: 'reset',
            clientRpc
        })
    }

    /**
     * Searches for a login in the database whose data matches the data given.
     * @param {object} param0 
     * @param {object} param0.data
     * @param {string} param0.plugin
     * @param {modernuser.authentication.AuthAction} param0.intent
     * @returns {Promise<modernuser.authentication.UserLogin>}
     */
    async searchLoginByData({ data, plugin, intent }) {
        let pluginObject = this.findPlugin(plugin);

        let minimal_data = await pluginObject.toMinimalUniqueCredentials({ data, intent });

        /** @type {modernuser.authentication.UserLogin} */
        let query = {
            plugin
        }

        for (let key in minimal_data) {
            query[`data.${key}`] = minimal_data[key]
        }

        return await this[login_collection_symbol].findOne({
            ...query
        })
    }


    /**
     * Searches for a login in the database whose data matches the data given.
     * 
     * The search this time is direct
     * @param {object} param0 
     * @param {object} param0.data
     * @param {string} param0.plugin
     * @returns {Promise<modernuser.authentication.UserLogin>}
     */
    async searchLoginByDataDirect({ data, plugin }) {

        this.findPlugin(plugin); //Just so it can throw an error if the plugin is not found

        /** @type {modernuser.authentication.UserLogin} */
        let query = {
            plugin
        }

        for (let key in data) {
            query[`data.${key}`] = data[key]
        }

        return await this[login_collection_symbol].findOne({
            ...query,
            plugin
        })
    }


    /**
     * This method is used to authenticate a user using only the system-issued token.
     * 
     * When authentication is done, it returns the user id
     * @param {object} param0 
     * @param {string} param0.token
     * @returns {Promise<string>}
     */
    async tokenAuth({ token }) {
        let auth_data = await this[token_collection_symbol].findOne({
            token
        });

        if (!auth_data) {
            throw new Exception(`You are not authorized. Please log in to continue. <a href='/$/modernuser/static/login/?return'>Click to login</a>`, {
                code: 'error.modernuser.authError'
            })
        }

        //Prolong the expiry of the token
        this[token_collection_symbol].updateOne({ token }, { $set: { lastRefresh: Date.now() } })

        return auth_data.userid
    }

    /**
     * This method authenticates a token, then finds the associated user profile
     * @param {object} param0 
     * @param {string} param0.token
     * @returns {Promise<modernuser.profile.UserProfileData>}
     */
    async getProfile({ token }) {
        return await this[user_profile_controller_symbol].getProfile(
            {
                id: await this.tokenAuth({ token })
            }
        )
    }


    /**
     * This method issues a token for the given userid
     * @param {object} param0 
     * @param {string} param0.userid
     * @returns {string}
     */
    issueToken({ userid }) {

        let token_string = `${shortUUID.generate()}${shortUUID.generate()}${shortUUID.generate()}`


        this[token_collection_symbol].insertOne({ //No need to waste the user's time with await 
            userid,
            token: token_string,
            lastRefresh: Date.now()
        });


        return token_string;
    }
    /**
     * This method invalidates an authentication token, so that a user can no longer use it.
     * @param {object} param0 
     * @param {string} param0.token
     * @returns {Promise<void>}
     */
    async destroyToken({ token }) {
        await this[token_collection_symbol].deleteMany({ token })
    }

    /**
     * This method creates a new user profile, and returns the user id of the user
     * @param {modernuser.profile.UserProfileData} data 
     */
    async createUserProfile(data) {
        return await this[user_profile_controller_symbol].createProfile(...arguments)
    }



    /**
     * This method is used internally to format a collection according to the needs of this module
     * @param {modernuser.authentication.UserAuthTokenCollection} collection 
     */
    static async prepareCollection(collection) {
        await collection.createIndex({ lastRefresh: 1 }, { expireAfterSeconds: this.token_expiry_seconds })
    }

    static get token_expiry_seconds() {
        return 7 * 24 * 60; //7 days expiry
    }

}



const token_collection_symbol = Symbol(`UserAuthenticationController.prototype.token_collection`)
const login_collection_symbol = Symbol(`UserAuthenticationController.prototype.login_collection`)
const user_profile_controller_symbol = Symbol(`UserAuthenticationController.prototype.user_profile_controller`)
