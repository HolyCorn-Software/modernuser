/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * The onboarding module
 * This module (types) contains type definitions for the super-module
 */

import { Collection } from "mongodb"



/**
 * @deprecated use modernuser.onboarding.OnboardingInputData
 */
export declare interface OnboardingInputData extends modernuser.onboarding.OnboardingInputData { }


/**
 * @deprecated use modernuser.onboarding.DatabaseOnboardingData instead
 */
export type DatabaseOnboardingData = modernuser.onboarding.DatabaseOnboardingData

/**
 * @deprecated use modernuser.onboarding.OnboardingRequestsCollection  instead
 */
export type OnboardingRequestsCollection = modernuser.onboarding.OnboardingRequestsCollection


/**
 * @deprecated use modernuser.onboarding.AdminOnboardingData  instead
 */
export declare interface AdminOnboardingData extends modernuser.onboarding.AdminOnboardingData { }


/**
 * @deprecated use modernuser.onboarding.AdminOnboardingUserProfile instead
 */
export declare interface AdminOnboardingUserProfile extends modernuser.onboarding.AdminOnboardingUserProfile { }



/**
 * @deprecated use  modernuser.onboarding.AdminOnboardingRoleData  instead
 */
export declare interface AdminOnboardingRoleData extends modernuser.onboarding.AdminOnboardingRoleData { }


global {
    namespace modernuser.onboarding {
        interface OnboardingInputData {

            profile: {
                label: string,
                icon: string
            },
            roles:
            (
                {
                    role: string,
                    zone: string
                }
            )[]

            notification:
            (
                {
                    provider: string,
                    data: object
                }
            )[]


        }


        interface AdminOnboardingData {
            id: string

            user: AdminOnboardingUserProfile

            roles: AdminOnboardingRoleData[]
        }

        interface AdminOnboardingUserProfile {
            label: string
            icon: string
            held_roles: AdminOnboardingRoleData[]
            id: string
        }

        interface AdminOnboardingRoleData {
            role: string
            zone: string
            readonly: boolean
        }

        type OnboardingRequestsCollection = Collection<DatabaseOnboardingData>

        type DatabaseOnboardingData = Pick<OnboardingInputData, "roles"> & {
            time: number,
            userid: string,
            lastRefresh: number,
            id: string
        }
    }
}