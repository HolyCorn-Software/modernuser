/**
 * Copyright 2024 HolyCorn Software
 * The Modern Faculty of Users
 * This module contains type definitions for the contact-input widget
 */

import ''
import NotificationPublicMethods from "faculty/modernuser/notification/terminals/public.mjs"
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs"

global {

    namespace modernuser.ui.notification.contact_input {
        type Statedata = htmlhc.lib.alarm.AlarmObject<{
            contact: modernuser.notification.ContactExtra
            providers: Awaited<ReturnType<(typeof hcRpc)['modernuser']['notification']['getProviders']>>
            caption: string
        }>
    }
}