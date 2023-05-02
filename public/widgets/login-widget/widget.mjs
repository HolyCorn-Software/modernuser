/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * This widget allows a user to log in
 * 
 */

import LoginHelp from "./help.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";
import logic from "./logic.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import LoginWidgetNavigations from "./navigations.mjs";
import ProviderLoginWidget, { pluginData } from "/$/modernuser/static/authentication/lib/widget-model.mjs";


export default class LoginWidget extends Widget {


    /**
     * 
     * @param {object} param0 
     * @param {import("./types.js").LoginWidgetCustomizations} param0.custom Custom options for the widget
     */
    constructor({ custom } = {}) {
        super();

        super.html = hc.spawn({
            classes: LoginWidget.classList,
            innerHTML: `
                <div class='container'>
                    <div class='main-section'>
                        <div class='providers-section'></div>
                        <div class='navigation-section'></div>
                    </div>
                    <div class='help-section'></div>
                </div>
                
            `
        });

        /** @type {Widget[]} */ this.providers
        this.pluralWidgetProperty({
            selector: '*',
            parentSelector: '.container >.main-section >.providers-section',
            property: 'providers',
            childType: 'widget',
            transforms: {
                /**
                 * 
                 * @param { import("/$/modernuser/static/authentication/lib/widget-model.mjs").default} widget 
                 */
                set: (widget) => {

                    widget.addEventListener('complete', () => {

                        let action = widget.face || this.face;

                        let action_promise = (async () => {
                            try {
                                const data = await logic.executeAction({ action, provider: widget[pluginData].name, data: widget.values });

                                await this.onAction(widget, action, data);
                            } catch (e) {
                                handle(e)
                            }

                        })();


                        widget.loadWhilePromise(action_promise)

                    });

                    return widget.html
                }
            },
            immediate: true
        });



        this.widgetProperty({
            selector: '.hc-cayofedpeople-login-help',
            parentSelector: '.help-section',
            childType: 'widget',
            property: 'help'
        })

        if (custom?.help ?? true) {
            this.help = new LoginHelp()
        }


        /** @type {modernuser.authentication.AuthAction} */ this.face
        let face_storage = ''
        Reflect.defineProperty(this, 'face', {
            set: face => {
                for (let widget of this.providers) {
                    widget.face = face
                }
                face_storage = face
            },
            get: () => face_storage,
            configurable: true,
            enumerable: true
        });


        //The section where we can easily navigate through login, signup and reset



        this.widgetProperty({
            selector: '.hc-cayofedpeople-login-navigations',
            parentSelector: '.navigation-section',
            childType: 'widget',
            property: 'navigations',
            transforms: {
                /**
                 * 
                 * @param {LoginWidgetNavigations} widget 
                 */
                set: (widget) => {
                    widget.addEventListener('select', (ev) => {
                        this.html.scrollIntoView({ block: 'start', behavior: "smooth" })
                        setTimeout(() => this.face = ev.detail.action, 300);
                    });
                    return widget.html;
                }
            }
        });

        /** @type {LoginWidgetNavigations} */ this.navigations
        if (custom?.navigation ?? true) {
            this.navigations = new LoginWidgetNavigations()
        }



        this.waitTillDOMAttached().then(() => {
            this.loadProviders().then(() => {
                this.face = 'login'
            }).catch(e => handle(e))
        })

    }

    /**
     * This method is executed when action has been performed, such as successful login
     * @param {ProviderLoginWidget} widget 
     * @param {modernuser.authentication.AuthAction} action 
     * @param {modernuser.authentication.frontend.LoginStatus} data 
     * @returns {Promise<void>}
     */
    async onAction(widget, action, data) {
        await widget.onSystemAction({ action, data });
        if (action === 'login') {
            if (data.active) {
                await this.continue()
            } //else, the login was not active
        }
    }
    /**
     * This method is used internally, when login is complete, and it is time to leave the page
     */
    async continue() {
        window.location = new URLSearchParams(window.location.search).get('continue') || document.referrer || '/';
    }

    static get classList() {
        return ['hc-cayofedpeople-login'];
    }

    /**
     * Loads all the providers into the UI
     */
    async loadProviders() {

        this.loadBlock();
        try {
            this.providers = await logic.fetchLoginWidgets()
        } catch (e) {
            handle(new Error(`Could not load because\n${e}`))
        }
        this.loadUnblock();
    }
}
