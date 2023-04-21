/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This module contains type definitions for the Payment Manager module
 * 
 */

import { PermissionGrant } from '../../../../../permission/grants/types.js'


interface FrontendPermissionSubjectData {
    label: string,
    id: string,
    type: modernuser.permission.SubjectType
}

export declare interface FrontendUserPermissions {
    subject: FrontendPermissionSubjectData,
    permissions: [
        FrontendPermissionGrant
    ]
}


export type FrontendPermissionData = Omit<modernuser.permission.PermissionData, "time">

export type FrontendPermissionGrant = FrontendPermissionData & Omit<PermissionGrant, "subject" | "permission" | "subject_type">


export type UserPermissionsStatedata = htmlhc.lib.alarm.AlarmObject<FrontendUserPermissions>