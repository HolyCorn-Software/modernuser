/**
 * Copyright 2023 HolyCorn Software
 * The Modern Faculty of Users
 * This module contains type definitions for the general types of the faculty
 */

import AuthenticationPlugin from "./authentication/plugin/model.mjs"
import UserInternalMethods from "./terminals/internal.mjs"
import UserPublicMethods from "./terminals/public.mjs"



global {


    namespace modernuser.plugins {

        interface PluginMap {
            auth: AuthenticationPlugin<{}, {}, {}>
            notification: NotificationPlugin<{}, {}>
        }
    }

}



global {
    namespace faculty {
        interface faculties {
            modernuser: {
                remote: {
                    internal: UserInternalMethods
                    public: UserPublicMethods
                }
            }
        }
    }
}


