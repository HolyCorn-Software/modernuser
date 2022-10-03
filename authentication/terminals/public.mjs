/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * 
 * This module provides remote methods to the public for the purpose of authenticating users
 */

import { Exception } from "../../../../system/errors/backend/exception.js";
import { ExtendedPublicJSONRPC } from "../../../../common/modules/extended-rpc/rpc.mjs";
import { FacultyPlatform } from "../../../../system/lib/libFaculty/platform.mjs";
import UserAuthenticationController from "../controller.mjs";


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
     * @param {string} provider 
     * @param {object} data 
     * @returns {Promise<import("../types.js").PublicTokenData>}
     */
    async provider_login(provider, data) {
        provider = arguments[1]
        data = arguments[2];


        /** @type {ExtendedPublicJSONRPC} */
        const client = arguments[0];


        let session = await client.resumeSessionFromMeta();


        let credentials = await this[controller_symbol].login({ provider, data });

        session.setVar(`${faculty.descriptor.name}-authentication-token`, credentials.token)

        return credentials
    }


    /**
     * This method is the advanced way of logging in.
     * This method gets all the profiles attached to the given login
     * @param {string} provider 
     * @param {object} data 
     * @returns {Promise<[{profile:import("faculty/modernuser/profile/types.js").UserProfileData, active: boolean}]>}
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

        /** @type {ExtendedPublicJSONRPC} */ const client = arguments[0]

        const session = await client.resumeSessionFromMeta()

        session.setVar(`${faculty.descriptor.name}-authentication-token`, credentials.token)

        return
    }


    /**
     * Gets data about all the security providers
     * @returns {Promise<[import("../types.js").SecurityProviderPublicData]>}
     */
    async getProvidersData() {
        return this[controller_symbol].getProvidersPublicData()
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
        await this[controller_symbol].resetLogin({ provider, data, clientRpc });
    }

    /**
     * Used to return a user's profile to him
     */
    async whoami(ignoreOnboarding) {
        ignoreOnboarding = arguments[1]
        /** @type {ExtendedPublicJSONRPC} */
        const client = arguments[0]
        const profile = await client.getUserProfile()
        if (!ignoreOnboarding && (!profile.label || !profile.icon)) {
            throw new Exception(`You did not complete the onboarding (registration) process. <a href='/$/${faculty.descriptor.name}/onboarding/static/request/'>Click here</a> to complete it.`)
        }

        return profile;
    }

    get providers() {
        return this[controller_symbol].providers_public_rpc
    }




}
const controller_symbol = Symbol(`UserProfileInternalMethods.prototype.controller`)