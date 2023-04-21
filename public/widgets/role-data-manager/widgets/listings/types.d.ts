/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This module contains type definitions for the Payment Manager module
 * 
 */




export declare interface FrontendRoleData {
    label: string,
    id: string,
    description: string,
    super_roles: SuperRoleData[]

}

export declare interface SuperRoleData {
    id: string,
    label: string
}
export declare interface SupervisedRoleData {
    id: string,
    label: string
}


export type RolesStatedata = htmlhc.lib.alarm.AlarmObject<FrontendRoleData>