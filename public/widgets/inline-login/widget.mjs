/**
 * Copyright 2023 HolyCorn Software
 * The Modern Faculty of Users
 * The inline-login widget
 */

import logic from "../login-widget/logic.mjs";
import LoginWidget from "../login-widget/widget.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import { hc, Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";





/**
 * 
 * This widget (inline-login), allows other components to quickly include a view whereby the user can sign in
 */
export default class InlineLogin extends Widget {


    constructor() {
        super();

        this.html = hc.spawn(
            {
                classes: InlineLogin.classList,
                innerHTML: `
                    <div class='container'>

                        <div class='top'>
                            <div class='actions'></div>
                        </div>

                        <div class='methods'>
                            <!-- The login methods go here -->
                        </div>

                        <div class='bottom'>
                            <div class='caption'>Looking for something else?</div>
                            <div class='actions'></div>
                        </div>

                    </div>
                `
            }
        );

        /** @type {LoginWidget[]} */ this.methods
        this.pluralWidgetProperty(
            {
                selector: '*',
                parentSelector: '.container >.methods',
                property: 'methods',
                childType: 'widget',
            }
        );

        /** @type {{label: string, href: string}[]} */ this.actions
        this.pluralWidgetProperty(
            {
                selector: 'a',
                parentSelector: '.container >.bottom >.actions',
                property: 'actions',
                transforms: {
                    /**
                     * 
                     * @param {this['actions']['0']} data 
                     * @returns {HTMLElement}
                     */
                    set: (data) => {
                        return hc.spawn(
                            {
                                innerHTML: data.label,
                                tag: 'a',
                                attributes: {
                                    href: data.href,
                                    target: '_blank'
                                }
                            }
                        )
                    },
                    /**
                     * @param {HTMLElement} aEl 
                     * @returns {this['actions']['0']}
                     */
                    get: (aEl) => {
                        return {
                            label: aEl.innerHTML,
                            href: aEl.getAttribute('href')
                        }
                    }
                }
            }
        );

        const muserLoginPage = `/$/modernuser/static/login/`

        this.actions = [
            {
                label: 'Reset Password',
                href: muserLoginPage
            },
            {
                label: 'Sign Up',
                href: muserLoginPage
            }
        ];
        


        this.waitTillDOMAttached().then(() => this.loadUI())


    }

    static get classList() {
        return ['hc-modernuser-inline-login']
    }

    async loadUI() {

        this.loadWhilePromise((async () => {
            const methods = await logic.fetchLoginWidgets()
            this.methods = methods
        })()).catch(e => handle(e))


    }


}