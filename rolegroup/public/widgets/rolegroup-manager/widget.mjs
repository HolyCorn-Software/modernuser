/**
 * Copyright 2023 HolyCorn Software
 * The Modern Faculty of Users
 * This widget (rolegroup-manager), allows an authorized personnel to manage rolegroups
 */

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs";
import GenericListings from "/$/system/static/html-hc/widgets/generic-listings/widget.mjs";
import PopupForm from "/$/system/static/html-hc/widgets/popup-form/form.mjs";



/**
 * @extends GenericListings<modernuser.rolegroup.RoleGroupData>
 */
export default class RoleGroupManager extends GenericListings {

    constructor() {
        super(
            {
                title: `Role Groups`
            }
        );

        this.actions = [
            new ActionButton(
                {
                    content: `New Group`,
                    onclick: async () => {

                        const popup = new PopupForm(
                            {
                                title: `New Group`,
                                caption: `Enter information for the new group`,
                                positive: `Create`,
                                negative: `Go back`,
                                form: [

                                    [
                                        {
                                            name: 'label',
                                            label: 'Name',
                                            type: 'text'
                                        }
                                    ],
                                    [
                                        {
                                            name: 'description',
                                            label: 'Description',
                                            type: 'textarea'
                                        }
                                    ],
                                    // [
                                    //     {
                                    //         name: 'rolegroups',
                                    //         label: 'rolegroups',
                                    //         type: 'customWidget',
                                    //         is_multi_select: true,
                                    //         // customWidgetUrl: '/$/system/static/html-hc/widgets/label-list/widget.mjs'
                                    //         customWidgetUrl: "/$/modernuser/static/widgets/user-n-role-input/widget.mjs",
                                    //         mode: "role"
                                    //     }
                                    // ],
                                    [
                                        {
                                            name: 'roles',
                                            label: 'Roles',
                                            type: 'customWidget',
                                            customWidgetUrl: `/$/modernuser/static/widgets/user-n-role-input/widget.mjs`,
                                            is_multi_select: true,
                                            mode: "role"
                                        }
                                    ]
                                ],
                                execute: async () => {
                                    /** @type {modernuser.rolegroup.RoleGroupInit} */
                                    const value = {
                                        ...popup.value,
                                        roles: popup.value.roles.map(x => x.id)
                                    }
                                    const id = await hcRpc.modernuser.rolegroup.create(value)
                                    this.statedata.content.push(
                                        {
                                            id,
                                            ...value
                                        }
                                    )
                                }
                            },

                        );

                        popup.show()
                    }
                }
            ),
            new ActionButton(
                {
                    content: `Delete Roles`,
                    state: 'disabled'
                }
            )
        ];

        this.statedata.headers = [
            {
                label: `ID`
            },
            {
                label: `Name`
            },
            {
                label: `Description`
            },
            {
                label: `Roles`
            }
        ];


        let rolesPromise

        /**
         * This method gets all roles
         * @returns {Promise<modernuser.role.data.Role[]>}
         */
        function getRoles() {
            async function main() {
                return await hcRpc.modernuser.role.data.fetchRoles()
            }
            if (rolesPromise) {
                return rolesPromise.catch(() => main())
            }
            return (rolesPromise = main())
        }


        this.statedata.contentMiddleware = [
            {
                name: 'rolegroup_default',
                set: (input) => {

                    const rolesInfo = hc.spawn(
                        {
                            innerHTML: `...`
                        }
                    );

                    getRoles().then((ret) => {
                        console.log(`roles `, ret)
                        rolesInfo.innerHTML =
                            (input.roles || []).map(x => ret.find(r => r.id === x)?.label || `id:${x}`)
                                .map((x, i, a) => a.length > 1 && i == a.length - 1 ? `and ${x}` : x)
                                .join(', ')
                    })

                    return {
                        columns: [
                            {
                                content: hc.spawn(
                                    {
                                        innerHTML: input.id,
                                    }
                                ),
                                metadata: input
                            },
                            {
                                content: hc.spawn({
                                    innerHTML: input.label
                                })
                            },
                            {
                                content: hc.spawn({
                                    innerHTML: input.description
                                })
                            },
                            {
                                content: rolesInfo,
                                style: {
                                    highlightable: true
                                }
                            }
                        ]
                    }
                },
                get: (data) => data.columns[0].metadata
            }
        ];

        this.statedata.content = []

        this.waitTillDOMAttached().then(() => this.load())


    }

    async load() {
        this.statedata.content = (await hcRpc.modernuser.rolegroup.getAll())
        // .map(
        //     x => {
        //         const res = []
        //         for (let i = 0; i < 256; i++) {
        //             res.push(x)
        //         }
        //         return res
        //     }
        // ).flat() // This code duplicates the entries several times. This is used to test the UI
    }

}