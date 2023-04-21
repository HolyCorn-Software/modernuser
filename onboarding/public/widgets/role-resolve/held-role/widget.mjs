/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The role-resolve widget
 * This sub-widget (granted-roles) represents a role granted to the user
 * 
 * 
 */

import GenericRole from "../generic-role/item.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs"
import { handle } from "/$/system/static/errors/error.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs"
import BrandedBinaryPopup from "/$/system/static/html-hc/widgets/branded-binary-popup/widget.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


hc.importModuleCSS()

export default class HeldRole extends GenericRole {

    /**
     * 
     * @param {import("../types.js").FrontendRoleData} data 
     */
    constructor(data) {
        super(data)

        this.html.classList.add('hc-cayofedpeople-role-resolve-held-role')



        /** @type {function(("revoke"), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener

        this.actions = [
            new ActionButton(
                {
                    content: `Revoke`,
                    onclick: () => {
                        let yes_no_popup = new BrandedBinaryPopup({
                            title: `Removing the role`,
                            question: `${this.statedata.user.label} will no longer be ${this.statedata.role.label} in ${this.statedata.zone.label}. Is that okay?`,
                            positive: 'Yes',
                            negative: 'No',
                            execute: async () => {
                                await hcRpc.modernuser.role.role_play.removeRoleFromUser(
                                    {
                                        subject: this.statedata.user.id,
                                        role: this.statedata.role.id,
                                        zone: this.statedata.zone.id
                                    }
                                )

                                this.html.remove(); //TODO: Smooth animation to remove the HTML

                                this.dispatchEvent(new CustomEvent('revoke', { detail: { role: this.statedata.role.id, zone: this.statedata.zone.id } }))
                            }
                        });

                        yes_no_popup.show()
                    }
                }
            ).html
        ]
    }

    /**
     * This method is called by the super-class when either the role or zone information has changed
     * @param {object} newdata 
     * @param {string} newdata.role
     * @param {string} newdata.zone
     * @returns {Promise<void>}
     */
    async updateData(newdata) {

        let granted_new = false;

        try {


            await hcRpc.modernuser.role.role_play.addRoleToUser(
                {
                    subject: this.statedata.user.id,
                    role: newdata.role,
                    zone: newdata.zone,
                }
            );

            granted_new = true;


            await hcRpc.modernuser.role.role_play.removeRoleFromUser(
                {
                    subject: this.statedata.user.id,
                    role: this.statedata.role.id,
                    zone: this.statedata.zone.id
                }
            )

        } catch (e) {
            if (granted_new) {
                await hcRpc.modernuser.role.role_play.removeRoleFromUser(
                    {
                        subject: this.statedata.user.id,
                        role: newdata.role,
                        zone: newdata.zone,
                    }
                )

            }

            throw e
        }



    }

}