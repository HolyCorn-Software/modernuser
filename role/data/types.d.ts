/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * The Faculty of Association
 * The group manager module
 * 
 * This sub-module (types) defines all types used by the group manager module
 */

import { Collection } from "mongodb";
import EventEmitter from 'node:events'


//If this structure should change, make changes in the controller fields, especially where we have calls to util.pickOnlyDefined()


/**
 * This completely defines information about a role
 */
export declare interface RoleData {
    id: string
    label: string
    description: string
    time: number
    super_roles: [string]
    supervised_roles: [string]
    owners: [string]

}
export declare type RoleDataCollection = Collection<RoleData>

/**
 * This defines the rules that determine the roles that can grant another
 */
export declare interface RoleSupervisionData {
    role: string,
    grant: boolean,
    revoke: boolean,
    revoke_self: boolean
}

global{
    namespace modernuser.permission{
        interface AllPermissions{
            /** Ability to modify roles created by others */
            'permissions.modernuser.role.supervise': true
            /** Permission to create roles */
            'permissions.modernuser.role.create': true
        }
    }
}