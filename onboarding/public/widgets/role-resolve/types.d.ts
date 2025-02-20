/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This module (types) contains type definitions for it's parent module (The role-resolve widget)
 */

import { AdminOnboardingData } from "faculty/modernuser/onboarding/types";



export type StateDataRaw = AdminOnboardingData & {

    role_data: modernuser.role.data.Role
    zonation_data: modernuser.zonation.ZoneData[]

}

export type StateData = htmlhc.lib.alarm.AlarmObject<StateDataRaw>


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
    user: {
        label: string,
        icon: string,
        id: string
    }
}