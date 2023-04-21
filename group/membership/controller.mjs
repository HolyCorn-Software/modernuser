/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * 
 * The Faculty of Association
 * The association module (simply determines which user is which person, and which user belongs to which group)
 * 
 */



export default class GroupMembershipController {

    /**
     * 
     * @param {object} param0 
     * @param {import("./types.js").GroupMembershipCollection} param0.collection
     */
    constructor({ collection }) {
        
        GroupMembershipController.prepareCollections(collection);
        /**  @type {import("./types.js").GroupMembership} */
        this.collection = collection
    }

    /**
     * This method gets all the groups the user belongs to
     * @param {string} userid The id of the user
     * @returns {Promise<string[]>}
     */
    async getUserGroups(userid) {
        const entries = await this.collection.find({ userid }).toArray()

        if (entries) {
            return entries.map(x => x.group)
        } else {
            return []
        }
    }

    /**
     * This methods adds a user to a group
     * The user is specified by the user id
     * The group specified by the group name
     * @param {object} param0 
     * @returns {Promise<void>}
     */
    async addUserToGroup({ userid, group }) {
        const data = { userid, group }
        //Create a database record to signify the user's membership in the group
        //Create the record such that no issues should occur with duplicates
        await this.collection.updateOne(data, data, { upsert: true })
    }


    /**
     * This method removes a user from a group
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.group
     * @returns {Promise<void>}
     */
    async removeUserFromGroup({ userid, group }) {

        //The reason we are checking for the presence of these strings is because it is deadly to have an empty userid or an empty group name
        //For example, empty userid will remove the user from all his groups, or an innocent user from the group
        //An empty group id will delete all users from the group, or remove the user from the wrong group
        soulUtils.checkArgs(arguments[0], {
            userid: 'string',
            group: 'string'
        })

        await this.collection.deleteOne({ userid, group })
    }
    

    /**
     * This method checks if a user belongs to a given group
     * @param {object} param0 
     * @param {string} param0.userid The id of the user
     * @param {string} param0.group The name of the group
     * @returns {Promise<boolean>}
     */
    async userBelongsToGroup({ userid, group }) {
        return (await this.collection.findOne({ userid, group })) !== null
    }

    /**
     * This is an internal method used to prepare collections to be used by the association manager
     * @param {import("./types.js").AssociationManagerCollections} collections 
     */
    static async prepareCollections(collection) {
        await collection.createIndex({ userid: 1, group: 1 }, { unique: true })
    }

}