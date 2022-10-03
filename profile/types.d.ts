/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This module (types) contains type definitions for components that are related to profile management
 */


import { Collection } from 'mongodb'

export declare interface UserProfileData {
    time: number
    id: string,
    label: string,
    icon: string
}


export type UserProfileCollection = Collection<UserProfileData>