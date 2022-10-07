/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This widget allows a user to select a zone
 * It could be constrained to show only zones that are a descendant of a given zone
 */

import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";

import ZoneInputPopup from './popup.mjs'




export default class ZoneInput extends Widget {

    /**
     * 
     * @param {object} param0 
     * @param {string} param0.name This is optional
     * @param {string} param0.label This is optional
     * @param {boolean} param0.modal If set to true, the popup will not close untill the user has selected something
     */
    constructor({ name, label, modal } = {}) {

        super();

        this.html = hc.spawn(
            {
                classes: ZoneInput.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='label'></div>

                        <div class='main'>
                            <img src="${new URL('./res/zone.png', import.meta.url).href}">
                            <div class='label'>Select Zone</div>
                        </div>
                    </div>
                `
            }
        );

        /** @type {string} */ this.name

        /** @type {string} */ this.label
        this.htmlProperty('.container >.label', 'label', 'innerHTML')

        /** @type {function(('change'|'dismiss-popup'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener

        this.html.$('.main').addEventListener('click', () => {
            this.show()
        });

        /** @type {boolean} */ this.hidden_n_disabled
        this.htmlProperty(undefined, 'hidden_n_disabled', 'class', undefined, 'hidden-disabled')

        Object.assign(this, arguments[0])

    }

    show() {
        let popup = new ZoneInputPopup({ max_top_path: '0', modal: this.modal })
        popup.show()

        let completed = false;

        popup.addEventListener('complete', () => {
            this[value_symbol] = popup.value
            popup.hide()
            this.html.$('.container >.main >.label').innerHTML = this[value_symbol].label
            this.dispatchEvent(new CustomEvent('change'))
            completed = true;
        })

        popup.addEventListener('hide', () => {
            if (!completed) {
                this.dispatchEvent(new CustomEvent('dismiss-popup'))
            }
        })

    }

    static get classList() {
        return ['hc-cayofedpeople-zonation-zone-input']
    }

    /**
     * The id of the selected zone
     * @returns {string}
     */
    get value() {
        return this[value_symbol]?.id
    }

    /**
     * The label of the selected zone
     * @returns {string}
     */
    get valueLabel(){
        return this[value_symbol]?.label
    }

}


const value_symbol = Symbol(`ZoneInputPopup.prototype.value`)