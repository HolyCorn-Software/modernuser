/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * The Faculty of Association
 * The group manager module
 * 
 * This sub-module (types) defines all types used by the group manager module
 */

import { Collection } from "mongodb";

export declare interface PermissionData {
    name: string,
    label: string,
    time: number,
    inherit: [string] //Permissions that a user will automatically have for having this permission
}
export declare type PermissionsDataCollection = Collection<PermissionData>

export type PermissionDataInput = Omit<PermissionData, "time">