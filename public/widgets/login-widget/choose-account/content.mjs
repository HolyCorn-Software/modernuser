/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This widget is the main section of the choose-account widget.
 */

import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs"
import { Checkbox } from "/$/system/static/html-hc/widgets/checkbox/checkbox.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";



/**
 * @extends Widget<ChooseAccountContent>
 */
export default class ChooseAccountContent extends Widget {

    constructor() {

        super()


        super.html = hc.spawn({
            classes: ['hc-cayofedpeople-choose-account-content'],
            innerHTML: `
                <div class='container'>
                    <div class='title'>Choose an Account</div>
                
                    <div class='listings'></div>
                    
                    <div class='actions'></div>
                </div>
            `
        });

        /** @type {HTMLElement[]} */ this.actions
        this.pluralWidgetProperty(
            {
                selector: `*`,
                parentSelector: '.container >.actions',
                property: 'actions',
                childType: 'html'
            }
        )

        /** @type {function(("complete"), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener


        const continue_button = new ActionButton(
            {
                content: 'Continue',
                onclick: async () => {
                    if (this.selected_account) {
                        this.dispatchEvent(
                            new CustomEvent('complete')
                        )
                    }
                }
            }
        );
        continue_button.state = 'disabled'

        this.actions = [
            continue_button.html
        ];

        /** @type {import('./types.js').FrontendAccountData[]} */ this.accounts

        this.pluralWidgetProperty(
            {
                parentSelector: '.container >.listings',
                selector: `.hc-cayofedpeople-choose-account-item`,
                property: 'accounts',
                transforms: {
                    /**
                     * 
                     * @param {import("./types.js").FrontendAccountData} data 
                     */
                    set: (data) => {
                        const widget = new AccountDisplay(data)

                        widget.html.addEventListener('click', (event) => {
                            if (widget.checkbox.html.contains(event.target)) {
                                return; //If the checkbox was clicked, we have nothing to do with it
                            }
                            widget.checkbox.checked = !widget.checkbox.checked
                        });

                        widget.checkbox.addEventListener('change', () => {
                            if (widget.checkbox.checked) {
                                for (let otherWidget of this.accountWidgets) {
                                    if (otherWidget !== widget) {
                                        otherWidget.checkbox.silent_value = false
                                    }
                                }
                                setTimeout(() => continue_button.state = 'initial', 500)
                            } else {
                                continue_button.state = 'disabled'
                            }
                        });

                        return widget.html
                    },
                    get: (html) => {
                        const widget = html?.widgetObject
                        return {
                            userid: widget?.userid,
                            label: widget?.label,
                            active: widget?.active,
                            time: widget?.time
                        }
                    }
                }
            }
        );


        /** @type {AccountDisplay[]} */ this.accountWidgets
        this.pluralWidgetProperty(
            {
                parentSelector: '.container >.listings',
                selector: `.hc-cayofedpeople-choose-account-item`,
                property: 'accountWidgets',
                childType: 'widget'
            }
        )




    }

    /**
     * The id of the selected account
     * @returns {string}
     */
    get selected_account() {
        return this.accountWidgets.find(x => x.checkbox.checked)?.userid
    }


}




class AccountDisplay extends Widget {


    /**
     * 
     * @param {object} data 
     * @param {string} param0.userid
     * @param {string} param0.label
     * @param {number} param0.time
     * @param {boolean} param0.active
     * @param {string} param0.image
     */
    constructor(data) {

        super();

        this.html = hc.spawn(
            {
                classes: ['hc-cayofedpeople-choose-account-item'],
                innerHTML: `
                    <div class='container'>
                        <div class='image'><img></div>
                        <div class='main'>
                            <div class='label'></div>
                            <div class='creation-time'>Created on: <div class='date'></div> </div>
                        </div>
                        <div class='checkbox'></div>
                    </div>
                `
            }
        );

        /** @type {Checkbox} */ this.checkbox
        this.widgetProperty(
            {
                selector: `.${Checkbox.classList.join('.')}`,
                parentSelector: '.container >.checkbox',
                property: 'checkbox',
                childType: 'widget',
            }
        );
        this.checkbox = new Checkbox()



        /** @type {string} */ this.label
        this.htmlProperty('.container >.main >.label', 'label', 'innerHTML')

        /** @type {string} */ this.image
        this.htmlProperty('.container >.image >img', 'image', 'attribute', undefined, 'src')

        /** @type {number} */ this.time
        Reflect.defineProperty(this, 'time', {
            set: (time) => {
                this.html.$(".container >.main >.creation-time >.date").innerHTML = new Date(time).toDateString()
            },
            get: () => {
                throw new Error(`This property is not readable`)
            },
            configurable: true,
            enumerable: true
        });

        /** @type {string} */ this.userid

        /** @type {boolean} */ this.active
        this.htmlProperty(undefined, 'active', 'class', undefined, 'active')


        Object.assign(this, data)



    }


}