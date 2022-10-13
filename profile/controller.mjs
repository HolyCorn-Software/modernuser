/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This module controls the logic of storing, retrieving and updating user profiles
 * The profile is just basic. id, names and email
 */

import shortUUID from "short-uuid"
import { pickOnlyDefined } from "../../../system/util/util.js";
import { Exception } from "../../../system/errors/backend/exception.js"
import { FacultyPlatform } from "../../../system/lib/libFaculty/platform.mjs";


let global_only_one_profile = undefined;


const faculty = FacultyPlatform.get()

export default class UserProfileController {

    /**
     * 
     * @param {object} param0 
     * @param {import("./types.js").UserProfileCollection} param0.collection
     */
    constructor({ collection }) {

        /** @type {import("./types.js").UserProfileCollection} */
        this[collection_symbol] = collection


        UserProfileController.prepareCollection(collection)
    }

    /**
     * This retrieves the profile of a user
     * @param {object} param0 
     * @param {string} param0.id
     * @returns {Promise<import("./types.js").UserProfileData>}
     */
    async getProfile({ id }) {
        let profile = await this[collection_symbol].findOne({ id })
        if (!profile) {
            throw new Exception(`The user was not found.`)
        }
        delete profile._id;
        return profile;
    }

    /**
     * This method returns the profiles of all users whose ids are specified
     * @param {[string]} ids 
     * @returns {Promise<[import("./types.js").UserProfileData]>}
     */
    async getProfiles(ids) {
        return await this[collection_symbol].find({ id: { $in: ids } }).toArray()
    }



    /**
     * 
     * @param {object} param0 
     * @param {string} param0.id
     * @param {{label: string, icon:string}} param0.profile
     * @returns {Promise<void>}
     */
    async setProfile({ id, profile }) {
        let query = {}
        for (let key of ['icon', 'label']) {
            if (typeof profile[key] !== 'undefined') {
                query[key] = profile[key]
            }
        }

        await this[collection_symbol].updateOne(
            { id },
            {
                $set: query
            }
        )
    }


    /**
     * Creates a fresh new profile
     * @param {Omit<import("./types.js").UserProfileData, "id"|"time">} data
     * @returns {Promise<string>}
     */
    async createProfile(data) {

        const id = shortUUID.generate();

        await this[collection_symbol].insertOne({
            id,
            time: Date.now(),
            ...pickOnlyDefined(data || {}, ['label', 'icon'])
        })

        //Now, if this is the first profile, then let the other components know. They could need this information, for example, to automatically grant permissions
        if (await this.onlyOneProfileExists()) {
            faculty.connectionManager.events.emit(`${faculty.descriptor.name}.profile-genesis`, id)
        }
        return id;
    }


    /**
     * This method checks whether only one profile exists in the system
     * @param {object} param0 
     * @returns {Promise<boolean>}
     */
    async onlyOneProfileExists() {

        if (typeof global_only_one_profile !== 'undefined') {
            return global_only_one_profile
        }

        return global_only_one_profile = ((await this[collection_symbol].find({}, { limit: 2 }).toArray()).length || 0) < 2

    }

    /**
     * This method is used to delete a profile
     * @param {string} id 
     * @returns {Promise<void>}
     */
    async deleteProfile(id) {
        const profileData = await this[collection_symbol].findOne({ id })
        if (!profileData) {
            return;
        }
        //Let the world know that a profile has been deleted
        faculty.events.emit(`${faculty.descriptor.name}.profile-delete`, id, profileData);

        this[collection_symbol].deleteOne({ id })
    }


    /**
     * Fetches all users in the database according to a particular filter
     * @param {string} filter 
     * @param {[string]} restriction If specified, only users whose user ids belong to this list will be searched
     */
    async fetchUsers(filter = "", restriction) {

        if (filter.length < 2) {
            return [];
        }


        //Clean the input
        const parts = filter.split(/[^A-Za-z0-9]/);


        /**
         * @type {import('mongodb').Filter<import("./types.js").UserProfileData>}
         */
        const query = {
            label: {
                $regex: new RegExp(parts.join('.*'), 'i')
            },
        };

        if (restriction && restriction.length > 0) {
            query.id = {
                $in: [...restriction]
            }
        }

        let users = await this[collection_symbol].find(query).toArray();

        return users;
    }

    /**
     * This method puts the collection in order by creating the necessary indexes
     * @param {import("./types.js").UserProfileCollection} collection 
     */
    static prepareCollection(collection) {
        collection.createIndex({ id: 1 }, { unique: true }).catch(e => {
            console.warn(`Failed to perform necessary operation on a collection meant to store role info `, e)
        });

        collection.createIndex({ label: "text" }).catch(e => {
            console.warn(`Failed to perform necessary operation on a collection meant to store role info `, e)
        });


    }
}



const collection_symbol = Symbol(`UserProfileController.prototype.collection`)