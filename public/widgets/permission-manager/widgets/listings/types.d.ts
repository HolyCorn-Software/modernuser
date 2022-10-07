/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This module contains type definitions for the Payment Manager module
 * 
 */

import { PermissionGrant } from '../../../../../permission/grants/types.js'
import { PermissionData } from '../../../../../permission/data/types.js'

import {AlarmObject} from "/$/system/static/html-hc/lib/alarm/alarm-types";

interface FrontendPermissionSubjectData {
    label: string,
    id: string,
    type: ("role" | "user")
}

export declare interface FrontendUserPermissions {
    subject: FrontendPermissionSubjectData,
    permissions: [
        FrontendPermissionGrant
    ]
}


export type FrontendPermissionData = Omit<PermissionData, "time">

export type FrontendPermissionGrant = FrontendPermissionData & Omit<PermissionGrant, "subject" | "permission" | "subject_type">


export type UserPermissionsStatedata = AlarmObject<FrontendUserPermissions>