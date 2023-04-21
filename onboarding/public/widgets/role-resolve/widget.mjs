/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This widget is used by an admin user to grant roles to someone who requested them
 */

import RequestedRole from "./requested-role/item.mjs";
import NewRole from "./new/widget.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs"
import { handle } from "/$/system/static/errors/error.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs"
import Spinner from "/$/system/static/html-hc/widgets/infinite-spinner/widget.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import AlarmObject from "/$/system/static/html-hc/lib/alarm/alarm.mjs"
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";
import HeldRole from "./held-role/widget.mjs";
import DelayedAction from "/$/system/static/html-hc/lib/util/delayed-action/action.mjs";


export default class RoleResolve extends Widget {


    constructor() {
        super()

        this.html = hc.spawn(
            {
                classes: ['hc-cayofedpeople-role-resolve'],
                innerHTML: `
                    <div class='container'>
                        <div class='profile'>
                            <div class='image'><img></div>
                            <div class='text'>
                                <div class='names'></div>
                                <div class='more-info'></div>
                            </div>
                        </div>


                        <div class='main-section'>

                            <div class='requested-roles'>
                                <div class='title'>Requested Roles</div>

                                <div class='content'>
                                    <!-- The actual information of the roles to be added go here -->
                                </div>
                                    


                            </div>



                            <div class='held-roles'>
                                <div class='title'>Granted Roles</div>
                                <div class='content'></div>
                                <div class='add-more'></div>

                                <div class='actions'>
                                    <!-- Buttons like 'Apply' appear hear -->
                                </div>

                            </div>
                            
                        </div>
                        
                    </div>
                `
            }
        );

        /** @type {import('./types.js').StateData} */ this.statedata
        this.statedata = new AlarmObject()

        /** @type {string} */ this.profile_names
        this.htmlProperty('.container >.profile >.text >.names', 'profile_names', 'innerHTML')

        /** @type {string} */ this.profile_icon
        this.htmlProperty('.container >.profile >.image >img', 'profile_icon', 'attribute', undefined, 'src')

        this.statedata.$0.addEventListener('user.label-change', () => {
            this.profile_names = this.statedata.user.label
        })

        this.statedata.$0.addEventListener('user.icon-change', () => {
            this.profile_icon = this.statedata.user.icon
            console.log(`Profile icon changed`)
        })


        /** @type {{role: string, zone: string, readonly: string}[]} */ this.request_data
        /** @type {{role: string, zone: string, readonly: string}[]} */ this.held_roles


        for (let entry of
            [
                { selector: '.requested-roles >.content', widget_property: 'request_data', statedata_property: 'roles', class: RequestedRole },
                { selector: '.held-roles >.content', widget_property: 'held_roles', statedata_property: 'user.held_roles', class: HeldRole }
            ]
        ) {

            this.pluralWidgetProperty(
                {
                    selector: '*',
                    parentSelector: `.container >.main-section >${entry.selector}`,
                    property: entry.widget_property,
                    immediate: true,
                    transforms: {
                        /**
                         * 
                         * @param {{role: string, zone: string, readonly: string}} data 
                         */
                        set: (data) => {
                            const placeholder_html = hc.spawn({})

                            const spinner = new Spinner()
                            spinner.start()
                            spinner.attach(placeholder_html)

                            this.ready().then(() => {

                                const widget = new entry.class({
                                    role: {
                                        id: data.role,
                                        label: this.statedata.role_data.find(x => x.id === data.role)?.label || `Role not found ! ${data.role}`
                                    },
                                    zone: {
                                        id: data.zone,
                                        label: this.statedata.zonation_data.find(x => x.id === data.zone)?.label || 'Zone not found !'
                                    },
                                    readonly: data.readonly,
                                    user: this.statedata.user,
                                    request: this.statedata.id
                                });

                                widget.addEventListener('grant', () => {
                                    this.statedata.user.held_roles.push(
                                        {
                                            role: widget.statedata.role.id,
                                            zone: widget.statedata.zone.id,
                                            readonly: false,
                                        }
                                    )

                                })


                                widget.addEventListener('reject', () => {

                                    this.statedata.roles = this.statedata.roles.filter(role => {
                                        return (role.role != widget.statedata.role.id) || (role.zone != widget.statedata.zone.id)
                                    })
                                })


                                widget.addEventListener('revoke', () => {

                                    this.statedata.user.held_roles = this.statedata.user.held_roles.filter(role => {
                                        return (role.role != widget.statedata.role.id) || (role.zone != widget.statedata.zone.id)
                                    })

                                })

                                spinner.detach()
                                spinner.stop()
                                placeholder_html.replaceWith(widget.html)
                            })

                            placeholder_html.raw_data = data

                            return placeholder_html
                        },
                        get: (html) => {
                            return html?.raw_data
                        }
                    }
                }
            );

            const change_fxn = new DelayedAction(() => {
                this[entry.widget_property] = eval(`this.statedata.${entry.statedata_property}`)
            }, 50)



            this.statedata.$0.addEventListener(`${entry.statedata_property}-change`, change_fxn)
            this.statedata.$0.addEventListener(`${entry.statedata_property}-$array-item-change`, change_fxn)


        }




        this.waitTillDOMAttached().then(() => {
            this.init().then(() => {
                this.__init_done__ = true
            }).catch(e => handle(e))
        });


        /** @type {HTMLElement[]} */ this.actions
        this.pluralWidgetProperty(
            {
                selector: '*',
                parentSelector: '.container >.main-section >.held-roles >.actions',
                childType: 'html',
                property: 'actions',
            }
        );

        this.actions.push(
            new ActionButton(
                {
                    content: 'Add More',
                    onclick: () => {
                        const popup = new NewRole({
                            request: this.statedata.id
                        })
                        popup.show();

                        popup.addEventListener('done', () => {
                            this.statedata.roles.push(
                                {
                                    role: popup.value.role,
                                    zone: popup.value.zone
                                }
                            )
                        })
                    }
                }
            ).html
        )



    }

    async ready() {
        return new Promise((resolve, reject) => {
            if (this.__init_done__) {
                return resolve();
            }

            let interval = setInterval(() => {
                if (this.__init_done__) {
                    resolve()
                    clearInterval(interval)
                }
            }, 100)
        })
    }

    async init() {
        this.statedata.role_data = await hcRpc.modernuser.role.data.getAll()
        this.statedata.zonation_data = await hcRpc.modernuser.zonation.getZones()
    }

    /**
     * This loads all the data needed for the widget using the request id
     * @param {string} id 
     * @returns {Promise<void>}
     */
    async loadDataByRequestId(id) {
        this.loadBlock()

        try {
            const req = await hcRpc.modernuser.onboarding.getRequest({ id })
            this.statedata.roles = req.roles
            this.statedata.user = req.user
            this.statedata.id = req.id
        } catch (e) {
            handle(e)
        }
        this.loadUnblock()
    }

}