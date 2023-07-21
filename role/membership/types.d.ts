/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * 
 * The Modern Faculty of Users
 * This module role membership deals with the information of who belongs to which role
 */

import { Collection } from "mongodb";


/**
 * @deprecated use  modernuser.role.roleplay.RolePlay
 */
export declare interface RolePlay extends modernuser.role.roleplay.RolePlay {
}


/**
 * @deprecated use modernuser.role.roleplay.RolePlayCollection
 */
export declare type RolePlayCollection = modernuser.role.roleplay.RolePlayCollection


global {
    namespace modernuser.permission {
        interface AllPermissions {
            'permissions.modernuser.role.play.grant_all': true
            'permissions.modernuser.role.play.view': true
        }
    }
    namespace modernuser.role.roleplay {

        interface RolePlay {
            userid: string,
            role: string,
            zone: string
        }

        type RolePlayCollection = Collection<RolePlay>

    }
}