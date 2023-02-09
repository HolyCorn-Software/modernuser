/*
Copyright 2021 HolyCorn Software
The CAYOFED People System
The Modern Faculty of users
This provider allows the system to make use of google sign in
*/

import UserAuthenticationProvider from "../../../lib/provider.mjs";
import { OAuth2Client } from 'google-auth-library';
import GooglePublicMethods from "./remote/public.mjs";
import GoogleInternalMethods from "./remote/internal.mjs";


export default class GoogleProvider extends UserAuthenticationProvider {


    constructor({ client_id, project_id, project_number, client_secret }) {

        super({ ...arguments[0] })


        for (var param of ['client_id', 'project_id', 'project_number', 'client_secret', 'smtp_email', 'smtp_password']) {
            if (!arguments[0]) {
                throw new Error(`${param} is required please`)
            }

            this[param] = arguments[0][param]
        }

        this.oauthClient = new OAuth2Client({ clientId: client_id, clientSecret: client_secret })

        /** @type {string} */ this.smtp_password
        /** @type {string} */ this.smtp_email

        /** @type {string} */ this.client_id
        /** @type {string} */ this.client_secret


        /** @type {string} */ this.project_id
        /** @type {string} */ this.project_number
    }


    async init() {
        //Now get the audience of this clientID
        //Our use of the term audience is influenced by google

        this.audience = `/projects/${this.project_number}/apps/${this.project_id}`
        try {
            // this.publicKeys = await this.oauthClient.getIapPublicKeysAsync()
        } catch (e) {
            console.log(`
                Sign In with Google failed to initialize. But the error is not critical
            `.red)
        }
    }


    /**
     * Now, the process of verifying a user's account
     * @param {object} param0
     * @param {('login'|'signup'|'reset')} param0.intent
     * @param {object} param0.clientRpc
     * @returns {Promise<{gid: string}>}
     */
    async toUniqueCredentials({ data, intent, clientRpc }) {

        if (intent !== 'login') {
            throw new Exception(`Sorry, you cannot reset your Google password here, neither can you Sign Up for a Google account here. You can only login`, {
                code: 'error.inputValidation'
            })
        }

        let ticket
        try {
            ticket = await this.oauthClient.verifyIdToken({ idToken: data?.token, audience: this.client_id, maxExpiry: 24 * 60 * 60 * 1000 }, /*this.publicKeys, this.audience, ['https://cloud.google.com/iap']*/)
        } catch (e) {
            console.log(`Error verifying ticket\n`, e)
            throw new Exception(`Unauthorized user`, {
                code: 'error.modernuser.authError'
            })
        }

        let payload = ticket.getPayload();
        const logindata = {
            gid: payload.sub,
        }

        //Now if the account didn't exist before, create it
        if(!await this.system.findLoginDirect(logindata)){
            console.log(`Creating profile `, logindata, ` for the first time`)
            await this.system.createProfileAndLogin(logindata, true)
        }
        

        return logindata


    }

    /**
    * Here we're are returning a unique representation of only the strictly necessary data
    * @param {object} param0 
    * @param {object} param0.object
    * @param {('login'|'signup'|'reset')} param0.intent
    */
    async toMinimalUniqueCredentials({ data, intent }) {

        return { token: data.token }
    }

    get remote() {
        //Nothing yet
        return {
            public: this[public_methods_symbol] ||= new GooglePublicMethods(this),
            internal: this[internal_methods_symbol] ||= new GoogleInternalMethods(this)
        }
    }

    static get credential_fields() {
        return [
            'client_id',
            'client_secret',
            'project_id',
            'project_number',
        ]
    }

    static get client_credential_fields() {
        return ['client_id']
    }



}

const internal_methods_symbol = Symbol(`GoogleProvider.prototype.internal_methods`)
const public_methods_symbol = Symbol(`GoogleProvider.prototype.public_methods`)