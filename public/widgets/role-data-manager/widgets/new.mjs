/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System.
 * This widget is the popup that allows a user to create a new role
 */

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs"
import { handle } from "/$/system/static/errors/error.mjs";
import PopupForm from "/$/system/static/html-hc/widgets/popup-form/form.mjs";


export default class NewRolePopup extends PopupForm {


    constructor() {
        super({
            form: [
                [
                    {
                        label: 'Name',
                        name: 'label'
                    }
                ],
                [
                    {
                        label: `Description`,
                        name: 'description'
                    }
                ]
            ],
            caption: `Enter the name of the new role`,
            title: `Creating a new role`,
            negative: `Go back`,
            positive: `Create`
        });

        this.addEventListener('complete', async () => {
            this.positiveButton.state = 'waiting'
            this.do_creation().then((id) => {
                this.positiveButton.state = 'success'

                this.dispatchEvent(new CustomEvent('create', {
                    detail: {
                        id: id,
                        ...this.formWidget.value
                    }
                }));

                setTimeout(() => this.hide(), 1500);
            }).catch((d) => {
                this.positiveButton.state = 'initial'
                handle(d)
            })
        });

        /** @type {function(('create'), function(CustomEvent<{id: string, label: string, description: string}>), AddEventListenerOptions)} */ this.addEventListener
    }

    async do_creation() {
        return await hcRpc.modernuser.role.data.create({ label: this.value.label, description: this.value.description })
    }

}