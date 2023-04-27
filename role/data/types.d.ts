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
 * @deprecated use modernuser.role.data.Role
 * This completely defines information about a role
 */
export declare interface RoleData extends modernuser.role.data.Role {

}


/**
 * @deprecated use modernuser.role.data.RoleCollection
 */
export declare type RoleDataCollection = modernuser.role.data.RoleDataCollection

/**
 * This defines the rules that determine the roles that can grant another
 * @deprecated use modernuser.role.data.RoleSupervisionData instead
 */
export declare interface RoleSupervisionData extends modernuser.role.data.RoleSupervisionData {
}

global {
    namespace modernuser.permission {
        interface AllPermissions {
            /** Ability to modify roles created by others */
            'permissions.modernuser.role.supervise': true
            /** Permission to create roles */
            'permissions.modernuser.role.create': true
        }
    }
    namespace modernuser.role.data {

        declare interface Role {
            id: string
            label: string
            description: string
            time: number
            super_roles: [string]
            supervised_roles: [string]
            owners: [string]

        }

        declare type RoleDataCollection = Collection<RoleData>

        declare interface RoleSupervisionData {
            role: string,
            grant: boolean,
            revoke: boolean,
            revoke_self: boolean
        }

    }


}