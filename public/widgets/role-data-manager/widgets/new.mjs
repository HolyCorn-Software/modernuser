/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System.
 * This widget is the popup that allows a user to create a new role
 */

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs"
import { handle } from "/$/system/static/errors/error.mjs";
import PopupForm from "/$/system/static/html-hc/widgets/popup-form/form.mjs";


/**
 * @extends PopupForm<modernuser.role.data.RoleInitData>
 */
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
                ],
                [
                    {
                        label: 'Icon',
                        name: 'icon',
                        type: 'uniqueFileUpload',
                        url: '/$/uniqueFileUpload/upload'
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

        /** @type {function(('create'), function(CustomEvent<modernuser.role.data.RoleInitData>), AddEventListenerOptions)} */ this.addEventListener
    }

    async do_creation() {
        return await hcRpc.modernuser.role.data.create({ ...this.value })
    }

}