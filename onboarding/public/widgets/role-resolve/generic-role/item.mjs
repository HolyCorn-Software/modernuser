/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This widget represents a single role in the role-resolve widget. It could be the representation of a role requested or a role granted
 */

import InfoWidget from "./info.mjs";
import RoleSelectPopup from "./role-select-popup.mjs";
import ZoneInput from "/$/modernuser/static/widgets/zone-input/widget.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs"
import BrandedBinaryPopup from "/$/system/static/html-hc/widgets/branded-binary-popup/widget.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import AlarmObject from "/$/system/static/html-hc/lib/alarm/alarm.mjs"
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class GenericRole extends Widget {

    /**
     * 
     * @param {import("../types.js").FrontendRoleData} data 
     */
    constructor(data) {
        super();

        this.html = hc.spawn(
            {
                classes: ['hc-cayofedpeople-role-resolve-generic-role'],
                innerHTML: `
                    <div class='container'>
                        <div class='data-section'>
                            <div class='role-info'></div>
                            <div class='zone-info'></div>
                        </div>

                        <div class='actions'></div>
                        
                    </div>
                `
            }
        );


        /** @type {[HTMLElement]} */ this.actions
        this.pluralWidgetProperty(
            {
                selector: `.${ActionButton.classList.join('.')}`,
                parentSelector: '.container >.actions',
                childType: 'html',
                property: 'actions',
            }
        );

        this.actions = [
            new ActionButton({
                content: 'Test Action1'
            }).html
        ]

        /** @type {import("/$/system/static/lib/hc/lib/util/alarm-types.js").AlarmObject<import("../types.js").FrontendRoleData>} */
        this.statedata = new AlarmObject()


        /** @type {{id: string, label: string}} */ this.role_info
        this.widgetProperty(
            {
                selector: `.hc-cayofedpeople-role-resolve-info`,
                parentSelector: '.container >.data-section >.role-info',
                property: 'role_info',
                transforms: {
                    /**
                     * 
                     * @param {{label: string, id: string}} data 
                     */
                    set: (data1) => {
                        return new InfoWidget({
                            content: data1.label,
                            onclick: () => {
                                const popup = new RoleSelectPopup(data)
                                popup.show()
                                popup.addEventListener('complete', async () => {
                                    if (!popup.value.id || popup.value.id.length < 3) {
                                        return handle(new Error(`Please actually select a role. Type to search, but make sure you click to select`))
                                    }
                                    popup.positiveButton.state = 'waiting'
                                    try {
                                        await this.updateData({
                                            role: popup.value.id,
                                            zone: this.statedata.zone.id
                                        })
                                        this.statedata.role = popup.value
                                        popup.positiveButton.state = 'success'
                                        setTimeout(() => popup.hide(), 1000)
                                        
                                    } catch (e) {
                                        popup.positiveButton.state = 'initial'
                                        handle(e)
                                    }

                                })
                            }
                        }).html
                    }
                }
            }
        );



        /** @type {{label:string, id: string}} */ this.zone_info
        this.widgetProperty(
            {
                selector: `.hc-cayofedpeople-role-resolve-info`,
                parentSelector: '.container >.data-section >.zone-info',
                property: 'zone_info',
                transforms: {
                    /**
                     * 
                     * @param {{label: string, id: string}} data 
                     */
                    set: (data) => {
                        return new InfoWidget({
                            content: data.label,
                            onclick: () => {
                                const input = new ZoneInput()
                                input.addEventListener('change', () => {

                                    new BrandedBinaryPopup(
                                        {
                                            title: `Are you sure ?`,
                                            question: `Are you sure you'll like to make ${this.statedata.user.label} ${this.statedata.role.label} in ${input.valueLabel}, instead of ${this.statedata.zone.label} ?`,
                                            execute: async () => {
                                                await this.updateData({
                                                    zone: input.value,
                                                    role: this.statedata.role.id
                                                })

                                                this.statedata.zone = {
                                                    id: input.value,
                                                    label: input.valueLabel
                                                }
                                            }
                                        }
                                    ).show()

                                });

                                input.show()
                            }
                        }).html
                    },
                    get: (html) => {
                        return {
                            content: html?.widgetObject.content,
                            onclick: html?.widgetObject.onclick
                        }
                    }
                }
            }
        )


        this.statedata.$0.addEventListener('role-change', () => {
            this.role_info = this.statedata.role
        })

        this.statedata.$0.addEventListener('zone-change', () => {
            this.zone_info = this.statedata.zone
        });

        Object.assign(this.statedata, data)


    }

    /**
     * This method should be overridden to provide a method to update zonation or role data
     * @param {{role:string, zone: string}} newdata 
     * @returns {Promise<void>}
     */
    async updateData(newdata) {
        throw new Error(`Sorry, Engineering fault.\nDear user, it is not your fault.\nA sub-class of the GenericRole class did not implement the updateData() method`)
    }

}