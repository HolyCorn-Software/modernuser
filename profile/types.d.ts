/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This module (types) contains type definitions for components that are related to profile management
 */


import { Collection } from 'mongodb'


/**
 * @deprecated use modernuser.profile.UserProfileData without any imports
 */
export declare interface UserProfileData {
    time: number
    id: string
    label: string
    icon: string
    /** When this is set to true, the profile will expire, when inactive for 3 days */
    temporal: boolean
}


/** @deprecated use modernuser.profile.UserProfileCollection */
export type UserProfileCollection = Collection<UserProfileData>


declare global {
    declare namespace modernuser {
        declare namespace profile {

            /** 
             * This shows the information retained about a user
             * Don't expand this in any ts file, simply for the sake of of expanding the
             * contents of the 'meta' field.
             * Expand rather, the UserProfileMeta field
             * 
             */
            interface UserProfileData {
                /** Unique id of the user */
                id: string
                /** The time the profile was created */
                time: number
                /** Names of the user combined */
                label: string
                /** URL path to the profile picture */
                icon: string
                /** When this is set to true, the profile will expire, when inactive for 3 days */
                temporal: boolean
                /** Additional fields that may be added to a user profile */
                meta: UserProfileMeta
            }

            /** 
             * This field can be expanded by multiple ts modules,
             *  to determine the final meta data to be contained in profiles 
             * */
            interface UserProfileMeta{

            }

            type MutableUserProfileData = Pick<UserProfileData, "label" | "meta" | "icon">

            type UserProfileCollection = Collection<UserProfileData>
        }
        namespace permission{
            interface AllPermissions{
                'permissions.modernuser.profiles.search': true
            }
        }
    }
}