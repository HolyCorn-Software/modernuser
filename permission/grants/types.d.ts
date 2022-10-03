/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * 
 * The Modern Faculty of Users
 * 
 * This sub-module (types) defines the types used through out the module
 */

import { Collection } from "mongodb";



export declare interface PermissionGrant {
    subject: string, //Could be a userid or groupid
    subject_type: ('user' | 'role'),
    permission: string,
    freedom: { //Determines how the user may use the permission
        use: boolean, //The user may exercise the permission
        grant: boolean //The user may grant the permission to another user
    },
    time: number,
    expires: number,
    zone: {
        id: string,
        label: string
    }, //When specified, the permission will only work within the stated zone. This will be ignored if the permission is granted to a role. Roles are already zoned
}



export type PermissionIntent = {
    freedom: ('grant' | 'use'),
    zones: string | [string],
}

export declare type PermissionGrantsCollection = Collection<PermissionGrant>