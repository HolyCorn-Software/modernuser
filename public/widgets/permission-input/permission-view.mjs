/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This widget allows someone to enter permissions
 */

import { hc } from "/$/system/static/lib/hc/lib/index.js";
import { Widget } from "/$/system/static/lib/hc/lib/widget.js";

export default class PermissionInputView extends Widget {


    /**
     * 
     * @param {import("faculty/user/logic/types.js").FrontendRawUserProfile} userdata 
     */
    constructor(userdata) {
        super();

        super.html = hc.spawn({
            classes: ['hc-cayofedpeople-permission-input-item'],
            innerHTML: `
                <div class='container'>
                    <div class='label'></div>
                    <div class='id'></div>
                </div>
            `
        });

        /** @type {string} */ this.label
        /** @type {string} */ this.id

        for (let _prop of ['label', 'id']) {
            this.htmlProperty(`.container >.${_prop}`, _prop, 'innerHTML')
        }

        /** @type {string} */ this.id

        Object.assign(this, userdata);
    }

}