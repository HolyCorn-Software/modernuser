/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This widget allows the user to edit the super roles of a role
 */

import RoleRelationshipEditPopup from "./generic-edit-role-relationship.mjs";
import logic from "./logic.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class SuperRolesEditPopup extends RoleRelationshipEditPopup {

    /**
     * 
     * @param {object} param0 
     * @param {string} param0.id
     * @param {[import("./types.js").FrontendRoleData]} param0.all_roles
     * @param {[import("./types.js").SuperRoleData]} param0.super_roles
     */
    constructor({ id, super_roles, all_roles }) {
        super({
            id,
            related_roles: super_roles,
            all_roles,
            checker: logic.check_cyclic_role_inheritance,
            relationship_property: 'super_roles'
        });

    }
}