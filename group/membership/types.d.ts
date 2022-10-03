/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * 
 * The Faculty of Association
 * The association module (Dealing with relationships between users and persons, users and groups, users and permissions, groups and permissions)
 * This sub-module (types) defines the types used through out the module
 */

import { Collection } from "mongodb";


export declare interface GroupMembership {
    userid: string,
    group: string
}


export declare type GroupMembershipCollection = Collection<GroupMembership>

