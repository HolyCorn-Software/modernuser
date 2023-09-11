/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * 
 * This popup-based widget allows a user to rename an item
 */

import PopupForm from "/$/system/static/html-hc/widgets/popup-form/form.mjs";


export default class NavigationItemRenamePopup extends PopupForm {

    /**
     * 
     * @param {modernuser.zonation.ZoneData data 
     */
    constructor(data) {
        super({
            caption: `Enter a new label`,
            title: `Renaming ${data.label}`,
            positive: 'Rename',
            negative: 'Cancel'
        });

        this.form = [
            [
                {
                    label: 'New label',
                    type: 'text',
                    name: 'label'
                }

            ]
        ]

        this.formWidget.values = {
            label: data.label
        }

        this.html.classList.add('hc-cayofedpeople-zonation-manager-popup')


    }

}