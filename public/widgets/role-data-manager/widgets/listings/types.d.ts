/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This module contains type definitions for the Payment Manager module
 * 
 */

import { PermissionGrant } from '../../../../../permission/grants/types.js'
import { PermissionData } from '../../../../../permission/data/types.js'

import {AlarmObject} from "/$/system/static/html-hc/lib/alarm/alarm-types";



export declare interface FrontendRoleData {
    label: string,
    id: string,
    description: string,
    super_roles: [SuperRoleData]

}

export declare interface SuperRoleData {
    id: string,
    label: string
}
export declare interface SupervisedRoleData {
    id: string,
    label: string
}


export type RolesStatedata = AlarmObject<FrontendRoleData>