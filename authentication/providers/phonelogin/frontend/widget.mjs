/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * This widget allows a user to create an account or login using phone
 * It contains the actual forms
 */

import LoginWidget from "../../../lib/widget-model.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs"
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import MultiFlexForm from "/$/system/static/html-hc/widgets/multi-flex-form/flex.mjs";

hc.importModuleCSS(import.meta.url);


export default class PhoneLogin extends LoginWidget {


    constructor() {
        super();

        super.html = hc.spawn({
            classes: ['hc-cayofedpeople-phone-login'],
            innerHTML: `
                <div class='container'>
            
                    <div class='logo'>
                        <div class='caption'>Login</div>
                    </div>

                    <div class='form-view'>
                        <div class='form'></div>
                        <div class='actions'></div>
                    </div>
                    

                </div>
            `
        });

        /** @type {string} */ this.caption
        this.htmlProperty('.container >.logo >.caption', 'caption', 'innerHTML');

        /** @type {MultiFlexForm} */ this.form
        this.widgetProperty({
            selector: '.hc-multi-flex-form',
            parentSelector: '.container >.form-view >.form',
            property: 'form',
            childType: 'widget',
        })

        this.form = new MultiFlexForm()

        // this.html.$('.form-view >.form').appendChild(slider.html);

        /** @type {ActionButton} */ this.button
        this.widgetProperty({
            selector: '.hc-action-button',
            property: 'button',
            parentSelector: '.form-view >.actions'
        })

        this.button = new ActionButton({
            content: 'Login',
            onclick: () => {
                try {
                    this.inputOkay()
                    this.dispatchEvent(new CustomEvent('complete'))
                } catch (e) {
                    handle(e)
                }
            }
        })

        /** @type {('login'|'signup'|'reset')} */ this.face
        let face_value = ''
        Reflect.defineProperty(this, 'face', {
            set: (face) => {
                if (this.face === face) {
                    return; //Already on the current face. TODO: do animation to show that we're alreay on that screen
                }

                this.form.quickStructure = faces[face].form
                this.button.content = this.caption = faces[face].buttonLabel
                face_value = face
            },
            get: () => face_value,

            enumerable: true,
            configurable: true
        });


        Object.assign(this, arguments[0])

    }
    get values() {
        return this.form.value
    }

    /**
     * This returns true if the user's input is correct
     */
    inputOkay() {
        const structure = faces[this.face].form
        for (let row of structure) {
            for (let field of row) {
                if (!this.values[field.name] || this.values[field.name].length === 0) {
                    throw new Error(`Please enter a value for ${field.label}`)
                }
            }
        }
    }

    /**
     * Here, we're deciding what do after the system is done with an action (e.g login)
     * @param {object} param0 
     * @param {('login'|'signup'|'reset')} param0.action
     * @param {object} param0.data
     */
    async onSystemAction({ action, data }) {
        switch (action) {
            case 'reset': {
                alert(`Instructions to reset your account have been sent to your phone number. Click on the link in the message to finalize the reset`);
                break;
            }

            case 'login': {
                break;
            }

            case 'signup': {
                alert(`Your account has been created. However, to activate the account, follow the instructions in the message sent to your phone`);
                break;
            }
        }

        this.form.empty()
    }

}






let faces = {
    login: {
        form: [

            [
                {
                    label: 'Phone',
                    name: 'phone'
                }
            ],

            [
                {
                    label: 'Password',
                    name: 'password',
                    type: 'password'
                },
            ]
        ],
        buttonLabel: 'Login'
    },
    account_share: {
        form: [

            [
                {
                    label: 'Phone',
                    name: 'phone'
                }
            ],

            [
                {
                    label: 'Password',
                    name: 'password',
                    type: 'password'
                },
            ]
        ],
        buttonLabel: 'Login'
    },

    signup: {
        form: [

            [
                {
                    label: 'Phone',
                    name: 'phone'
                }
            ],

            [
                {
                    label: 'New Password',
                    name: 'password',
                    type: 'password'
                },

                {
                    label: 'Repeat Password',
                    name: 'repeat_password',
                    type: 'password'
                },
            ]
        ],
        buttonLabel: 'Sign Up'

    },
    reset: {
        form: [
            [
                {
                    label: 'Phone',
                    name: 'phone'
                }
            ],
            [
                {
                    label: 'New Password',
                    name: 'password'
                }
            ]
        ],
        buttonLabel: 'Reset Password'
    }
}

