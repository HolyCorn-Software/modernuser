/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * The onboarding module
 * This module (controller) determines the overall generalistic and superficial logic governing the onboarding module
 */


import NotificationController from "../notification/controller.mjs"
import UserProfileController from "../profile/controller.mjs"
import shortUUID from "short-uuid"
import RoleContactController from "../role/contact/controller.mjs"
import RolePlayController from "../role/membership/controller.mjs"


const collection_symbol = Symbol()
const profile_controller_symbol = Symbol()
const notification_controller_symbol = Symbol()
const role_contact_controller_symbol = Symbol()
const roleplay_controller_symbol = Symbol()

export default class OnboardingController {


    /**
     * 
     * @param {object} param0
     * @param {modernuser.onboarding.OnboardingRequestsCollection} param0.collection 
     * @param {UserProfileController} param0.profile_controller
     * @param {NotificationController} param0.notification_controller
     * @param {RoleContactController} param0.role_contact_controller
     * @param {RolePlayController} param0.roleplay_controller
     */
    constructor({ collection, profile_controller, notification_controller, role_contact_controller, roleplay_controller }) {

        this[collection_symbol] = collection

        this[profile_controller_symbol] = profile_controller
        this[notification_controller_symbol] = notification_controller

        this[role_contact_controller_symbol] = role_contact_controller

        this[roleplay_controller_symbol] = roleplay_controller

    }

    /**
     * This method checks if a user is fully onboarded
     * @param {object} param0 
     * @param {string} param0.userid
     * 
     */
    async checkOnboardingStatus({ userid }) {
        const profile = await this[profile_controller_symbol].getProfile({ id: userid })
        return typeof profile.label !== 'undefined' && typeof profile.icon !== 'undefined'
    }

    /**
     * This method is used to perform some initializations with the consent of the client.
     * For example setting account names, picture and notification data
     * @param {object} param0
     * @param {modernuser.onboarding.OnboardingInputData} param0.data 
     * @param {string} param0.userid
     * @returns {Promise<void>}
     */
    async onboard({ data, userid }) {
        //So how do we onboard, we send messages to all role contacts within the zone, and then impute the necessary information

        soulUtils.checkArgs(data, {
            profile: {
                icon: 'string',
                label: 'string'
            }
        }, 'data');

        if (!Array.isArray(data?.notification)) {
            throw new Exception(`Invalid arguments passed. No information concerning notifications.`)
        }

        if (!Array.isArray(data?.roles)) {
            throw new Exception(`Not enough information passed on the roles`)
        }

        await this[profile_controller_symbol].setProfile(
            {
                id: userid,
                profile: {
                    icon: data.profile.icon,
                    label: data.profile.label
                }
            }
        );

        for (let notification of data.notification) {

            soulUtils.checkArgs(notification, {
                provider: 'string'
            }, 'notification')

            console.log(`a contact `, notification)

            await this[notification_controller_symbol].createContact(
                {
                    provider: notification.provider,
                    data: notification.data,
                    userid
                }
            );

        }

        await this[collection_symbol].updateOne(
            {
                userid,
                id: { $exists: false }
            },

            {
                $set: {
                    roles: data.roles,
                    time: Date.now(),
                    userid: userid,
                    id: `${shortUUID.generate()}${shortUUID.generate()}`
                }
            },
            { upsert: true }
        )

    }


    /**
     * This method gets a single request
     * @param {object} param0 
     * @param {string} param0.id
     * @param {string} param0.userid
     * @returns {Promise<modernuser.onboarding.AdminOnboardingData>}
     */
    async getSimplifiedRequest({ id, userid } = {}) {

        const data = await this[collection_symbol].findOne(
            {
                id
            }
        );

        if (!data) {
            throw new Exception(`The request you are loking for was not found.`)
        }

        /**
         * This method sets the readonly fields on an array of roles. Readonly is set when the role in question cannot be granted the current user
         * @param {{role: string, zone: string}[]} roles
         * @returns {Promise<{role: string, zone: string, readonly:boolean}>}
         */
        const set_readonly_fields = (roles) => {
            return Promise.all(
                roles.map(async role => {
                    role.readonly = !await this[roleplay_controller_symbol].userCanGrantRole(
                        {
                            userid,
                            role: role.role,
                            zone: role.zone,
                        }
                    )
                    return role
                })
            )
        }

        await Promise.all(
            [
                set_readonly_fields(data.roles),

                (async () => {

                    const profile = await this[profile_controller_symbol].getProfile({ id: data.userid })

                    //Takes the list of roles played by the user and checks the ones that are grantable by the calling user. Those that are not grantable have readonly set to true
                    const held_roles = await set_readonly_fields(
                        (await this[roleplay_controller_symbol].getUserRoles(profile.id)).map(hr => {
                            return {
                                role: hr.role,
                                zone: hr.zone
                            }
                        })
                    )

                    data.user = {
                        label: profile.label,
                        icon: profile.icon,
                        id: profile.id,
                        held_roles
                    }
                    delete data.userid
                })()
            ]
        );



        return data;

    }


    /**
     * This method adds a role to a request
     * @param {object} param0 
     * @param {string} param0.id The request to be modified
     * @param {object} param0.role
     * @param {string} param0.role.role
     * @param {string} param0.role.zone
     * @param {string} param0.userid
     * @returns {Promise<void>}
     */
    async addRoleToRequest({ id, role, userid }) {
        await this.updateRoleInRequest({ id, role, userid, action: 'add' })
    }
    /**
     * This method removes a role from a request
     * @param {object} param0 
     * @param {string} param0.id The request to be modified
     * @param {object} param0.role
     * @param {string} param0.role.role
     * @param {string} param0.role.zone
     * @param {string} param0.userid
     * @returns {Promise<void>}
     */
    async removeRoleFromRequest({ id, role, userid }) {
        await this.updateRoleInRequest({ id, role, userid, action: 'remove' })
    }
    /**
     * This method updates data about a role in a request
     * @param {object} param0 
     * @param {string} param0.id The request to be modified
     * @param {object} param0.role
     * @param {string} param0.role.role
     * @param {string} param0.role.zone
     * @param {string} param0.userid
     * @param {('add'|'remove')} param0.action
     * @returns {Promise<void>}
     */
    async updateRoleInRequest({ id, role, userid, action }) {

        if (
            userid &&
            !await this[roleplay_controller_symbol].userCanGrantRole(
                {
                    userid,
                    role: role.role,
                    zone: role.zone
                }
            )
        ) {
            throw new Exception(`Sorry, you don't have the ability to grant the given role`)
        }


        await this[collection_symbol].updateOne(
            { id },
            {
                [action === 'add' ? '$push' : '$pull']: {
                    roles:
                    {
                        role: role.role,
                        zone: role.zone
                    }

                }
            }
        )
    }


}