/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This widget allows that the expiry date of a permission be edited
 */

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs"
import { handle } from "/$/system/static/errors/error.mjs";
import PopupForm from "/$/system/static/html-hc/widgets/popup-form/form.mjs";


export default class ExpiresEditPopup extends PopupForm {

    constructor({ label, subject, permission, expires }) {
        super({
            title: `Editing ${label}`,
            caption: `Changing the expiry date`,
            positive: `Change`,
            negative: `Go back`,
            form: [
                [
                    {
                        type: 'date',
                        label: `New Date`,
                        name: 'expiry_date',
                        htmlDirect:{
                            valueAsNumber: expires
                        }
                    }
                ]
            ]
        });

        console.log(`expires is `, expires)


        /** @type {function(('update'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener

        this.addEventListener('complete', async () => {
            this.loadBlock()
            try {

                await hcRpc.modernuser.permissions.grants.update({ subject, permission, data: { ...this.value } })
                this.positiveButton.state = 'success'

                this.dispatchEvent(new CustomEvent('update'))
                
                setTimeout(() => this.hide(), 1200);
            } catch (e) {
                handle(e)
            }
            this.loadUnblock();
        })

    }

    get value() {
        return {
            expires: new Date(super.value.expiry_date).valueOf()
        }
    }

}