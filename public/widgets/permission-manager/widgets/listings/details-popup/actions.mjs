/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * 
 * This widget represents a single item (single permission) in the permission listings details widget
 */

import ZoneInput from "/$/modernuser/zonation/static/widgets/zone-input/widget.mjs";
import ExpiresEditPopup from "./expires-edit-popup.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs"
import { handle } from "/$/system/static/errors/error.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs"
import BrandedBinaryPopup from "/$/system/static/html-hc/widgets/branded-binary-popup/widget.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import AlarmObject from "/$/system/static/html-hc/lib/alarm/alarm.mjs"
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";
import DualSwitch from "/$/system/static/html-hc/widgets/dual-switch/switch.mjs";
import { fetchZones } from "/$/modernuser/zonation/static/widgets/zonation-manager/util.mjs";


export default class PermissionActions extends Widget {

    /**
     * 
     * @param {object} param0
     * @param {import("../types.js").FrontendPermissionSubjectData} param0.subject
     * @param {modernuser.permission.PermissionGrant} param0.data 
     */
    constructor({ subject, data } = {}) {
        super();

        this.html = hc.spawn({
            classes: ['hc-cayofedpeople-permission-actions'],
            innerHTML: `
                <div class='container'>
                    <div class='time_label labeled_property'>
                        <div class='label'>Granted since</div>
                        <div class='value'></div>
                    </div>

                    <div class='expires_label labeled_property'>
                        <div class='label'>Expires on</div>
                        <div class='value'></div>
                    </div>

                    <div class='zone_label labeled_property'>
                        <div class='label labeled_property'>Restricted to</div>
                        <div class='value'></div>
                    </div>

                    <div class='main'>
                        <div class='switch-actions'></div>
                        <div class='button-actions'></div>
                    </div>
                </div>
            `
        });




        //First things first, we deal with the storage of data

        /** @type {modernuser.permission.PermissionGrant, subject:import("../types.js").FrontendPermissionSubjectData}>} */ this.data
        const data_store = new AlarmObject();

        Reflect.defineProperty(this, 'data', {
            get: () => data_store,
            set: (values) => {
                Object.assign(this.data, values)
            },
            configurable: true,
            enumerable: true
        });

        this.data.data = {}





        // -------------------- This is about the details of the time_label (A label that shows when a permission was granted) -----------/
        //When the details of the time (when the permission was granted) is updated, update the UI too

        /** @type {string} */ this.time_label
        this.htmlProperty('.container >.time_label >.value', 'time_label', 'innerHTML')

        this.data.$0.addEventListener('data.time-change', () => {
            this.time_label = new Date(this.data.data.time).toDateString()
        })




        // ----------------  This section is about the expiry date label   ------------------------

        /** @type {string} */ this.expires_label
        this.htmlProperty('.container >.expires_label >.value', 'expires_label', 'innerHTML', (v) => {

            //Here, we are working on the logic of changing the expiry date
            if (/never/i.test(v)) {
                this.html.$('.expires_label >.value').removeEventListener('click', on_expires_label_click)
                this.html.classList.remove('can-expire')
                return;
            }

            this.html.classList.add('can-expire')
            this.html.$('.expires_label >.value').addEventListener('click', on_expires_label_click)
        })


        //Now this is what happens when the expiry date is clicked, we spawn a UI to help us edit that

        const on_expires_label_click = () => {
            let popup = new ExpiresEditPopup({
                label: this.data.data.label,
                subject: this.data.subject.id,
                permission: this.data.data.name,
                expires: this.data.data.expires,
            })

            popup.show()
            popup.addEventListener('update', () => {
                this.data.data.expires = popup.value.expires
            })
        }


        this.data.$0.addEventListener('data.expires-change', () => {
            if (this.data.subject.type === 'user') {
                this.expires_label = new Date(this.data.data.expires).toDateString()
            }
        })









        let can_use = new DualSwitch({
            label: 'Can Use',
            positive: 'Yes',
            negative: 'No'
        });

        let can_issue = new DualSwitch({
            label: `Can issue`,
            positive: 'Yes',
            negative: 'No'
        });


        let is_zoned = new DualSwitch({
            label: `Restricted`,
            positive: `Yes`,
            negative: `No`
        });

        this.data.$0.addEventListener('subject.type-change', () => {
            is_zoned.silent_value = is_zoned.disabled = this.data.subject.type === 'role'

            if (this.data.subject.type === 'role') {
                this.expires_label = 'Never'
            }
        })



        //Just add the switches that control freedom, and make sure when they are changed, we update at the backend

        for (let [widget, field] of [[can_use, 'use'], [can_issue, 'grant']]) {
            this.html.$('.main >.switch-actions').appendChild(widget.html)

            //This is what happens when the user slides a switch either for can_use or can_issue
            widget.addEventListener('change', async () => {
                widget.waiting = true
                try {
                    await hcRpc.modernuser.permissions.grants.update({ subject: this.data.subject.id, permission: this.data.data.name, data: { freedom: { [field]: widget.value } } })
                } catch (e) {
                    handle(e)
                    widget.silent_value = !widget.value
                }
                widget.waiting = false;
            })
        }

        //For now, just addd the switch that controls the zone
        this.html.$('.main >.switch-actions').appendChild(is_zoned.html)


        let revoke_btn = new ActionButton({
            content: `Revoke`,
            onclick: async () => {

                new BrandedBinaryPopup({
                    title: `Revoking permission`,
                    question: `${this.data.subject.label} will no longer have the permission ${this.data.data.label}. Are you fine with this decision ?`,
                    execute: () => this.revoke()
                }).show()

            }
        })

        for (let action of [revoke_btn]) {
            this.html.$('.main >.button-actions').appendChild(action.html)
        }

        /** @type {{use:boolean, grant:boolean}} */ this.freedom
        Reflect.defineProperty(this, 'freedom', {
            set: (freedom) => {

                if (typeof freedom?.use !== 'undefined') {
                    can_use.silent_value = freedom.use
                }

                if (typeof freedom?.grant !== 'undefined') {
                    can_issue.silent_value = freedom.grant
                }

            },
            get: () => ({ use: can_use.value, issue: can_issue.value }),
            configurable: true,
            enumerable: true
        })

        this.data.$0.addEventListener(`data.freedom-change`, () => {
            this['freedom'] = this.data.data.freedom
        })



        this.data.$0.addEventListener('data.zone-change', () => {
            if (this.data.data.zone?.id) {
                is_zoned.silent_value = true
                this.zone_label = this.data.data.zone.label
            } else {
                this.zone_label = `Everywhere`
            }

            if (this.data.subject.type === 'role') {
                this.zone_label = `Variable`
            }
        })



        //The following section deals with how the user can manipulate zone information


        /** @type {string} */ this.zone_label
        this.htmlProperty('.container >.zone_label >.value', 'zone_label', 'innerHTML', (v) => {


            if (typeof this.data.data.zone?.id !== 'string') {
                this.html.$('.zone_label >.value').removeEventListener('click', zone_label_onclick)
                this.html.classList.remove('is-zoned')
                return;
            }

            this.html.classList.add('is-zoned')
            this.html.$('.zone_label >.value').addEventListener('click', zone_label_onclick)
        })


        //When the zone_label is clicked, we spawn a popup for the user to select the zone, and then we update the zone information

        const zone_label_onclick = async () => {
            let zone_input = new ZoneInput()
            //TODO: Restrict the zones by permission

            zone_input.show();

            zone_input.addEventListener('change', async () => {
                try {
                    await this.updateZone(zone_input.value)
                } catch (e) {
                    handle(e)
                }
            })

        }


        //When the is_zoned switch changes, we could either set the zone to null (unrestricted) or we ask the user input the new zone

        is_zoned.addEventListener('change', async () => {
            is_zoned.waiting = true;

            let zone = null;

            try {

                if (is_zoned.value) {
                    const none = Symbol('no value selected')
                    zone = await new Promise((resolve, reject) => {
                        //TODO: Restrict the zone to what the user has access to
                        let zone_input = new ZoneInput({ modal: true })
                        zone_input.show()
                        zone_input.addEventListener('change', () => {
                            resolve(zone_input.value)
                        })
                        zone_input.addEventListener('dismiss-popup', () => {
                            resolve(none)
                        })
                    })
                    if (zone === none) {
                        is_zoned.silent_value = !is_zoned.value
                        return is_zoned.waiting = false;
                    }

                } else {
                    //Not setting any thing to zone will wipe out the value of zone
                }

                await this.updateZone(zone)

            } catch (e) {
                handle(e)
            }

            is_zoned.waiting = false;
        })


        /** @type {function(('revoke'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener


        Object.assign(this.data, arguments[0]);

    }

    async updateZone(id) {

        await hcRpc.modernuser.permissions.grants.update({ subject: this.data.subject.id, permission: this.data.data.name, data: { zone: id } })

        if (typeof id === 'string') {
            let zone_label = (await fetchZones()).find(x => x.id === id).label
            this.data.data.zone = {
                id: id,
                label: zone_label
            }
        } else {
            this.data.data.zone = {
                id: null
            }
        }
    }

    async revoke() {
        await hcRpc.modernuser.permissions.grants.revokePermission({ subject: this.data.subject.id, zone: this.data.data.zone.id, permission: this.data.data.name })
        this.dispatchEvent(new CustomEvent('revoke'))
    }

}