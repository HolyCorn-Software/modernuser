/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module(types) contains type definitions for the login-widget widget
 * 
 */


import { logic } from './logic.mjs'
import { Widget } from '/$/system/static/html-hc/lib/widget/index.mjs'


export type ProvidedWidget = Widget & {
    [provider: symbol]: {
        name: string
        credentials: object
    },
    values: object
}


interface LoginWidgetCustomizations {
    help: boolean
    navigation: boolean
}

global {
    namespace modernuser.authentication.frontend {
        interface LoginStatus {
            active: boolean
            onboarded: boolean
        }
    }
}