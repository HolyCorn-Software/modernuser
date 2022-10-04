/*
Copyright 2021 HolyCorn Software
The HCTS Project
This defines the structure of a login provider

Therefore, subclasses must follow this pattern
*/

import { FacultyPublicJSONRPC } from "../../../../system/comm/rpc/faculty-public-rpc.mjs";
import { FacultyPlatform } from "../../../../system/lib/libFaculty/platform.mjs";
import { BaseModel } from "../../../../system/lib/libFaculty/provider-driver.js"
import AuthenticationProviderSystemAPI from "./system-api.mjs";

const faculty = FacultyPlatform.get();


export default class UserAuthenticationProvider extends BaseModel {

    /**
     * Sub classes should use the fields of the object provided do some necessary initializations
     * @param {object} param0 
     */
    constructor({ ...credentials } = {}) {
        super();

        this.getCollection = (name) => {
            return faculty.database.collection(`${faculty.descriptor.name}.providers.${this.$data.name}.${name}`)
        }

        /** @type {AuthenticationProviderSystemAPI} */ this.system

    }

    /**
     * This method will be called on the sub-class, by the system, in order that the provider should 
     * do some long initializations
     */
    async init() {

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
     * Whenever the provider deems it necessary that the login should become active, it calls the system.updateLoginState(true|false)
     * It is used to either activate or deactivate a login using it's id.
     * 
     * Take note that a login_id is only during signup
     * 
     * @param {object} param0
     * @param {string} param0.login_id
     * @param {object} param0.data
     * @param {('login'|'signup'|'reset')} param0.intent
     * @param {FacultyPublicJSONRPC} param0.clientRpc Could be null
     * @return {Promise<object>}
     */
    async toUniqueCredentials({ data, login_id, intent, clientRpc }) {

    }

    /**
     * Providers should override this method to provide a unique representation of the data with only the strictly necessary fields.
     * 
     * For example, if your provider uses username and password to log a client in, then the minimal unique data, could be calculated using only the username, because the username alone is enough to distinguish a login
     * @param {object} param0 
     * @param {object} param0.data
     * @param {('login'|'signup'|'reset')} param0.intent
     */
    async toMinimalUniqueCredentials({ data, intent }) {

    }


    /**
     * The provider should override and return an interface which contains remote methods.
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


    /**
     * Sub classes should override this to specify the fields that must be present in the credentials supplied to them
     * from the database.
     * For example, some providers require project_id, client_id, and so on.
     * Specifying these fields allow us to check at boot time whether the credentials supplied meet the requirements
     */
    static get credential_fields() {
        return ['client_id']
    }

    /**
     * On the front-end, the clients need access to certain credentials of the provider, such as client_id
     * However, not all of them, for example, client_secret.
     * By overriding this field, sub-classes can specify which credentials their clients actually need to function.
     */
    static get client_credential_fields() {
        return ['client_id']
    }


}
