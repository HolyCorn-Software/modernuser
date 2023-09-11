/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module contains the logic of managing which user or group of users belong to a zone
 */



export default class ZoneMembershipController {


    /**
     * 
     * @param {object} param0 
     * @param {modernuser.zonation.ZoneMembershipCollection param0.collection
     */
    constructor({ collection }) {

        ZoneMembershipController.processCollection(collection);

        /** @type {modernuser.zonation.ZoneMembershipCollection */
        this[collection_symbol] = collection;

    }

    /**
     * Adds a subject to a zone. No problem if the subject is already in the zone.
     * 
     * If the subject is in a different zone, it will be removed
     * @param {object} param0 
     * @param {string} param0.subject
     * @param {string} param0.zone
     * @returns {Promise<void>}
     */
    async add({ subject, zone }) {
        await this[collection_symbol].updateOne({ subject },
            {
                $set: {
                    subject,
                    zone,
                    time: Date.now()
                }
            },
            { upsert: true }
        );
    }

    /**
     * This removes information about the subject's zone
     * @param {object} param0 
     * @param {string} param0.subject
     * 
     * @returns {Promise <void>}
     */
    async remove({ subject }) {
        await this[collection_symbol].deleteOne({ subject })
    }


    /**
     * This method is called on the collection passed to the ZonationMembershipController.
     * 
     * This method enforces constraints on the collection
     * @param {modernuser.zonation.ZoneMembershipCollection collection 
     * 
     * @returns {Promise<void>}
     */
    static async processCollection(collection) {
        await collection.createIndex({ subject: 1 }, { unique: true })
    }



}



const collection_symbol = Symbol(`ZoneMembershipController.prototype.collection`)