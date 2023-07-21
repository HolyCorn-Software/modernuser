/**
 * Copyright 2023 HolyCorn Software
 * The Modern Faculty of Users
 * This module contains type definitions for the rolegroup module
 */



import { Collection } from "mongodb"



global {
    namespace modernuser.rolegroup {
        interface RoleGroupData {
            /** This field defines the roles, which if posessed, the user
             * is considered a member of the role group
             */
            roles: string[]
            /**
             * This field defines other rolegroups which if the user already 
             * belongs to, would be considered a member of this rolegroup.
             * In summary super inherited rolegroups
             */
            rolegroups: string[]
            /**
             * A unique id for the rolegroup
             */
            id: string

            /**
             * A human-friendly name for the rolegroup
             */
            label: string

            /**
             * A human-friendly fulltext description of the entire rolegroup
             */
            description: string

            /** The time the rolegroup was created */
            time: number
        }

        type RoleGroupInit = Omit<RoleGroupData, "time" | "id">

        type RoleGroupCollection = Collection<RoleGroupData>
    }

    namespace modernuser.permission {
        interface AllPermissions {
            'permissions.modernuser.rolegroup.supervise': true
        }
    }
}