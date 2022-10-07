/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * 
 * This popup-based widget allows a user to rename an item
 */

import PopupForm from "/$/system/static/html-hc/widgets/popup-form/form.mjs";


export default class CreatePopup extends PopupForm {

    /**
     * 
     * @param {{superzone_label: string}} data 
     */
    constructor(data) {
        super({
            caption: `Choose a label`,
            title: `Creating a new zone ${data.superzone_label ? `under ${data.superzone_label}` : ''}`,
            positive: 'Create',
            negative: 'Cancel'
        });

        this.form = [
            [
                {
                    label: 'Label',
                    type: 'text',
                    name: 'label'
                }

            ]
        ]

        this.html.classList.add('hc-cayofedpeople-zonation-manager-popup')



    }

}