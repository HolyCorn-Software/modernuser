/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This is the screen where the new user selects his name
 */

import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";
import MultiFlexForm from "/$/system/static/html-hc/widgets/multi-flex-form/flex.mjs";


export default class NamesScreen extends Widget {

    constructor() {
        super();

        this.html = hc.spawn({
            classes: ['hc-cayofedpeople-onboarding-names-screen'],
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
                    label: 'Names',
                    name: 'label'
                }
            ],
            [
                {
                    label: `Photo of you`,
                    name: 'icon',
                    type: 'uniqueFileUpload',
                    url: '/$/uniqueFileUpload/upload'
                }
            ]
        ]

    }

    isComplete() {

        const label_regexps = [[/[A-Za-z]/, `Please check that you have entered your names correct`], [/ {1,}/, `Please enter at least two(2) names`]]

        for (let entry of label_regexps) {
            if (!entry[0].test(this.form.value.label)) {
                throw new Error(entry[1])
            }
        }

        if (!this.value.icon) {
            return false
        }

        return true
    }



    /**
     * @returns {{label:string, icon: string}}
     */
    get value() {


        if (!this.form.value.icon) {
            throw new Error(`Please choose a profile photo. It is required.`)
        }
        if (!this.form.value.label) {
            throw new Error(`Please, you forgot to enter your names.`)
        }

        return this.form.value
    }

}