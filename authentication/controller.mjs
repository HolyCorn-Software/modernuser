/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * 
 * The Modern Faculty of Users
 * This module controls authentication
 */

import shortUUID from "short-uuid";
import { checkArgs, pickOnlyDefined } from "../../../system/util/util.js";
import { Exception } from "../../../system/errors/backend/exception.js";
import UserProfileController from "../profile/controller.mjs";
import UserAuthenticationProvider from "./lib/provider.mjs"
import AuthenticationProviderSystemAPI from "./lib/system-api.mjs";
import { FacultyPlatform } from "../../../system/lib/libFaculty/platform.mjs";
import { FacultyPublicJSONRPC } from "../../../system/comm/rpc/faculty-public-rpc.mjs";

const faculty = FacultyPlatform.get();


export default class UserAuthenticationController {


    /**
     * 
     * @param {object} param0 
     * @param {[UserAuthenticationProvider]} param0.providers
     * @param {object} param0.collections
     * @param {import("./types.js").UserAuthTokenCollection} param0.collections.token
     * @param {import("./types.js").UserLoginCollection} param0.collections.login
     * @param {UserProfileController} param0.user_profile_controller
     */
    constructor({ providers, collections, user_profile_controller }) {

        /** @type {[UserAuthenticationProvider]} */
        this[providers_symbol] = providers;

        /** @type {import("./types.js").UserAuthTokenCollection} */
        this[token_collection_symbol] = collections.token

        /** @type {import("./types.js").UserLoginCollection} */
        this[login_collection_symbol] = collections.login

        /** @type {UserProfileController} */
        this[user_profile_controller_symbol] = user_profile_controller

        /** @type {object} */ this.providers_public_rpc = new Proxy({}, {
            get: (target, property, receiver) => this.findProvider(property).remote.public,
        })


        //Provide the providers with a system interface. This interface will allow the providers to make useful system calls
        for (let provider of providers) {
            provider.system = new AuthenticationProviderSystemAPI(provider, this)
        }

        //Now, let's make sure whenever a profile is deleted, we delete associated logins
        faculty.events.addListener(`${faculty.descriptor.name}.profile-delete`, (id) => {
            this[token_collection_symbol].deleteMany({ userid: id })
        })

    }

    /**
     * This method is used to log in a publicly contacted client (user)
     * 
     * It takes the data for the login and the provider for the log in
     * @param {object} param0 
     * @param {object} param0.data
     * @param {string} param0.provider
     * @returns {Promise<{token: string, expires: number, login_data: import("./types.js").UserLogin}>}
     */
    async login({ data, provider }) {

        //This method is very simple.
        // 1) Create a unique representation of the data
        // 2) Find a login in the database that matches that unique data
        // 3) If found, issue a token 

        let providerObject = this.findProvider(provider);

        let unique_data = await providerObject.toUniqueCredentials({
            data,
            intent: 'login',
            login_id: undefined
        });

        let login_data = await this[login_collection_symbol].findOne({
            provider,
            data: unique_data
        });

        if (!login_data) {
            throw new Exception(`Invalid login bro!`)
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
     * @returns {Promise<[{profile:import("../profile/types.js").UserProfileData, active:boolean}]>}
     */
    async getProfiles({ data, provider }) {

        let providerObject = this.findProvider(provider);

        let unique_data = await providerObject.toUniqueCredentials({
            data,
            intent: 'login',
            login_id: undefined
        });

        const results = await Promise.all(
            (await this[login_collection_symbol].find({
                provider,
                data: unique_data
            }).toArray()).map(async login => {
                return {
                    active: login.active,
                    profile: await this[user_profile_controller_symbol].getProfile({ id: login.userid })
                }
            })
        );

        if (results.length === 0) {
            throw new Exception(`Invalid login bro!`)
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

        checkArgs(arguments[0], {
            provider: 'string',
            userid: 'string'
        })

        let providerObject = this.findProvider(provider);

        let unique_data = await providerObject.toUniqueCredentials({
            data,
            intent: 'login',
            login_id: undefined
        });

        let login_data = await this[login_collection_symbol].findOne({
            provider,
            data: unique_data,
            userid
        });

        if (!login_data) {
            throw new Exception(`Invalid login bro!`)
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
     * Finds a provider by name
     * @param {string} name 
     * @returns {UserAuthenticationProvider}
     */
    findProvider(name, { throwError = true } = {}) {

        let providerObject = this[providers_symbol].filter(x => x.$data.name === name)[0]

        if (!providerObject && throwError) {
            throw new Exception(`Provider ${name} not found!`)
        }

        return providerObject;
    }

    /**
     * This method gets information about all providers on the system.
     * It gives only data we're not afraid to have in the wrong hands. (Harmless data)
     * 
     * @returns {[import("./types.js").SecurityProviderPublicData]}
     */
    getProvidersPublicData() {
        return this[providers_symbol].map(provider => {

            return {
                name: provider.$data.name,
                credentials: pickOnlyDefined(provider.$data.credentials, [...provider.$data.class.client_credential_fields])
            }
        })
    }

    /**
     * This method creates a new login.
     * @param {object} param0 
     * @param {string} param0.userid - This can be omitted
     * @param {object} param0.data
     * @param {string} param0.provider
     * @param {FacultyPublicJSONRPC} param0.clientRpc
     * @returns {Promise<string>}
     */
    async createLogin({ userid, data, provider, clientRpc }) {

        //First things first, does the provider exist ?
        let providerObject = this[providers_symbol].filter(x => x.$data.name === provider)[0]

        if (!providerObject) {
            throw new Exception(`Provider ${provider} not found`);
        }

        //Then, we check for duplicates
        if (await this.searchLoginByData({ provider, intent: 'signup', data })) {
            throw new Exception(`Sorry, there's already an account with those credentials. If you forgot your password, consider resetting it instead.`)
        }

        const id = `${shortUUID.generate()}${shortUUID.generate()}`


        //We can call the provider and ask it for a unique representation of the data)

        let unique_data = await providerObject.toUniqueCredentials({
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

        await this[login_collection_symbol].insertOne({
            userid,
            provider,
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
     * @param {string} param0.provider
     * @param {boolean} param0.active
     * @returns {Promise<string>}
     */
    async createLoginDirect({ userid, data, provider, active = false }) {

        this.findProvider(provider) //Let's just make sure the provider exists

        const id = `${shortUUID.generate()}${shortUUID.generate()}`

        await this[login_collection_symbol].insertOne({
            userid,
            provider,
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
     * The data passed to this method should already be minified Using provider.toMinimalUniqueCredentials()
     * 
     * It returns the associated login
     * @param {object} param0
     * @param {string} param0.provider
     * @param {object} param0.data 
     * @param {boolean} state
     * @returns {Promise<import("./types.js").UserLogin>}
     */
    async setLoginEnabled({ provider, data }, state) {
        let login = await this.searchLoginByDataDirect({ data, provider })

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
     * The data passed to this method should already be minified Using provider.toMinimalUniqueCredentials()
     * @param {object} param0
     * @param {string} param0.provider
     * @param {object} param0.data 
     * @param {object} param0.newdata
     * @returns {Promise<void>}
     */
    async updateLogin({ provider, data, newdata }) {
        let login = await this.searchLoginByDataDirect({ data, provider });

        if (!login) {
            throw new Exception(`Login not found. Could not update!`)
        }

        await this[login_collection_symbol].updateMany({
            data: login.data,
            provider,
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
     * @param {string} param0.provider 
     * @param {object} param0.data 
     * @param {FacultyPublicJSONRPC} param0.clientRpc
     */
    async resetLogin({ provider, data, clientRpc }) {
        let providerObject = this.findProvider(provider);

        //Let's search if a login even exists like that
        let login = await this.searchLoginByData({ data, provider, intent: 'signup' })

        if (!login) {
            throw new Exception(`Sorry, the login you're trying to reset doesn't even exist.`)
        }

        //The provider will handle it from here
        await providerObject.toUniqueCredentials({
            data,
            intent: 'reset',
            clientRpc
        })
    }

    /**
     * Searches for a login in the database whose data matches the data given.
     * @param {object} param0 
     * @param {object} param0.data
     * @param {string} param0.provider
     * @param {('login'|'signup'|'reset')} param0.intent
     * @returns {Promise<import("./types.js").UserLogin}
     */
    async searchLoginByData({ data, provider, intent }) {
        let providerObject = this.findProvider(provider);

        let minimal_data = await providerObject.toMinimalUniqueCredentials({ data, intent });

        let query = {
            provider
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
     * @param {string} param0.provider
     * @returns {Promise<import("./types.js").UserLogin}
     */
    async searchLoginByDataDirect({ data, provider }) {

        this.findProvider(provider); //Just so it can throw an error if the provider is not found

        let query = {
            provider
        }

        for (let key in data) {
            query[`data.${key}`] = data[key]
        }

        return await this[login_collection_symbol].findOne({
            ...query
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
            throw new Exception(`You are not authorized. Please log in to continue. <a href='/$/modernuser/static/login/' target='_blank'>Click to login</a>`, {
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
     * @returns {Promise<import("../profile/types.js").UserProfileData>}
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

    async createUserProfile() {
        return await this[user_profile_controller_symbol].createProfile(...arguments)
    }



    /**
     * This method is used internally to format a collection according to the needs of this module
     * @param {import("./types.js").UserAuthTokenCollection} collection 
     */
    static async prepareCollection(collection) {
        await collection.createIndex({ lastRefresh: 1 }, { expireAfterSeconds: this.token_expiry_seconds })
    }

    static get token_expiry_seconds() {
        return 7 * 24 * 60; //7 days expiry
    }

}



const providers_symbol = Symbol(`UserAuthenticationController.prototype.providers`)
const token_collection_symbol = Symbol(`UserAuthenticationController.prototype.token_collection`)
const login_collection_symbol = Symbol(`UserAuthenticationController.prototype.login_collection`)
const user_profile_controller_symbol = Symbol(`UserAuthenticationController.prototype.user_profile_controller`)
