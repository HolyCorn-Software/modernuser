/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This module controls the logic of storing, retrieving and updating user profiles
 * The profile is just basic. id, names and email
 */

import shortUUID from "short-uuid"


let global_only_one_profile = undefined;


const faculty = FacultyPlatform.get()

const instance = Symbol()

export default class UserProfileController {

    /**
     * 
     * @param {object} param0 
     * @param {modernuser.profile.UserProfileCollection} param0.collection
     */
    constructor({ collection }) {

        /** @type {modernuser.profile.UserProfileCollection} */
        this[collection_symbol] = collection
        UserProfileController[instance] = this

        UserProfileController.prepareCollection(collection)
    }

    /**
     * @readonly
     * @returns { UserProfileController}
     */
    static get instance() {
        return this[instance]
    }

    /**
     * This retrieves the profile of a user
     * @param {object} param0 
     * @param {string} param0.id
     * @returns {Promise<modernuser.profile.UserProfileData>}
     */
    async getProfile({ id }) {
        let profile = await this[collection_symbol].findOne({ id })
        if (!profile) {
            throw new Exception(`The user ${id ? JSON.stringify(id) : id}, was not found.`)
        }
        delete profile._id;
        return profile;
    }

    /**
     * This method returns the profiles of all users whose ids are specified
     * @param {string[]} ids 
     * @returns {Promise<modernuser.profile.UserProfileData[]>}
     */
    async getProfiles(ids) {
        return await this[collection_symbol].find({ id: { $in: ids } }).toArray()
    }



    /**
     * 
     * @param {object} param0 
     * @param {string} param0.id
     * @param {modernuser.profile.MutableUserProfileData} param0.profile
     * @returns {Promise<void>}
     */
    async setProfile({ id, profile }) {
        /** @type {import('mongodb').UpdateFilter<modernuser.profile.MutableUserProfileData>['$set']} */
        let query = {}
        /** @type {(keyof modernuser.profile.MutableUserProfileData)[]} */
        const keys = ['icon', 'label', 'meta']
        const illegalRegExp = /[<>.+-:'"&^$~`]/

        // TODO: Put in place a mechanism for protecting meta data fields
        for (let key of keys) {
            if (typeof profile[key] !== 'undefined') {
                query[key] = profile[key]
                if (key == 'label' && illegalRegExp.test(profile[key])) {
                    throw new Exception(`Your profile name contains illegal characters`)
                }
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
     * @param {Omit<modernuser.profile.UserProfileData, "id"|"time">} data
     * @returns {Promise<string>}
     */
    async createProfile(data) {

        const id = shortUUID.generate();

        data ||= {}

        await this[collection_symbol].insertOne({
            id,
            time: Date.now(),
            ...soulUtils.pickOnlyDefined(data, ['label', 'icon', 'tags'])
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
     * This method tells us if theres no profile in the system
     * @returns {Promise<boolean>}
     */
    async noProfileExists() {
        return ((await this[collection_symbol].find({}, { limit: 2 }).toArray()).length || 0) == 0
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
     * @param {string[]} restriction If specified, only users whose user ids belong to this list will be searched
     */
    async fetchUsers(filter = "", restriction) {

        if (filter.length < 2) {
            return [];
        }


        //Clean the input
        const parts = filter.split(/[^A-Za-z0-9]/);


        /**
         * @type {modernuser.profile.UserProfileData>}
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
     * This method searches for users whose accounts have the given tags
     * @param {modernuser.profile.UserProfileTagsSearch} tags 
     */
    async *searchUsersByTags(tags) {
        soulUtils.checkArgs(tags, 'object', 'tags')
        /** @type {Parameters<this[collection_symbol]['find']>['0']} */
        const query = {}

        for (const key in tags) {
            query[`tags.${key}`] = (typeof tags[key].$exists) != 'undefined' ? { $exists: tags[key].$exists } : tags[key].$value
        }

        for await (const item of this[collection_symbol].find(query)) {
            delete item._id
            yield item
        }

    }

    /**
     * This method puts the collection in order by creating the necessary indexes
     * @param {modernuser.profile.UserProfileCollection} collection 
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