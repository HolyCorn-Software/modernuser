/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This module (types) contains type definitions for it's parent module (The role-resolve widget)
 */

import { AdminOnboardingData } from "faculty/modernuser/onboarding/types";
import { RoleData } from "faculty/modernuser/role/data/types";
import { RolePlay } from "faculty/modernuser/role/membership/types";
import { ZoneData } from "faculty/modernuser/zonation/data/types";
import { AlarmObject } from "/$/system/static/lib/hc/lib/util/alarm-types";



export type StateDataRaw = AdminOnboardingData & {

    role_data: [RoleData],
    zonation_data: [ZoneData],

}

export type StateData = AlarmObject<StateDataRaw>


export declare interface FrontendRoleData {
    role: {
        label: string,
        id: string
    },
    zone: {
        label: string,
        id: string
    },
    readonly: boolean,
    user:{
        label: string,
        icon: string,
        id: string
    }
}