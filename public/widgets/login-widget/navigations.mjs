/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System 
 * This is part of the login-widget
 * This widget (navigation) allows the user to move between login, signup and reset
 */

import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";



export default class LoginWidgetNavigations extends Widget {

    constructor() {
        super();

        this.html = hc.spawn({
            classes: ['hc-cayofedpeople-login-navigations'],
            innerHTML: `
                <div class='container'>
                    <div class='main'>
                        <div class='caption'>Looking for something else ?</div>
                        <div class='actions'></div>
                    </div>
                </div>
            `
        });

        /** @type {{name: string, label: string}[]} */ this.actions
        this.pluralWidgetProperty({
            selector: '.hc-cayofedpeople-login-navigation',
            parentSelector: '.container >.main >.actions',
            property: 'actions',
            transforms: {
                /**
                 * 
                 * @param {{name: string, label: string}} action 
                 */
                set: (action) => {
                    let widget = new NavigationAction(action);
                    widget.addEventListener('select', () => {
                        this.dispatchEvent(new CustomEvent('select', { detail: { action: widget.name } }))
                    });
                    return widget.html
                },
                get: (html) => {
                    /** @type {NavigationAction} */
                    let widget = html?.widgetObject
                    return {
                        name: widget?.name,
                        label: widget?.label
                    }
                }
            }
        });

        /** @type {function(('select'), function(CustomEvent<{action: string}>), AddEventListenerOptions)} */ this.addEventListener

        this.actions = [
            {
                label: 'Sign Up',
                name: 'signup'
            },
            {
                label: 'Login',
                name: 'login'
            },
            {
                label: 'Reset Password',
                name: 'reset'
            },
            {
                label: 'Share my account with someone',
                name:'account_share'
            }
        ]
    }

}



class NavigationAction extends Widget {
    constructor({ label, name }) {
        super();

        this.html = hc.spawn({
            classes: ['hc-cayofedpeople-login-navigation'],
            innerHTML: `
                <div class='container'>
                    Sign Up
                </div>
            `
        });

        /** @type {string} */ this.label
        this.htmlProperty('.container', 'label', 'innerHTML');

        /** @type {string} */ this.name

        /** @type {function(('select'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener


        this.html.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('select'))
        });

        Object.assign(this, arguments[0]);
    }
}