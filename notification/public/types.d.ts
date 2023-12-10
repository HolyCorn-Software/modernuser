/**
 * Copyright 2023 HolyCorn Software
 * The Modern Faculty of Users
 * This module contains type definitions related notifications at the frontend.
 */


import ModernuserEventClient from "./event-client.mjs"

global {
    namespace modernuser.ui {
        interface LibModernuser {
            eventChannel: ModernuserEventClient
        }

        namespace notification {
            interface ClientFrontendEvents {
                'example': {
                    param1: string
                    param2: 'enum1' | 'enum2'
                }
            }
        }
    }

    interface Window {
        addEventListener: (event: 'modernuser-event-client-ready', cb: (event: Event) => void, opts?: AddEventListenerOptions) => void
    }

}