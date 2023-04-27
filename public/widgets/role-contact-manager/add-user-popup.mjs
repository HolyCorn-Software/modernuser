/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This widget is a popup where a user can be made a contact person for a given role
 */

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs"
import { handle } from "/$/system/static/errors/error.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import PopupForm from "/$/system/static/html-hc/widgets/popup-form/form.mjs";



export default class AddUserPopup extends PopupForm {

    /**
     * 
     * @param {object} param0
     * @param {modernuser.role.data.Role} param0.roledata 
     * @param {string} param0.zone
     */
    constructor({roledata, zone}) {
        super({
            form: [
                [
                    {
                        customWidgetUrl: "/$/modernuser/static/widgets/user-n-role-input/widget.mjs",
                        label: 'User',
                        name: 'userid',
                        type: 'customWidget',
                        mode: 'user'
                    }
                ]
            ],
            positive: 'Add',
            negative: 'Go back',
            caption: `You are to make someone a contact person for the role of ${roledata.label}. We remind you to rely on the userid when searching, and not the name of the person`,
            title: `Add User`
        });

        this.html.classList.add('hc-cayofedpeople-role-play-add-user-popup')

        /** @type {function(('add'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener


        this.addEventListener('complete', async () => {
            try {
                this.positiveButton.state = 'waiting'

                if (!this.value.userid) {
                    throw new Error(`Please make sure you selected a user from the list. Typing the name is not enough`)
                }

                await hcRpc.modernuser.role.contact.addContact({
                    subject: this.value.userid,
                    role: roledata.id,
                    zone: zone
                });

                this.dispatchEvent(new CustomEvent('add'))

                this.positiveButton.state = 'success'
                setTimeout(() => this.hide(), 1300);
            } catch (e) {
                handle(e)
                this.positiveButton.state = 'initial'
            }
        })

    }

}


hc.importModuleCSS(import.meta.url)