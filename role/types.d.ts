/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This module (types) contains data structures used by it's parent module (role)
 */

import RoleContactController from "./contact/controller.mjs";

export declare interface RoleCollections {
    data: modernuser.role.data.RoleDataCollection
    roleplay: modernuser.role.roleplay.RolePlayCollection,
    contact: RoleContactController
}