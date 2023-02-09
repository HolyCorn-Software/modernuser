/*
Copyright 2021 HolyCorn Software
The CAYOFED People System
The Modern Faculty of users
This provider allows the system to make use of sign in using phone number and password
*/

import UserAuthenticationProvider from "../../../lib/provider.mjs";
import PhoneLoginPublicMethods from "./remote/public.mjs";

import crypto from 'node:crypto'
import shortUUID from "short-uuid";
import PhoneLoginNotifier from "./notification/logic.mjs";


export default class PhoneLoginProvider extends UserAuthenticationProvider {


    constructor({ }) {

        super({ ...arguments[0] });


    }



    async init() {

        this.notifier = new PhoneLoginNotifier(this, this.$data.credentials.whatsapp_template_map)

        //Make pending logins and resets expire 3 days after
        this.pending_resets_collection.createIndex({ created: 1 }, { expireAfterSeconds: 72 * 60 * 60 * 1000 })
        this.pending_logins_collection.createIndex({ created: 1 }, { expireAfterSeconds: 72 * 60 * 60 * 1000 })
    }


    /**
     * Returns a unique representation of data
     *  @param {object} param0
     * @param {string} param0.login_id
     * @param {object} param0.data
     * @param {('login'|'signup'|'reset')} param0.intent
     * @param {FacultyPublicJSONRPC} param0.clientRpc
     * @return {Promise<object>}
     */
    async toUniqueCredentials({ data, login_id, intent, clientRpc }) {
        let unique_data = {};

        for (let key of ['phone', 'password']) {

            if (typeof data[key] === 'undefined') {
                throw new Exception(`Please enter the value for ${key}, and try again`, {
                    code: 'error.inputValidation'
                })
            }

            if (key === 'phone') {
                //Clean the phone number
                data[key] = data[key].replaceAll(/[^0-9]/g, '');
                data[key] = data[key].replace(/^237/, '');

                //This aspect of adding six(6) before a number has caused certain messages to not be sent on WhatsApp
                // data[key] = data[key].replace(/^[^6]/, (n) => `6${n}`)

                //Check if the number is Cameroonian
                if (!/^[62]{0,1}[269785][0-9]{7}$/.test(data[key])) {
                    throw new Exception(`Please enter a Cameroonian phone number`, {
                        code: 'error.inputValidation'
                    })
                }
            }

            //Now create a unique representation of the field by using hashing
            unique_data[key] = this.hash(data[key])
        }



        //If it's signup, check that passwords match
        if (intent === 'signup' && (data['password'] !== data['repeat_password'])) {
            throw new Exception(`The passwords don't match.`, {
                code: 'error.inputValidation'
            })
        }

        /**
         * This method is used to throw a reasonable error when the system fails to send a message
         * @param {Promise} promise 
         */
        const catch_message_send_error = (promise) => {
            return new Promise((resolve, reject) => {

                promise.then(resolve).catch(e => {
                    console.error(`Could not send WhatsApp message\n`, e)
                    reject(new Exception(`Sorry, we could not send a message to your phone number.\nThis is not your fault dear user`))
                })

            })
        }

        if (intent === 'reset') {

            let { token: security_token, url } = this.generateTokenUrl({ clientRpc, path: 'reset_password/' })


            await Promise.all(

                [



                    this.pending_resets_collection.updateOne({
                        phone: unique_data['phone']
                    },
                        {
                            $set: {
                                created: Date.now(),
                                password: unique_data['password'],
                                auth: security_token
                            }
                        },
                        { upsert: true }
                    ),

                    new Promise((resolve, reject) => {
                        catch_message_send_error(this.notifier.reset_password({ phone: data['phone'], link: url })).then(resolve).catch(e => reject(e))
                    })

                ]
            );

        }


        if (intent == 'signup') {

            let { token, url } = this.generateTokenUrl({ clientRpc, path: 'confirm_signup/' });


            await Promise.all([

                //Update the database while at the same time send tha activation message

                this.pending_logins_collection.updateOne({
                    phone: unique_data['phone']
                },
                    {
                        $set: {
                            created: Date.now(),
                            password: unique_data['password'],
                            auth: token
                        }
                    },
                    { upsert: true }
                ),

                new Promise((resolve, reject) => {
                    catch_message_send_error(this.notifier.activate_new_account({ phone: data['phone'], link: url })).then(resolve).catch(e => {
                        if (process.env.ENVIRONMENT === 'development') {
                            console.log(`The link: ${url.yellow}`)
                            resolve()
                        } else {
                            reject(e)
                            this.pending_logins_collection.deleteOne({ phone: unique_data['phone'] })
                        }
                    })
                })

            ])
        }


        return unique_data;
    }

    /**
     * Generates a new unique token and a url which the client can click 
     * @param {object} param0 
     * @param {FacultyPublicJSONRPC} param0.clientRpc
     * @param {string} param0.path
     * @returns {{url: string, token:string}}
     */
    generateTokenUrl({ clientRpc, path }) {

        let host = clientRpc.socketClient.request.headers['host']
        let origin = clientRpc.socketClient.request.headers.origin
        if (!host || !origin) {
            throw new Exception(`We cannot continue with resetting your password because your browser sent a bad request`, {
                code: 'error.inputValidation'
            })
        }

        let security_token = `${shortUUID.generate()}${shortUUID.generate()}${shortUUID.generate()}`

        let final_url = `${/^https/.test(origin) ? 'https' : 'http'}://${host}/${this.system.frontendPath}${path}?token=${security_token}`

        return {
            token: security_token,
            url: final_url
        }

    }

    /**
     * Here we're are returning a unique representation of only the strictly necessary data
     * @param {object} param0 
     * @param {object} param0.object
     * @param {('login'|'signup'|'reset')} param0.intent
     */
    async toMinimalUniqueCredentials({ data, intent }) {
        let minimal_unique = {}
        for (let key of ['phone']) {
            minimal_unique[key] = this.hash(data[key])
        }

        return minimal_unique
    }

    /**
     * This method verifies a pending login using the verification token, and then returns an authentication token for the login
     * @param {object} param0 
     * @param {string} param0.token
     * @returns {Promise<string>}
     */
    async verifyPendingAccount({ token }) {
        let data = await this.pending_logins_collection.findOne({
            auth: token
        });

        if (!data) {
            throw new Exception(`You probably clicked an invalid link.\n`)
        }

        if (data.used) {
            throw new Exception(`You already clicked this link before. You can just <a href='/$/${FacultyPlatform.get().descriptor.name}/onboarding/static/request/'>Click Here</a> to setup your account`)
        }

        const login_token = await this.system.activateLogin({
            phone: data.phone
        })

        this.pending_logins_collection.updateOne({ auth: token }, { $set: { used: true } });

        return login_token;
    }

    async resetPassword({ token }) {
        let data = await this.pending_resets_collection.findOne({
            auth: token
        });

        if (!data) {
            throw new Exception(`It is either you clicked an invalid link, or the link was already clicked before.`)
        }

        await this.system.updateLogin(
            {
                phone: data.phone
            },
            {
                phone: data.phone,
                password: data.password
            }
        );

        this.pending_resets_collection.deleteOne({ auth: token })
    }

    /**
     * This method returns a hash of the input
     * @param {string} string 
     * @returns {string}
     */
    hash(string) {
        let h = (algo) => crypto.createHash(algo).update(string).digest().toString('hex')
        return `${h('md5')}${h('sha256')}`
    }

    /**
     * @returns {import("./types.js").PhoneLoginPendingResetsCollection}
     */
    get pending_resets_collection() {
        return this.getCollection('pending_resets')
    }


    /**
     * @returns {import("./types.js").PhoneLoginPendingLoginsCollection}
     */
    get pending_logins_collection() {
        return this.getCollection('pending_logins')
    }


    get remote() {
        return {
            public: this.__remote__ ||= new PhoneLoginPublicMethods(this),
            internal: {}
        }
    }

    static get credential_fields() {
        return [
            'whatsapp_api_bearer_auth_token',
            'whatsapp_api_phone_number_id'
        ]
    }

    static get client_credential_fields() {
        return []
    }



}


