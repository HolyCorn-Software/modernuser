/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This widget allows the new user to set his highest role (during the onboarding process)
 */

import MultiRolePlayInput from "/$/modernuser/role/static/widgets/multi-roleplay-input/widget.mjs";
import UserAndRoleInput from "/$/modernuser/static/widgets/user-n-role-input/widget.mjs";
import LabelList from "/$/system/static/lib/hc/label-list/widget.mjs";
import { hc } from "/$/system/static/lib/hc/lib/index.js";
import { Widget } from "/$/system/static/lib/hc/lib/widget.js";


export default class RoleSelectScreen extends Widget {

    constructor() {
        super();


        this.html = hc.spawn({
            classes: ['hc-cayofedpeople-onboarding-role-select'],
            innerHTML: `
                <div class='container'>
                    <div class='title'>Select the roles you play</div>
                    <div class='label-list'></div>
                    <div class='zone-input'></div>
                </div>
            `
        })

        /** @type {UserAndRoleInput} */ this.role_input
        this.widgetProperty(
            {
                selector: '.' + UserAndRoleInput.classList.join('.'),
                parentSelector: '.container >.role-select',
                property: 'role_input',
                childType: 'widget'
            }
        )
        

        /** @type {MultiRolePlayInput} */ this.roleInput
        this.widgetProperty(
            {
                selector: ['', ...LabelList.classList].join('.'),
                parentSelector: '.container >.label-list',
                childType: 'widget',
                property: 'roleInput'
            }
        );

        this.roleInput = new MultiRolePlayInput()
        

    }
    get value() { //TODO: Deal with multiple roles
        return this.roleInput.value
    }

    isComplete() {
        

        return true;
    }

}