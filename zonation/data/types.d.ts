/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * This module contains type definitions strictly related to basic information about zones
 * 
 */


import ''

global {
    namespace modernuser.permission {
        interface AllPermissions {
            'permissions.modernuser.zonation.admin': true
        }
    }
    namespace modernuser.zonation {
        interface ZoneData {
            id: string,
            label: string,
            superzone: string,
            time: number
        }
        type ZoneDataCollection = Collection<ZoneData>
    }
}