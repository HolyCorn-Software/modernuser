/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This module (types) contains type definitions for it's parent module (contact-input/overview)
 */

import {AlarmObject} from "/$/system/static/html-hc/lib/alarm/alarm-types";


export declare interface OverviewItemData {
    provider: string,
    data: string

}


export type StateData = AlarmObject<{ providers: [string], highlight: number }>
