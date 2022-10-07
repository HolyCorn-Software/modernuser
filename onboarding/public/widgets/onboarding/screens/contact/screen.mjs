/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This is the screen where the new user selects his name
 */

import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";
import MultiFlexForm from "/$/system/static/html-hc/widgets/multi-flex-form/flex.mjs";


export default class ContactsScreen extends Widget {

    constructor() {
        super();

        this.html = hc.spawn({
            classes: ['hc-cayofedpeople-onboarding-contacts-screen'],
            innerHTML: `
                <div class='container'>
                    
                </div>
            `
        });


        /** @type {MultiFlexForm} */ this.form
        this.widgetProperty(
            {
                selector: '.' + MultiFlexForm.classList.join('.'),
                parentSelector: '.container',
                property: 'form',
                childType: 'widget',
            }
        );

        this.form = new MultiFlexForm()


        this.form.quickStructure = [
            [
                {
                    label: 'Enter one or more contacts',
                    name: 'contact_input',
                    type: 'customWidget',
                    customWidgetUrl: "/$/modernuser/notification/static/widgets/contact-input/widget.mjs"
                }
            ]
        ]


    }
    get value(){
        return this.form.value.contact_input
    }

    isComplete() {
        return true
    }

}