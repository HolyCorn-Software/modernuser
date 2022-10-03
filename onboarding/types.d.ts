/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * The onboarding module
 * This module (types) contains type definitions for the super-module
 */

import { Collection } from "mongodb"



export declare interface OnboardingInputData {

    profile: {
        label: string,
        icon: string
    },
    roles: [
        {
            role: string,
            zone: string
        }
    ],
    notification: [
        {
            provider: string,
            data: object
        }
    ]

}


export type DatabaseOnboardingData = Pick<OnboardingInputData, "roles"> & {
    time: number,
    userid: string,
    lastRefresh: number,
    id: string
}


export type OnboardingRequestsCollection = Collection<DatabaseOnboardingData>


export declare interface AdminOnboardingData {
    id: string,

    user: AdminOnboardingUserProfile,

    roles:
    [
        AdminOnboardingRoleData
    ]

}


export declare interface AdminOnboardingUserProfile {
    label: string,
    icon: string,
    held_roles: [
        AdminOnboardingRoleData
    ],
    id: string
}



export declare interface AdminOnboardingRoleData {
    role: string,
    zone: string,
    readonly: boolean
}