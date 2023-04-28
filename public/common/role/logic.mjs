/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module contains important code used by both frontend and backend for the purpose of role management
 */






/**
 * This method checks for the occurence where a role is a parent to a role that is directly or indirectly it's parent
 * 
 * @param {modernuser.role.data.Role[]} all_roles
 */
function check_cyclic_role_inheritance(all_roles) {
    try {
        check_cyclic_relationship(all_roles, 'super_roles')
    } catch (e) {
        if (e?.code === 'cyclic_relationship') {
            throw new Error(`Cyclic inheritance detected. The role <b>${e.roles[0].label}</b> inherits either directly or indirectly from <b>${e.roles[1].label}</b>, and <b>${e.roles[1].label}</b> also indirectly or directly inherits <b>${e.roles[0].label}</b>.`)
        }
        throw e
    }
}




/**
 * This method checks for the occurence where a role supervises a role that somehow already supervises it
 * @param {modernuser.role.data.Role[]} all_roles
 */
function check_cyclic_role_supervision(all_roles) {
    try {

        check_cyclic_relationship(all_roles, 'supervised_roles')
    } catch (e) {

        if (e?.code === 'cyclic_relationship') {
            throw new Error(`Cyclic supervision detected. The role <b>${e.roles[0].label}</b> supervises either directly or indirectly the role <b>${e.roles[1].label}</b>, and <b>${e.roles[1].label}</b> also indirectly or directly supervises <b>${e.roles[0].label}</b>.`)
        }
        throw e
    }
}






/**
 * This method checks for the occurence where a role is parent to a role that is it's parent or a parent to it's ancestor
 * 
 * @param {modernuser.role.data.Role[]} all_roles
 * @param {string} relationship_property
 */
function check_cyclic_relationship(all_roles, relationship_property) {


    const check_role = (role_id, original_role_ids) => {
        
        let current_role = all_roles.filter(role => role.id === role_id)[0]

        if (!current_role) {
            console.warn(`role with id ${role_id} not found.`)
        }


        for (let parent_id of current_role[relationship_property] || []) {

            for (let original_role_id of original_role_ids) {

                if (parent_id === original_role_id) {
                    throw { code: 'cyclic_relationship', roles: [all_roles.filter(x => x.id === original_role_ids[0])[0], current_role] }
                }
            }

            check_role(parent_id, [...original_role_ids, current_role.id])
        }
    }

    for (let role of all_roles) {
        check_role(role.id, [])
    }
}


export default {
    check_cyclic_role_inheritance,
    check_cyclic_role_supervision
}