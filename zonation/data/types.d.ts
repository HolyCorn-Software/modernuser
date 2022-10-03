/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * This module contains type definitions strictly related to basic information about zones
 * 
 */


import {Collection} from 'mongodb'


export declare interface ZoneData {
    id: string,
    label: string,
    superzone: string,
    time: number
}


export type ZoneDataCollection = Collection<ZoneData>