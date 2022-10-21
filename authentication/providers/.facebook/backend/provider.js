/*
Copyright 2021 HolyCorn Software
The HCTS Project
The Faculty of Users
This module allows users to sign in using facebook
*/

import Provider from "../../../lib/provider.js";

import fetch from 'node-fetch'

import { URLSearchParams } from 'url';
import { SystemError } from "../../../logic/errors.js";

const platform = FacultyPlatform.get()


export default class FacebookProvider extends Provider {

    constructor({ client_id, client_secret }) {
        super(...arguments)
        this.client_id = client_id;
        this.client_secret = client_secret

    }

    async init() {
        //Nothing to do here
    }

    async login({ token } = {}) {

        let response = await fetch(`https://graph.facebook.com/me?` + new URLSearchParams({
            access_token: token,
            fields: ['id', 'email', 'name'].join(',')
        }))



        if (response.status != 200) {
            throw new SystemError(await response.text())
        }

        let userdata = await response.json()

        return {
            names: userdata.name, email: `${userdata.id}@facebook.com`
        } //This email is constructed just to ensure a unique field


    }

    async notify(user_profile, { message }) {
        throw new Exception(`Facebook cannot notify`, { code: `error.${platform.descriptor.name}.provider_cannot_notify` });
    }

    static get credential_fields() {
        return ['client_id', 'client_secret']
    }
    static get client_credential_fields() {
        return ['client_id']
    }

}
