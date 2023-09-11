/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module contains type definitions that define and facilitate the storage of zone membership
 */



import { Collection } from 'mongodb'

global {
    namespace modernuser.zonation {
        interface ZoneMembershipData {
            subject: string,
            zone: string,
            time: number
        }
        type ZoneMembershipCollection = Collection<ZoneMembershipData>
    }
}