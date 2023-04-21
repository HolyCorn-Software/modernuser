/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This is part of the roles-data-manager listings widget
 * This widget allows the user to edit the label of the role
*/

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs"
import { handle } from "/$/system/static/errors/error.mjs";
import PopupForm from "/$/system/static/html-hc/widgets/popup-form/form.mjs";


export default class RoleEditPopup extends PopupForm {

    /**
     * 
     * @param {object} param0
     * @param {object} param0.data
     * @param {{[key:string]: string}} param0.fields
     */
    constructor({ fields, data }) {

        let form_structure = []
        for (let field in fields) {
            form_structure.push(
                [
                    {
                        label: fields[field],
                        name: field,
                        type: field ==='description' ? 'textarea': 'text' //This is just a horrible hack.
                    }
                ]
            )
        }

        super({
            form: form_structure,
            positive: 'Save',
            negative: 'Go back'
        });

        Object.assign(this.formWidget.values, data)


        this.addEventListener('complete', () => {
            hcRpc.modernuser.role.data.update({ id: data.id, data: this.value }).then(() => {
                this.dispatchEvent(new CustomEvent(('update')))
                this.positiveButton.state = 'success';
                setTimeout(() => this.hide(), 1300);
            }).catch(e => {
                handle(e)
            })
        });

        /** @type {function(('update'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener

    }

}