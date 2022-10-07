/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This module (types) contains type definitions for it's parent module (contact-input)
 */

import { ContactData } from "faculty/modernuser/notification/types"
import {AlarmObject} from "/$/system/static/html-hc/lib/alarm/alarm-types";



export declare interface StateDataStructure{
    contacts: [ContactData],
    /** The current contact visible for editing */
    contact_edit_index: number
}


export type StateData = AlarmObject<StateDataStructure>