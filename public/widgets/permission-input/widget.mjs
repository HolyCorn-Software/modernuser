/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System.
 * This widget allows one to search and select a user
 */

import userRpc from "../../lib/rpc.mjs";
import PermissionInputView from "./permission-view.mjs";
import { SearchInput } from "/$/system/static/lib/hc/search-input/widget.mjs";


export default class PermissionInput extends SearchInput {

    constructor({ name, label, ...rest } = {}) {
        super({ ...rest });

        this.html.classList.add('hc-cayofedpeople-permission-input')

        /** @type {import("faculty/modernuser/permission/data/types.js").PermissionData} */
        this.hooks = {
            fetchItems: async (filter) => {
                //Fetch users from the backend
                return await userRpc.modernuser.permissions.data.fetchPermissions(filter);
            },
            /** @param {import("faculty/modernuser/permission/data/types.js").PermissionData} user */
            getLabel: (user) => user?.label || 'No name',

            getValue: (permission) => permission.name,
            getView: (permission) => {
                return new PermissionInputView(permission).html
            }
        }

        /** @type {string} */
        this.name = name
        this.label = label

        /** TODO:  Support a flag for filtering permissions the user cannot grant */
    }

}
