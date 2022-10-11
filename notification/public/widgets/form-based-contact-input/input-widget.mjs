/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This widget allows a provider to easily create an input widget that's based on simple forms
 * 
 */

import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";
import MultiFlexForm from "/$/system/static/html-hc/widgets/multi-flex-form/flex.mjs";



export default class FormBasedContactInput extends Widget {

    /**
     * 
     * @param {import("/$/system/static/html-hc/widgets/multi-flex-form/types.js").MultiFlexFormDefinitionData} structure 
     */
    constructor(structure) {
        super();
        this.html = hc.spawn(
            {
                classes: ['hc-cayofedpeople-notification-form-based-contact-input'],
                innerHTML: `
                    <div class='container'>
                        <div class='form'></div>
                    </div>
                `
            }
        );

        /** @type {MultiFlexForm} */ this.form
        this.widgetProperty(
            {
                selector: '.' + MultiFlexForm.classList.join('.'),
                parentSelector: '.container >.form',
                property: 'form',
                childType: 'widget',
            }
        );

        this.form = new MultiFlexForm()


        this.form.quickStructure = structure || [
            [
                {
                    label: 'Test Input',
                    type: 'text',
                    name: 'test'
                }
            ]
        ]

        /** @type {function(('change'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener
        
        this.form.addEventListener('change', () => this.dispatchEvent(new CustomEvent('change')))


    }

    /**
     * @returns {object}
     */
    get value() {
        return this.form.value
    }
    /**
     * @param {object} v
     */
    set value(v) {
        this.form.values = v
    }

}