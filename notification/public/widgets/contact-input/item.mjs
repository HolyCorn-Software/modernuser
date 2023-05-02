/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This widget represents a single clickable item on the contact-input widget
 */

import { Checkbox } from "/$/system/static/html-hc/widgets/checkbox/checkbox.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class ContactInputItem extends Widget {


    /**
     * 
     * @param {{icon: string, selected: boolean, label}} data 
     */
    constructor(data) {
        super();

        this.html = hc.spawn(
            {
                classes: ['hc-cayofedpeople-notification-contact-input-item'],
                innerHTML: `
                    <div class='container'>
                        <div class='checkbox'></div>
                        <img class='icon'>
                        <div class='label'>SMS</div>
                    </div>
                `
            }
        );


        /** @type {Checkbox} */ this.checkbox
        this.widgetProperty(
            {
                selector: '.' + Checkbox.classList.join('.'),
                parentSelector: '.container >.checkbox',
                property: 'checkbox',
                childType: 'widget',
            }
        )

        this.checkbox = new Checkbox()


        /** @type {string} */ this.icon
        this.htmlProperty('img.icon', 'icon', 'attribute', undefined, 'src')

        /** @type {string} */ this.label
        this.htmlProperty('.label', 'label', 'innerHTML')


        this.html.$('img.icon').addEventListener('click', () => this.checkbox.value = !this.checkbox.value)

        /** @type {HTMLElement} */ this.contentHTML

        /** @type {string} */ this.path

        /** @type {string} */ this.provider

        /** @type {function(('change'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener


        Object.assign(this, data)

    }
    /**
     * @returns {boolean}
     */
    get selected() {
        return this.checkbox.value
    }
    /**
     * @param {boolean} selected
     */
    set selected(value) {
        this.checkbox.value = value
    }

    get value() {
        return this.contentHTML?.widgetObject?.value
    }
    set value(value) {
        if (this?.contentHTML?.widgetObject) {
            this.contentHTML.widgetObject.value = value
        }
    }

    /**
     * This method returns a promise that will resolve once the widget is ready to work
     * @returns {Promise<void>}
     */
    async ready() {
        return new Promise((resolve, reject) => {
            const check = () => {
                return this.contentHTML && !this.contentHTML.classList.contains('hc-cayofedpeople-notification-contact-input-item-placeholder')
            }
            if (check()) {
                return resolve()
            }
            const interval = setInterval(() => {
                if (check()) {
                    clearInterval(interval)
                    resolve()
                }
            }, 100)
        })
    }


    /**
     * We Simply look for the widget, instantiate it, then store
     * @returns {Promise<void>}
     */
    async loadUI() {
        let placeholder = hc.spawn({
            classes: ['hc-cayofedpeople-notification-contact-input-item-placeholder']
        })
        // await this.loadBlock()

        this.contentHTML = placeholder


        placeholder.remove()
        // await this.loadUnblock()
    }

}