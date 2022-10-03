/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This widget is part of the permission-manager listings widget and shows the details of a user's permissions
 */

import PermissionsDetailsMainWidget from "./main.mjs";
import { hc } from "/$/system/static/lib/hc/lib/index.js";
import { AlarmObject } from "/$/system/static/lib/hc/lib/util/alarm.js";
import { Widget } from "/$/system/static/lib/hc/lib/widget.js";


export default class PermissionsDetails extends Widget {

    /**
     * 
     * @param {import("../types.js").FrontendUserPermissions} data 
     */
    constructor(data) {

        super();

        this.html = hc.spawn({
            classes: ['hc-cayofedpeople-permission-details'],
            innerHTML: `
                <div class='container'>
                    <div class='header'>
                        <div class='label'>Managing Permissions for</div> <div class='user-label'>Awosi</div>
                    </div>

                    <div class='content'>
                        <!-- The details of the permissions go here -->
                    </div>
                    
                </div>
            `
        });


        /** @type {PermissionsDetailsMainWidget} */ this.main
        this.widgetProperty({
            selector: '.hc-cayofedpeople-permission-details-main',
            parentSelector: '.container >.content',
            property: 'main',
            childType: 'widget'
        });
        this.main = new PermissionsDetailsMainWidget()

        /** @type {function(('revoke'), function(CustomEvent<string>), AddEventListenerOptions)} */ this.addEventListener

        this.main.addEventListener('revoke', (event) => {
            this.dispatchEvent(new CustomEvent('revoke', { detail: event.detail }))
        })



        /** @type {string} */ this.user_label
        this.htmlProperty('.container >.header >.user-label', 'user_label', 'innerHTML')


        /** @type {import("../types.js").UserPermissionsStatedata} */ this.data
        const data_store = new AlarmObject();

        Reflect.defineProperty(this, 'data', {
            get: () => data_store,
            set: (values) => {
                Object.assign(this.data, values)
            },
            configurable: true,
            enumerable: true
        });

        this.data.$0.addEventListener(`subject-change`, () => {
            this.user_label = this.data.subject.label

            this.main.subject = this.data.subject
        })

        this.data.$0.addEventListener('permissions-$array-item-change', () => {
            this.main.items = [...this.data.permissions]
        })

        this.data.$0.addEventListener('permissions-change', () => {
            this.main.items = [...this.data.permissions]
        })


        Object.assign(this.data, data);






    }

}