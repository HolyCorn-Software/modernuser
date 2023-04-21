/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module contains important functionalities used by the role-data-manager listings widget
 */

import commonlogic from "/$/modernuser/static/common/role/logic.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs"




/**
 * This method checks for the occurence where a role is parent to a role that is it's parent or a parent to it's ancestor
 * 
 * @param {import("./types.js").FrontendRoleData[]} all_roles
 */
function check_cyclic_role_inheritance(all_roles) {

    return commonlogic.check_cyclic_role_inheritance(all_roles)
}

/**
 * This method checks for the occurence where a role supervises a role that already somehow supervises it
 * 
 * @param {import("./types.js").FrontendRoleData[]} all_roles
 */
function check_cyclic_role_supervision(all_roles) {

    return commonlogic.check_cyclic_role_supervision(all_roles)
}


async function fetch_roles() {
    let all_roles = await hcRpc.modernuser.role.data.getAll();

    /**
     * This method maps properties where only the id is defined to items that have label and id
     * @param {import("./types.js").FrontendRoleData} role 
     * @param {string} property 
     */
    const fill_label = (role, property) => {
        role[property] = role[property]?.map(sup => {
            const found = all_roles.find(x => x.id === sup)
            if (!found) {
                hcRpc.system.error.report(`${role.label} (${role.id}) has a parent that doesn't exist (${sup})`)
            }
            return { id: found?.id, label: found?.label }
        })?.filter(x => typeof x?.id !== 'undefined') || []
    }

    for (let role of all_roles) {
        fill_label(role, 'super_roles')
        fill_label(role, 'supervised_roles')
    }

    return all_roles
}




export default {
    check_cyclic_role_inheritance,
    check_cyclic_role_supervision,
    fetch_roles
}