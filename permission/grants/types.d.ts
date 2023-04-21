/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * 
 * The Modern Faculty of Users
 * 
 * This sub-module (types) defines the types used through out the module
 */

import { Collection } from "mongodb";



/** @deprecated Use modernuser.permission.PermissionGrant */
export declare interface PermissionGrant extends modernuser.permission.PermissionGrant { }



/** @deprecated Use modernuser.permission.PermissionIntent instead */
export interface PermissionIntent extends modernuser.permission.PermissionIntent { }


/** @deprecated Use modernuser.permission.PermissionGrantsCollection instead */
export declare type PermissionGrantsCollection = modernuser.permission.PermissionGrantsCollection

global {
    namespace modernuser.permission {

        type SubjectType = ('user' | 'role');

        interface PermissionGrant {
            /** Could be a userid or groupid */
            subject: string
            /** The type of subject the permission is given to. A user, or a role? */
            subject_type: SubjectType
            permission: PermissionEnum
            /** Determines how the user may use the permission */
            freedom: {
                /** The user may exercise the permission */
                use: boolean
                /** The user may grant the permission to another user */
                grant: boolean
            },
            /** The time the permission was granted */
            time: number
            /** The time the privilege will expire */
            expires: number
            /**
             * When specified, the permission will only work within the stated zone. This will be ignored if the permission is granted to a role. Roles are already zoned
             */
            zone: {
                id: string
                label: string
            }
        }

        type PermissionGrantsCollection = Collection<PermissionGrant>

        type Freedom = ('grant' | 'use');

        interface PermissionIntent {
            freedom: Freedom,
            zones: (string | string)[],
        }

        interface AllPermissions {
            'permissions.modernuser.permissions.manage': true
        }



    }

}