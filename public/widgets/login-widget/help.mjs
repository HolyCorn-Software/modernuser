/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This widget shows a simple warning to users
*/
import dictionary from "/$/system/static/lang/dictionary.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class LoginHelp extends Widget {

    constructor() {
        super();

        this.html = hc.spawn({
            classes: ['hc-cayofedpeople-login-help'],
            innerHTML: `
                <div class='container'>
                    <div class='title'></div>
                    <div class='content'></div>
                </div>
            `
        });

         /** @type {string} */ this.title
         /** @type {string} */ this.content;

        for (let prop of ['title', 'content']) {
            this.htmlProperty(`.container >.${prop}`, prop, 'innerHTML')
        }


        this.blockWithAction(async () => {

            this.content = await dictionary.get({
                code: 'modernuser_authentication_login_help',
                nullValue: `If you are new, create an account using your phone number and a password of your choosing.<br>You can also login using Google. Tap the G button and verify your identity with Google. In that case, we'll store your data in your Google account.
            <br>When signing up, beware that your account will need extra confirmation.`
            });

        })
        this.title = `Help`
    }

}