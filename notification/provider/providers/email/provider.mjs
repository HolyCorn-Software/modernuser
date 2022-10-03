/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module allows the system to send notifications to users over Email
 */

import { Exception } from "../../../../../../system/errors/backend/exception.js";
import NotificationProviderModel from "../../model.mjs";
import nodeMailer from 'nodemailer'



export default class EmailNotificationProvider extends NotificationProviderModel {


    constructor() {
        super()

    }



    /**
     * Providers implement this method so that the system can call it when a message has to reach a user
     * @param {import("faculty/modernuser/notification/types.js").MessageData} message 
     * @param {import("./types.js").EmailContact} contact 
     * @returns {Promise<void>}
     */
    async notify(message, contact) {
        
        throw new Error(`Not implemented a method to send emails.`)
    }



    /**
     * 
     * @param {import("./types.js").EmailContact} data 
     */
    authNewUser(data) {
        //TODO: Send a template message telling the user to that this contact this email has been added for a user... If he wishes, he can opt-out
    }

    /**
     * This method is used to validate a Email contact
     * @param {import("./types.js").EmailContact} data 
     * @returns {Promise<void>}
     */
    async validateContact(data) {
        if (! /.+@.+\..{2,}$/.test(data.email)) {
            throw new Exception(`Please, enter a valid email. You entered ${data.email || 'nothing'}`)
        }
    }




    /**
     * This method sends a text email
     * @param {string} email 
     * @param {objec} param1 
     * @param {string} param0.content
     * @param {string} param1.subject
     * @param {string} param1.from
     * @returns {Promise<void>}
     */
    async sendTextEmail(email, { content, subject, from = "Catholic Youth Federation Bamenda" }) {
        //TODO: Send HTML Email
        //TODO: Create possibility of the platform having label and icon
        checkArgs(arguments, {
            '0': 'string'
        });

        checkArgs(arguments[1], {
            content: 'string',
            subject: 'string'
        })

        let mailer = nodeMailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
                user: this.smtp_email,
                pass: this.smtp_password
            }
        });

        try {
            await mailer.verify()
        } catch (e) {
            console.log(`Google could not send email to %o, because %s`, email, e.message || e)
            throw new Exception(`Google failed to notify the user. An unexpected error occurred`, { code: `error.${platform.descriptor.name}.could_not_send_email` });
        }

        await mailer.sendMail({
            text: content,
            subject,
            from: from,
            to: email
        });

    }







    /**
     * Gets the bearer token from the database
     * @returns {Promise<import("./types.js").EmailProviderCredentials>}
     */
    async getCredentials() {
        return (await this.$data.credentials_collection.findOne({ name: this.$data.name }))
    }

    static get credential_fields() {
        return [
            'smtp_email',
            'smtp_password',
        ]
    }


    static get client_credential_fields() {
        return []
    }






    async init() {
        console.log(`Email notification initialized!`.cyan)
    }

    get label() {
        return `Email`
    }
}
