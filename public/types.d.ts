/**
 * Copyright 2023 HolyCorn Software
 * The Modern Faculty of Users
 * This module contains certain important type definitions for the faculty, on the frontend
 */



import ''

global {
    namespace modernuser.ui {
        interface LibModernuser {

        }
    }
    interface Window {
        libModernuser: modernuser.ui.LibModernuser
    }
}