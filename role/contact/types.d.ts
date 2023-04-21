/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * 
 * The Modern Faculty of Users
 * 
 * This module is concerned with the type definitions of it's parent module
 */

import { Collection } from "mongodb";


export declare interface RoleContact {
    userid: string,
    role: string,
    zone: string
}


export declare type RoleContactCollection = Collection<RoleContact>


global {
    namespace modernuser.permission {
        interface AllPermissions {
            'permissions.modernuser.role.contacts.manage': true
        }
    }
}