/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This popup allows the user to select a different role
 */

import PopupForm from "/$/system/static/html-hc/widgets/popup-form/form.mjs";


export default class RoleSelectPopup extends PopupForm {

    /**
     * 
     * @param {import('../types.js').FrontendRoleData} data 
     */
    constructor(data) {
        super({
            title: `Select Role`,
            caption: `Select another role for ${data.user.label}`,
            form: [
                [
                    {
                        label: `Role`,
                        type: 'customWidget',
                        customWidgetUrl: "/$/modernuser/static/widgets/user-n-role-input/widget.mjs",
                        name: 'role',
                        mode: 'role'
                    }
                ]
            ],
            positive: 'Change',
            negative: 'Go back'
        });


    }
    get value(){
        return {
            id: super.value.role.id,
            label: super.value.role.label
        }
    }

}