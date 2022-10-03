/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * The Faculty of Association
 * The group manager module
 * 
 * This sub-module (types) defines all types used by the group manager module
 */

import { Collection } from "mongodb";

export declare interface Group {
    id: string,
    label: string,
    time: number,
    supergroup: number

}
export declare type GroupsCollection = Collection<Group>