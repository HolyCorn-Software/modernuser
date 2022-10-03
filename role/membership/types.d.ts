/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * 
 * The Modern Faculty of Users
 * This module role membership deals with the information of who belongs to which role
 */

import { Collection } from "mongodb";


export declare interface RolePlay {
    userid: string,
    role: string,
    zone: string
}


export declare type RolePlayCollection = Collection<RolePlay>

