/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module(types) contains type definitions for the login-widget widget
 * 
 */


import { Widget } from '/$/system/static/lib/hc/lib/widget.js'
import {logic} from './logic.mjs'


export type ProvidedWidget = Widget & {
    [logic.provider_data_symbol]: {
        name: string,
        credentials: object
    },
    values: object
}