/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module contains type definitions that define and facilitate the storage of zone membership
 */



import { Collection } from 'mongodb'

export declare interface ZoneMembershipData {
    subject: string,
    zone: string,
    time: number
}


export type ZoneMembershipCollection = Collection<ZoneMembershipData>