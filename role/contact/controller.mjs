/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * 
 * The Modern Faculty of Users
 * 
 * This module helps with information on who is responsible for assigning which roles in which zone
 * 
 */

import ZonationDataController from "../../zonation/data/controller.mjs";
import { checkArgs } from "../../../../system/util/util.js";
import RolePlayController from "../membership/controller.mjs";
import RoleDataController from "../data/controller.mjs";
import PermissionGrantsController from "../../permission/grants/controller.mjs";


const zonation_data_controller_symbol = Symbol()
const role_play_controller_symbol = Symbol()
const role_data_controller_symbol = Symbol()
const permission_grants_controller_symbol = Symbol()

export default class RoleContactController {

    /**
     * 
     * @param {object} param0 
     * @param {import("./types.js").RoleContactCollection} param0.collection
     * @param {ZonationDataController} param0.zonation_data_controller
     * @param {RolePlayController} param0.role_play_controller
     * @param {RoleDataController} param0.role_data_controller
     * @param {PermissionGrantsController} param0.permission_grants_controller
     */
    constructor({ collection, zonation_data_controller, role_play_controller, role_data_controller, permission_grants_controller }) {

        RoleContactController.prepareCollections(collection);
        /**  @type {import("./types.js").RoleContactCollection} */
        this.collection = collection

        this[zonation_data_controller_symbol] = zonation_data_controller

        this[role_play_controller_symbol] = role_play_controller

        this[role_data_controller_symbol] = role_data_controller
        this[permission_grants_controller_symbol] = permission_grants_controller

    }


    /**
     * This method gets all role contact information
     * @returns {Promise<[import('./types.js').RoleContact]>}
     */
    async getAll() {
        return await this.collection.find({}).toArray()
    }

    /**
     * This gets all the users who are responsible for a role within a given zone.
     * It also searches 
     * @param {object} param0 
     * @param {string} param0.role
     * @param {string} param0.zone
     * @param {string} param0.specific_user If specified, only the user's info will be fetched
     * @returns {Promise<[import("./types.js").RoleContact]>}
     */
    async getCapableContacts({ role, zone }) {
        const query = {
            role
        }
        if (zone) {

            const all_zones = [zone, ...(await this[zonation_data_controller_symbol].getAncestors(zone)).map(z => z.id)];

            query.zone = {
                $in: all_zones
            }


        }

        return await this.collection.find(query).toArray()
    }

    /**
     * This method returns the minimum list of contacts 
     * @param {[{role:string, zone: string}]} data
     * @returns {Promise<[{roles: [string], userid: string}]>}
     */
    async getMinCapableContacts(data) {

        //This method first aggregates all contacts, then groups them according to role inheritance, 
        //and then according to zonation, and then finally according to multi-role contacts

        //This method filters the minimum necessary contacts by ranking contacts based on proximity and based on responsibility
        //The best contacts per role will be taken


        /**
         * A map of how each contact ranks for a given role
         * @type {[
         *      [
         *          import("./types.js").RoleContact & {proximity: number}  
         *      ]
         * ]}
         */
        const rank_map = [

        ]

        //Fetch all contacts for all roles
        const role_contacts = (await Promise.all(
            data.map(async entry => await this.getCapableContacts({ role: entry.role, zone: entry.zone }))
        ))

        for (let i = 0; i < role_contacts.length; i++) {
            if (role_contacts[i].length === 0) {
                console.warn(`There seems to be no contacts at all capable of granting ${(await this[role_data_controller_symbol].getRole(data[i].role)).label}(${data[i].role}), as far as ${(await this[zonation_data_controller_symbol].getZone(data[i].zone)).label}(${data[i].zone})`)
            }
        }

        //Now in each role, we rank each contact based on proximity
        for (let i = 0; i < role_contacts.length; i++) {
            //To make ranking much easier, we look for contacts that are at proximity zero
            const zero_contacts = role_contacts[i].filter(x => x.zone === data[i].zone)
            if (zero_contacts.length !== 0) {
                //So if that's the case, we simply take away the other contacts because nothing beats zero
                rank_map[i] = zero_contacts

                for (let zer of rank_map[i]) {
                    zer.proximity = 0
                }

            } else {

                //Then let's figure out the proximities of each of the contacts
                rank_map[i] = role_contacts[i]

                rank_map[i] = await Promise.all(
                    rank_map[i].map(
                        async (contact, r) => {
                            //Now, figure out the proximity of this contact
                            return {
                                ...contact,
                                proximity: await this[zonation_data_controller_symbol].distance(contact.zone, data[r].zone)
                            }
                        }
                    )
                )

                //Now eliminate based on proximity, then rank in order of closer proximity
                rank_map[i].filter(x => x.proximity >= 0).sort((a, b) => {
                    return a < b ? -1 : 1
                })

            }
        }





        //Now, eliminate from each role, the contacts that already have substitutes with the same proximity or lower, but have fewer responsbilities

        //So, to make that possible, we first eliminate the contacts that don' have have closest proximity. We know that the contacts with -1 proximity had already been removed
        for (let i = 0; i < rank_map.length; i++) {
            let smallest = undefined
            for (let j = 0; j < rank_map[i].length; j++) {
                smallest ??= rank_map[i][j].proximity
                smallest = Math.min(smallest, rank_map[i][j].proximity)
            }
            rank_map[i] = rank_map[i].filter(x => x.proximity == smallest)
        }


        const count_responsibilities = (userid) => {
            let count = 0;
            for (let row of rank_map) {
                for (let contact of row) {
                    if (contact.userid === userid) {
                        count += 1
                    }
                }
            }
            return count;
        }

        for (let i = 0; i < rank_map.length; i++) {
            //So, if there are more than one contact for the given role, we choose only the contact with the greatest responsibilities

            if (rank_map[i].length > 1) {
                rank_map[i] = [
                    rank_map[i].sort(
                        (a, b) => count_responsibilities(a.userid) > count_responsibilities(b.userid) ? -1 : 1
                    )[0]
                ]
            }

        }


        //Now combine roles to users
        const handled_users = []
        const contacts_flat = rank_map.flat()
        for (let role_row of rank_map) {
            for (let contact of role_row) {
                if (!handled_users.some(x => x.userid === contact.userid)) {

                    handled_users.push(
                        {
                            userid: contact.userid,
                            roles: contacts_flat.filter(x => x.userid === contact.userid).map(c => ({ role: c.role, zone: c.zone }))
                        }
                    )
                }
            }
        }

        return handled_users;


    }


    /**
     * This gets all the users who are contactable within a given zone
     * @param {object} param0 
     * @param {string} param0.role
     * @param {string} param0.zone
     * @param {string} param0.specific_user If specified, only the user's info will be fetched
     * @param {string} param0.userid If specified, checks will be made to see if the user is able to manage role contact persons
     * @returns {Promise<[import("./types.js").RolePlay]>}
     */
    async getUsers({ role, zone, specific_user, userid }) {

        await this.checkDefaultPermissions({ userid, zone })

        const query = {
            role
        }
        if (zone) {
            query.zone = zone
        }
        if (specific_user) {
            query.userid = specific_user
        }
        return await this.collection.find(query).toArray()
    }

    /**
     * This methods adds a contact for a given role
     * The user is specified by the user id
     * @param {object} param0 
     * @param {string} param0.subject
     * @param {string} param0.role
     * @param {string} param0.zone
     * @param {string} param0.userid
     * @returns {Promise<void>}
     */
    async addContact({ subject, role, zone, userid }) {


        await this.checkDefaultPermissions({ userid, zone });

        //Let's check if the user is capable of granting the given role
        if (!await this[role_play_controller_symbol].userCanGrantRole({ userid: subject, role, zone })) {
            const zone_label = (await this[zonation_data_controller_symbol].getZone(zone)).label

            const all_role_data = await this[role_data_controller_symbol].getAll()
            const this_role_data = all_role_data.find(x => x.id === role)
            const supervised_role_example = all_role_data.find(x => [...x.supervised_roles].find(x => x === role))?.label;

            throw new Exception(`The person you are adding as a contact is incapable of granting the role of ${this_role_data?.label}.\nMake sure he plays another role that supervises ${this_role_data.label}, within the ${zone_label}, or a larger zone. ${supervised_role_example ? `For example, you can make him a ${supervised_role_example} for ${zone_label}.\n` : ''}If not, make sure he has the permission to manage ALL roles`)
        }

        const data = { userid: subject, role, zone }
        await this.collection.updateOne({ userid: subject, zone, role }, { $set: { ...data } }, { upsert: true })
    }


    /**
     * This method checks if the user even has the permission to manage contacts in the first place.
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.zone
     * @returns {Promise<void>}
     */
    async checkDefaultPermissions({ userid, zone }) {
        if (userid) {
            //Not just anyone should have the right to add contacts.
            await this[permission_grants_controller_symbol].userPermitted(
                {
                    userid,
                    intent: {
                        freedom: 'use',
                        zones: [zone]
                    },
                    permissions: ['permissions.modernuser.role.contacts.manage']
                }
            );
        }
    }

    /**
     * This method removes a contact for a role in a zone
     * @param {object} param0 
     * @param {string} param0.subject
     * @param {string} param0.role
     * @param {string} param0.zone
     * @param {string} param0.userid If specified, checks will be made to ensure that this user has the privileges to manage role contacts
     * @returns {Promise<void>}
     */
    async removeContact({ subject, role, zone, userid }) {

        //TODO: When a user is removed from a role by the roleplay controller, the rolecontact controller should remove him for the contacts he cannot play


        await this.checkDefaultPermissions({ userid, zone });

        //The reason we are checking for the presence of these strings is because it is deadly to have an empty userid or an empty role name
        //For example, empty userid will remove a given role from all users
        //An empty role id will delete all roles from the user, or remove the wrong role from the user
        checkArgs(arguments[0], {
            subject: 'string',
            role: 'string',
            zone: 'string'
        })

        await this.collection.deleteOne({ userid: subject, role, zone })
    }

    /**
     * This removes all the contacts of a role, everywhere
     * @param {object} param0 
     * @param {string} param0.role
     * @returns {Promise<void>}
     */
    async removeAllContacts({ role }) {
        await this.collection.deleteMany({ role })
    }

    /**
     * This method sets the zone to which a role grant can be exercised
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.role
     * @param {string} param0.zone
     * @returns {Promise<void>}
     */
    async setZone({ userid, role, zone }) {

        await this.collection.updateOne(
            {
                userid,
                role
            },
            {
                $set: {
                    zone
                }
            }
        )
    }

    /**
     * This is an internal method used to prepare collections to be used by the module
     * @param {import("./types.js").RoleContactCollection} collections 
     */
    static async prepareCollections(collection) {
        await collection.createIndex({ userid: 1, role: 1, zone: 1 }, { unique: true })
    }

}


/**
 * @type {[import("faculty/modernuser/permission/data/types.js").PermissionData]}
 */
export let contact_permissions = [
    {
        name: 'permissions.modernuser.role.contacts.manage',
        label: `Manage contact persons for roles`,
        inherit: ['permissions.modernuser.profiles.search']
    }
]