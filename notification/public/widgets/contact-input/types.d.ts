/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This module (types) contains type definitions for it's parent module (contact-input)
 */




export declare interface StateDataStructure {
    contacts: modernuser.notification.Contact[]
    /** The current contact visible for editing */
    contact_edit_index: number
}


export type StateData = htmlhc.lib.alarm.AlarmObject<StateDataStructure>