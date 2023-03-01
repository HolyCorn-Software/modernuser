/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This widget is a popup where a user can be added to a role
 */

import muserRpc from "../../lib/rpc.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import PopupForm from "/$/system/static/html-hc/widgets/popup-form/form.mjs";



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
                        name: 'user',
                        type: 'customWidget',
                        mode: 'user'
                    }
                ]
            ],
            positive: 'Add',
            negative: 'Go back',
            caption: `You are about to assign someone the role of ${roledata.label}. We remind you to rely on the userid when searching, and not the name of the person`,
            title: `Add User`,
            execute: async () => {

                if (!this.value.user.id) {
                    throw new Error(`Please make sure you selected a user from the list. Typing the name is not enough`)
                }

                await muserRpc.modernuser.role.role_play.addRoleToUser({
                    subject: this.value.user.id,
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