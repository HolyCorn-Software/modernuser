/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The role-resolve widget
 * This sub-widget (requested-role) is used to denote (on the UI) a role asked for by the user
 */

import GenericRole from "../generic-role/item.mjs";
import muserRpc from "/$/modernuser/static/lib/rpc.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs"
import BrandedBinaryPopup from "/$/system/static/html-hc/widgets/branded-binary-popup/widget.mjs";


export default class RequestedRole extends GenericRole {


    /**
     * 
     * @param {import('../types.js').FrontendRoleData & {request: string}} data 
     */
    constructor(data) {
        super(data)


        /** @type {function(("grant"|"reject"), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener



        const grant_button = new ActionButton(
            {
                content: `Grant`,
                onclick: () => {

                    new TransactionPopup(
                        () => {


                            muserRpc.modernuser.role.role_play.addRoleToUser(
                                {
                                    subject: this.statedata.user.id,
                                    role: this.statedata.role.id,
                                    zone: this.statedata.zone.id,
                                }
                            ).then(() => {
                                muserRpc.modernuser.onboarding.removeRoleFromRequest({ id: this.statedata.request, role: { role: this.statedata.role.id, zone: this.statedata.zone.id } }).then(() => {
                                    setTimeout(() => this.html.remove(), 3000); //TODO: Smooth animation to remove this
                                    grant_button.state = 'success'
                                    this.dispatchEvent(new CustomEvent('grant'))
                                }).catch(e => {
                                    handle(e)
                                    grant_button.state = 'initial'
                                })
                            }).catch(e => {
                                handle(e)
                                grant_button.state = 'initial'
                            })

                        },
                        {
                            question: `Do you want to make ${this.statedata.user.label} ${this.statedata.role.label} in ${this.statedata.zone.label}`,
                            title: `Granting ${this.statedata.user.label} role of ${this.statedata.role.label}`
                        }
                    ).show()

                }
            }
        );

        const reject_button = new ActionButton(
            {
                content: `Reject`,
                onclick: () => {
                    new TransactionPopup(
                        () => {
                            reject_button.state = 'waiting'

                            muserRpc.modernuser.onboarding.removeRoleFromRequest({
                                id: this.statedata.request,
                                role: {
                                    role: this.statedata.role.id,
                                    zone: this.statedata.zone.id
                                }
                            }).then(() => {
                                setTimeout(() => this.html.remove(), 3000); //TODO: Smooth animation to remove
                                reject_button.state = 'success'
                                this.dispatchEvent(new CustomEvent('reject', { detail: { role: this.statedata.role.id, zone: this.statedata.zone.id } }))
                            }).catch(e => {
                                handle(e)
                                reject_button.state = 'initial'
                            })

                        },
                        {
                            question: `${this.statedata.user.label} will no longer have the change to be ${this.statedata.role.label} in ${this.statedata.zone.label}`,
                            title: `Removing ${this.statedata.user.label} from the role of ${this.statedata.role.label}`
                        }
                    ).show()
                }
            }
        );



        this.actions = [
            grant_button.html,
            reject_button.html
        ];

        /** @type {import("../types.js").StateData & {request: string}} */ this.statedata

    }

    /**
     * This method is called by the super-class when either the role or zone information has changed
     * @param {object} newdata 
     * @param {string} newdata.role
     * @param {string} newdata.zone
     * @returns {Promise<void>}
     */
    async updateData(newdata) {

        await muserRpc.modernuser.onboarding.addRoleToRequest(
            {
                id: this.statedata.request,
                role: {
                    role: newdata.role,
                    zone: newdata.zone
                }
            }
        )

        try {


            await muserRpc.modernuser.onboarding.removeRoleFromRequest(
                {
                    id: this.statedata.request,
                    role: {
                        role: this.statedata.role.id,
                        zone: this.statedata.zone.id
                    }
                }
            );

        } catch (e) {
            await muserRpc.modernuser.onboarding.removeRoleFromRequest(
                {
                    id: this.statedata.request,
                    role: {
                        role: newdata.role,
                        zone: newdata.zone
                    }
                }
            )

            throw e
        }

    }


}



class TransactionPopup extends BrandedBinaryPopup {

    /**
     * 
     * @param {function} fxn 
     */
    constructor(fxn, { question, title } = {}) {

        super({
            title: title || `No title`,
            question: question || `No question`,
            positive: 'Yes',
            negative: 'No',
            execute: async () => {
                await fxn()
            }
        });
    }
}