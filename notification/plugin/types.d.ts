/**
 * Copyright 2023 HolyCorn Software
 * The Modern Faculty of Users
 * This module contains type definitions especially useful to notification plugins
 */


import ''

global {

    namespace modernuser.plugins.authentication {
        interface plugins {

        }
    }
    namespace faculty.plugin {
        interface plugins {
            auth: modernuser.plugins.authentication.plugins
            notification: modernuser.plugins.notification.plugins
        }
    }
}