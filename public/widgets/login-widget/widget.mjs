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
import { pluginData } from "/$/modernuser/static/authentication/lib/widget-model.mjs";


export default class LoginWidget extends Widget {

    constructor() {
        super();

        super.html = hc.spawn({
            classes: ['hc-cayofedpeople-login'],
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

        /** @type {[Widget]} */ this.providers
        this.pluralWidgetProperty({
            selector: '*',
            parentSelector: '.container >.main-section >.providers-section',
            property: 'providers',
            childType: 'widget',
            transforms: {
                /**
                 * 
                 * @param { import("../../../authentication/lib/widget-model.mjs").LoginWidget} widget 
                 */
                set: (widget) => {
                    widget.addEventListener('complete', () => {
                        let action = this.face;
                        widget.loadBlock();

                        let action_promise = (async () => {
                            return await logic.executeAction({ action, plugin: widget[pluginData].name, data: widget.values });
                        })();

                        action_promise.catch(e => {
                            handle(e)
                        })

                        action_promise.finally(() => {
                            widget.loadUnblock()
                        })
                        action_promise.then(async (data) => {
                            try {
                                await widget.onSystemAction({ action: action, data: data })
                                window.location = document.referrer || '/'
                            } catch (e) {
                                handle(e)
                            }

                        });
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

        this.help = new LoginHelp()


        /** @type {('login'|'signup'|'reset')} */ this.face
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


        /** @type {LoginWidgetNavigations} */ this.navigations
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

        this.navigations = new LoginWidgetNavigations()



        this.loadProviders().then(() => {
            this.face = 'login'
        })

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
