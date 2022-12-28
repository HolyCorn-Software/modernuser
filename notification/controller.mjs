/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module determines the overall logic of everything that has to do with notifications.
 * 
 * Note that contacts here refer to users' personal contacts, not the concept of role contacts
 */

import shortUUID from "short-uuid";
import { ProviderLoader } from "../../../system/lib/libFaculty/provider-driver.js";
import NotificationProviderModel from "./provider/model.mjs";



export default class NotificationController {


    /**
     * 
     * @param {import("./types.js").NotificationProviderCredentialsCollection} provider_credentials_collection 
     * @param {import("./types.js").UserContactsCollection} contacts_collection
     */
    constructor(provider_credentials_collection, contacts_collection) {

        this.providers = new NotificationProvidersController(provider_credentials_collection)
        this.contacts = new NotificationContactsController(contacts_collection, this.providers)
        this.messaging = new NotificationMessagingContoller(this.providers, this.contacts)


    }


    /**
     * 
     * @param {HTTPServer} http 
     */
    async init(http) {

        this.providers.init(http)

    }

}


const credentials_collection_symbol = Symbol()

const providers_symbol = Symbol()



/**
 * This class controls the functioning of providers.
 * 
 */
class NotificationProvidersController {

    /**
     * 
     * @param {import("./types.js").NotificationProviderCredentialsCollection} credentials_collection 
     */
    constructor(credentials_collection) {
        this[credentials_collection_symbol] = credentials_collection


        /** @type {[NotificationProviderModel]} */
        this[providers_symbol] = []
    }


    /**
     * This method will initialize providers and access to provider public files
     * @param {HTTPServer} http 
     */
    async init(http) {
        const providers_path = './provider/providers/';
        //First things first, we load the providers

        /** @type {ProviderLoader<NotificationProviderModel>} */
        const loader = new ProviderLoader(
            {
                providers: providers_path,
                credentials_collection: this[credentials_collection_symbol],
                fileStructure: ['./provider.mjs', './public/input-widget.mjs', './public/icon.png'],
                model: './provider/model.mjs',
                relModulePath: './provider.mjs'
            },
            import.meta.url
        );

        let results = await loader.load()

        if (results.errors.length !== 0) {
            console.error(`${'Could not load all notification providers'.underline}\n\n\n${results.errors.map(err => ` ${err.stack || err.message}`).join(`\n\n${'-'.repeat(process.stdout.columns)}\n\n`)}`)
        }

        this[providers_symbol].push(...results.providers)


        //Setup access to the public files of each provider
        let file_server = new StrictFileServer({
            http,
            urlPath: '/notification/providers/',
            refFolder: './provider/providers/'
        })

        for (let provider of results.providers) {
            file_server.add(`${providers_path}${provider.$data.name}/public/`)
        }


    }

    /**
     * This finds a provider by name
     * @param {string} name 
     * @returns {NotificationProviderModel}
     */
    findProvider(name) {
        const provider = this[providers_symbol].find(x => x.$data.name === name)
        if (!provider) {
            console.warn(`A client tried to find a provider named: ${name}, but did not succeed. Here are the list of providers`, this[providers_symbol])
            throw new Exception(`There's no notification provider known as '${name}'`, { code: 'error.modernuser.notification.provider_not_found' })
        }

        return provider
    }

    /**
     * @returns {[{name:string, label:string}]}
     */
    get provider_public_data() {
        return this[providers_symbol].map(x => {
            return { name: x.$data.name, label: x.label }
        })
    }




}


const providers_controller_symbol = Symbol()

const contacts_collection_symbol = Symbol()





/**
 * Controls access to user contacts
 */
class NotificationContactsController {

    /**
     * 
     * @param {import("./types.js").UserContactsCollection} contacts_collection 
     * @param {NotificationProvidersController} providers_controller
     */
    constructor(contacts_collection, providers_controller) {

        this[contacts_collection_symbol] = contacts_collection

        this[providers_controller_symbol] = providers_controller
    }



    /**
     * This method adds a contact for a user
     * @param {Omit<import("./types.js").UserContact, "id">} contact 
     * @returns {Promise<void>}
     */
    async addContact(contact) {
        //First things first, find the provider
        let provider = this[providers_controller_symbol].findProvider(contact.provider)
        //Then check if the contact is correct
        await provider.validateContact(contact.data)
        //Now clear the way...
        await provider.authNewUser(contact.data)
        //Finally... add it
        const query = {
            provider: contact.provider,
            data: contact.data,
            userid: contact.userid
        }
        await this[contacts_collection_symbol].updateOne(
            query,

            {
                $set: {
                    ...query,
                    id: `${shortUUID.generate()}${shortUUID.generate()}`
                }
            },
            {
                upsert: true
            }
        )
    }

    /**
     * This method deletes all the contacts of a user
     * @param {string} userid 
     * @returns {Promise<void>}
     */
    async deleteContacts(userid) {
        await this[contacts_collection_symbol].deleteMany({ userid })
    }

    /**
     * This method is used to delete a single contact
     * @param {string} id 
     * @returns {Promise<void>}
     */
    async deleteContact(id) {
        await this[contacts_collection_symbol].deleteOne({ id })
    }


    /**
     * This method is used to get all the contacts of a given user
     * @param {string} userid 
     * @returns {Promise<[import("./types.js").UserContact]>}
     */
    async getContacts(userid) {
        return await this[contacts_collection_symbol].find({ userid }).toArray()
    }

}



const contacts_controller_symbol = Symbol()

class NotificationMessagingContoller {

    /**
     * 
     * @param {NotificationProvidersController} providers_controller
     * @param {NotificationContactsController} contacts_controller 
     */
    constructor(providers_controller, contacts_controller) {

        this[providers_controller_symbol] = providers_controller
        this[contacts_controller_symbol] = contacts_controller
    }

    /**
     * This method is used to send a text message
     * @param {import("./types.js").TextMessageData} data 
     * @returns {Promise<void>}
     */
    async sendText(data) {

        const user_contacts = await this[contacts_controller_symbol].getContacts(data.userid)

        await Promise.allSettled(
            user_contacts.map(async contact => {
                const provider = this[providers_controller_symbol].findProvider(data.provider)
                await provider.notify(data.message, contact.data)
            })
        ).then(results => {
            console.log(`Could not send notification to some contacts because\n`, results.filter(res => res.status === 'rejected').map(res => res.reason).join('\n'))
        })

    }

}