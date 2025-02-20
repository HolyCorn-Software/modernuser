/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This widget represents a single item on the user input dropdown
 */

import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";

export default class ItemView extends Widget {


    /**
     * 
     * @param {modernuser.profile.UserProfileData} userdata 
     */
    constructor(userdata) {
        super();

        super.html = hc.spawn({
            classes: ['hc-cayofedpeople-user-n-role-input-item'],
            innerHTML: `
                <div class='container'>
                    <div class='main'>
                        <img>
                        <div class='data'>
                            <div class='label'></div>
                            <div class='id'></div>
                        </div>
                    </div>
                </div>
            `
        });

        /** @type {string} */ this.label

        for (const prop of ['label', 'id']) {
            this.htmlProperty(`.container >.main >.data >.${prop}`, prop, 'innerHTML')
        }

        /** @type {string} */ this.icon
        this.htmlProperty(`.container >.main >img`, 'icon', 'attribute', undefined, 'src')

        Object.assign(this, userdata);
    }

}