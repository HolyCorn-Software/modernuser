/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This widget represents a single item on the user input dropdown
 */

import systemRpc from "/$/system/static/comm/rpc/system-rpc.mjs";
import { hc } from "/$/system/static/lib/hc/lib/index.js";
import { Widget } from "/$/system/static/lib/hc/lib/widget.js";


/**
 * @deprecated
 * Use user-n-role-input
 */
export class AdminUserInputUserView extends Widget {


    /**
     * 
     * @param {import("faculty/user/logic/types.js").FrontendRawUserProfile} userdata 
     */
    constructor(userdata) {
        super();

        super.html = hc.spawn({
            classes: ['hc-donorforms-admin-user-input-item'],
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

        systemRpc.system.error.report(new Error(`This widget is deprecated!`))
    }

}