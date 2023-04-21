/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * The Faculty of Association
 * The group manager module
 * 
 * This sub-module (types) defines all types used by the group manager module
 */

import { Collection } from "mongodb";

/** @deprecated use modernuser.permission.PermissionData */
export declare interface PermissionData extends modernuser.permission.PermissionData { }
/** @deprecated use modernuser.permission.PermissionDataCollection */
export declare type PermissionsDataCollection = modernuser.permission.PermissionsDataCollection

/** @deprecated use modernuser.permission.PermissionDataInput */
export type PermissionDataInput = modernuser.permission.PermissionDataInput

global {
    namespace modernuser.permission {
        interface PermissionData {
            /** The unique name for the permission */
            name: PermissionEnum
            /** A human-friendly name for the permission */
            label: string
            /** The time the permission was created */
            time: number
            /** Permissions that a user will automatically have for having this permission */
            inherit: PermissionEnum[]
        }

        type PermissionDataInput = Omit<PermissionData, "time">


        declare type PermissionsDataCollection = Collection<PermissionData>


        /**
         * Add fields to this object, so we can obtain an enum of all possible permissions
         */
        interface AllPermissions {
            'permissions.modernuser.superuser': true
        }

        type PermissionEnum = keyof AllPermissions


    }
}