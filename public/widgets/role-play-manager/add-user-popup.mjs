/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This widget is a popup where a user can be added to a role
 */

import muserRpc from "../../lib/rpc.mjs";
import { hc } from "/$/system/static/lib/hc/lib/index.js";
import { PopupForm } from "/$/system/static/lib/hc/popup-form/form.js";



export default class AddUserPopup extends PopupForm {

    /**
     * 
     * @param {object} param0
     * @param {import("faculty/modernuser/role/data/types.js").RoleData} param0.roledata 
     * @param {string} param0.zone
     */
    constructor({ roledata, zone }) {
        super({
            form: [
                [
                    {
                        customWidgetUrl: "/$/modernuser/static/widgets/user-n-role-input/widget.mjs",
                        label: 'User',
                        name: 'userid',
                        type: 'customWidget',
                        mode: 'users'
                    }
                ]
            ],
            positive: 'Add',
            negative: 'Go back',
            caption: `You are about to assign someone the role of ${roledata.label}. We remind you to rely on the userid when searching, and not the name of the person`,
            title: `Add User`,
            execute: async () => {

                if (!this.value.userid) {
                    throw new Error(`Please make sure you selected a user from the list. Typing the name is not enough`)
                }

                await muserRpc.modernuser.role.role_play.addRoleToUser({
                    subject: this.value.userid,
                    role: roledata.id,
                    zone: zone
                });

                this.dispatchEvent(new CustomEvent('add'))
            }
        });

        this.html.classList.add('hc-cayofedpeople-role-play-add-user-popup')

        /** @type {function(('add'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener

    }

}


hc.importModuleCSS(import.meta.url)