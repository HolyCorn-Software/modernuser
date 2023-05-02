/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This module (notifier) serves to inform contact persons when there's a new user that needs to be assigned roles
 */

import RoleContactController from "../role/contact/controller.mjs";
import RoleDataController from "../role/data/controller.mjs";


const collection_symbol = Symbol()
const rolecontact_controller_symbol = Symbol()
const roledata_controller_symbol = Symbol()

export default class OnboardingNotifier {

    /**
     * 
     * @param {object} param0
     * @param {modernuser.onboarding.OnboardingRequestsCollection} param0.collection 
     * @param {RoleContactController} param0.rolecontact_controller
     * @param {RoleDataController} param0.roledata_controller
     */
    constructor({ collection, rolecontact_controller, roledata_controller }) {

        this[collection_symbol] = collection
        this[rolecontact_controller_symbol] = rolecontact_controller
        this[roledata_controller_symbol] = roledata_controller
    }



    /**
     * This method loops through the list, and determines which requests to broadcast.
     * For each of the requests it wants to broadcast, it sends messages to all the eligible contact persons.
     * @returns {Promise<void>}
     */
    async tick() {

        const cursor = this[collection_symbol].find(
            {
                lastRefresh: {
                    $lt: Date.now() - OnboardingNotifier.refresh_delay
                },

                'roles.0': { $exists: true }
            }
        );

        const promises = []

        while (await cursor.hasNext()) {
            promises.push(
                (async () => {
                    const data = await cursor.next()
                    const entry_promises = []
                    const all_contacts = []

                    for (const entry of data.roles) {
                        entry_promises.push(
                            (async () => {
                                {
                                    all_contacts.push(
                                        {
                                            contacts: await this[rolecontact_controller_symbol].getCapableContacts({ role: entry.role, zone: entry.zone }),
                                            entry
                                        }
                                    )
                                }
                            })()
                        )
                    }

                    //Let's get the minimum roles that 

                })()
            )
        }

    }

    static get refresh_delay() {
        return 24 * 60 * 60 * 1000
    }

}