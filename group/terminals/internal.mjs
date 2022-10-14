/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module contains functions that have been made available to other faculties. 
 */

import GroupMembershipController from "../membership/controller.mjs";
import GroupDataController from "../data/controller.mjs";



export default class UserGroupInternalMethods {

    /**
     * 
     * @param {GroupMembershipController} membership_controller 
     */
    constructor(data_controller, membership_controller) {

        /** @type {GroupMembershipController} */
        this[membership_controller_symbol] = membership_controller

        /** @type {GroupDataController} */
        this[data_controller_symbol] = data_controller

        /** @type {GroupDataController} */
        this.data = new ProxyWrapper(data_controller)

        /** @type {GroupMembershipController} */
        this.membership = new ProxyWrapper(membership_controller)
    }

}


/**
 * All we are doing here is, making something that will remove the first argument of every method being executed
 */
class ProxyWrapper {

    constructor(source) {
        const path = arguments[1]

        if (source == null || (typeof source !== 'object' && typeof source !== 'function')) {
            return source
        }

        if (typeof source === 'function') {
            return function () {
                return source(...[...arguments].slice(1))
            }
        }
        return new Proxy(source, {
            get: (target, property, receiver) => {
                return new ProxyWrapper(Reflect.get(target, property, receiver))
            }
        })
    }

}


const membership_controller_symbol = Symbol(`UserGroupInternalMethods.prototype.controller`)
const data_controller_symbol = Symbol(`UserGroupInternalMethods.prototype.controller`)