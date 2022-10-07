/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module(types) contains type definitions for the login-widget widget
 * 
 */


import {logic} from './logic.mjs'
import { Widget } from '/$/system/static/html-hc/lib/widget/index.mjs'


export type ProvidedWidget = Widget & {
    [logic.provider_data_symbol]: {
        name: string,
        credentials: object
    },
    values: object
}