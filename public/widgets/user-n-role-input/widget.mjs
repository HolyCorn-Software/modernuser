/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This widget allows to search both user and roles.
 * It can operate in three(3) modes : 
 *      'users' -- search just users
 *      'roles' -- search just roles
 *      'dual' -- search both roles and users
 */

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs"
import ItemView from "./item-view.mjs";
import SearchInput from "/$/system/static/html-hc/widgets/search-input/widget.mjs";




export default class UserAndRoleInput extends SearchInput {

    /**
     * 
     * @param {object} param0 
     * @param {string} param0.name
     * @param {string} param0.label
     * @param {modernuser.permission.SubjectType|'dual'} param0.mode
     */
    constructor({ name, label, mode } = {}) {
        super({ name, label });

        this.html.classList.add('hc-cayofedpeople-user-n-role-input')

        this.hooks = {
            fetchItems: async (filter) => {
                // //Fetch users from the backend
                try {

                    const users = (this.mode === 'user' || this.mode === 'dual') ? await hcRpc.modernuser.profile.fetchUsers(filter) : []

                    const roles = (this.mode === 'role' || this.mode === 'dual') ? await hcRpc.modernuser.role.data.fetchRoles(filter) : []

                    return [
                        ...users.map(x => {
                            return {
                                id: x.id,
                                label: x.label,
                                icon: x.icon,
                                type: 'user',
                            }
                        }),
                        ...roles.map(x => {
                            return {
                                id: x.id,
                                label: x.label,
                                type: 'role'
                            }
                        })
                    ]
                } catch (e) {
                    if (/permission/.test(e)) {
                        return []
                    } else {
                        throw e
                    }
                }

            },
            /** @param {{label:string, type:modernuser.permission.SubjectType, id: string}} item */
            getLabel: (item) => item?.label || 'No name',

            getValue: (item) => item,
            getView: (item) => {
                return new ItemView(item).html
            }
        }

        if (typeof mode !== 'undefined') {
            this.mode = mode
        }

    }

    /**
     * @param {'dual'|modernuser.permission.SubjectType} mode
     */
    set mode(mode) {
        if (this.mode !== mode) {
            this.setValue(undefined)
            this.invalidateCache()
        }
        this[mode_symbol] = mode
    }

    /**
     * @returns {'dual'|modernuser.permission.SubjectType}
     */
    get mode() {
        return this[mode_symbol]
    }

    /**
     * @returns {{
     *  id: string,
     *  type: modernuser.permission.SubjectType,
     *  label: string
     * }}
     */
    get value() {
        return super.value
    }


    static get classList() {
        return ['hc-cayofedpeople-user-n-role-input']
    }

}


const mode_symbol = Symbol(`UserAndRoleInput.prototype.mode`)