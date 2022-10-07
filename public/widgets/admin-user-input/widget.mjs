/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System.
 * This widget allows one to search and select a user
 */

import userRpc from "../../lib/rpc.mjs";
import { AdminUserInputUserView } from "./user-view.mjs";
import { SearchInput } from "/$/system/static/html-hc/widgets/search-input/widget.mjs";


export default class AdminUserInput extends SearchInput {

    constructor({ name, label, ...rest } = {}) {
        super({ ...rest });

        /** @type {import("/$/system/static/lib/hc/search-input/types.js").SearchInputHooks} */
        this.hooks = {
            fetchItems: async (filter) => {
                //Fetch users from the backend
                return await userRpc.modernuser.profile.fetchUsers(filter);
            },
            /** @param {import("faculty/modernuser/profile/types.js").UserProfileData} user */
            getLabel: (user) => user?.label || 'No name',

            getValue: (user) => user.id,
            getView: (user) => {
                return new AdminUserInputUserView(user).html
            }
        }

        /** @type {string} */
        this.name = name
        this.label = label
    }

}
