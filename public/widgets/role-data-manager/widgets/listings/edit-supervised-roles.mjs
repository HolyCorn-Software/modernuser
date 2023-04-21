/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This widget allows the user to edit the roles a role supervises
 */

import RoleRelationshipEditPopup from "./generic-edit-role-relationship.mjs";
import logic from "./logic.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class SupervisedRolesEditPopup extends RoleRelationshipEditPopup {

    /**
     * 
     * @param {object} param0 
     * @param {string} param0.id
     * @param {import("./types.js").FrontendRoleData[]} param0.all_roles
     * @param {import("./types.js").SuperRoleData[]} param0.supervised_roles
     */
    constructor({ id, supervised_roles, all_roles }) {
        super({
            id,
            related_roles: supervised_roles,
            all_roles,
            checker: logic.check_cyclic_role_supervision,
            relationship_property: 'supervised_roles'
        });

        console.log(`arguments `, arguments)

    }
}
