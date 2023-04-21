/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This module (types) contains type definitions for it's parent module (contact-input/overview)
 */


export declare interface OverviewItemData {
    provider: string,
    data: string

}


export type StateData = htmlhc.lib.alarm.AlarmObject<{ providers: [string], highlight: number }>
