/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The role-resolve widget
 * This sub-widget (new) is a widget that allows the admin to grant a new Role
 */


import muserRpc from "/$/modernuser/static/lib/rpc.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import PopupForm from "/$/system/static/html-hc/widgets/popup-form/form.mjs";



export default class NewRole extends PopupForm {

    /**
     * 
     * @param {object} param0 
     * @param {string} param0.request The id of the onboarding request
     */
    constructor({ request }) {

        super()

        super.form = [
            [
                {
                    label: `Role`,
                    customWidgetUrl: "/$/modernuser/static/widgets/user-n-role-input/widget.mjs",
                    name: 'role',
                    mode: 'role',
                    type: 'customWidget'
                }
            ],
            [
                {
                    label: 'Zone',
                    name: 'zone',
                    customWidgetUrl: "/$/modernuser/static/widgets/zone-input/widget.mjs",
                    type: 'customWidget'
                }
            ]
        ];

        this.positive = 'Grant',
            this.negative = 'Cancel'


        /** @type {string} */ this.request

        Object.assign(this, arguments[0])


        /** @type {function(("done"), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener

        super.addEventListener('complete', () => {
            muserRpc.modernuser.onboarding.addRoleToRequest(
                {
                    id: this.request,
                    role: this.value
                }
            ).then(() => {
                this.positiveButton.state = 'success'
                this.dispatchEvent(new CustomEvent('done'))
            }).catch((e) => {
                handle(e)
                this.positiveButton.state = 'initial'
            })
        })


    }


    /**
     * @returns {{
     *      role: string,
     *      zone: string
     * }}
     */
    get value() {
        return {
            role: this.formWidget.value.role.id,
            zone: this.formWidget.value.zone
        }
    }

}