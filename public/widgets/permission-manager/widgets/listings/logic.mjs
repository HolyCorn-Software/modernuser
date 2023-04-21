/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module contains the necessary logic for managing the permission-manager listing
 */

import { fetchZones } from "../../../zonation-manager/util.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs"


/**
 * This method fetchs all the permissions 
 * 
 * @returns {Promise<import("./types.js").FrontendUserPermissions[]>}
 */
async function fetch_items() {
    let data = await hcRpc.modernuser.permissions.data.getAll()

    let grants = await hcRpc.modernuser.permissions.grants.getAll()

    let roles = await hcRpc.modernuser.role.data.getAll()

    let zones = await fetchZones()

    /** @type {import("./types.js").FrontendUserPermissions[]} */
    let user_permissions = []

    let sorted_subjects = []




    //After fetching the permission grants, now we convert it to the format understood by the frontend

    /**
     * This method returns the label of subject, whether a subject is a user or a role
     * @param {string} subject 
     * @param {modernuser.permission.SubjectType} subject_type 
     * @returns {Promise<string>}
     */
    const get_subject_label = async (subject, subject_type) => {
        if (subject_type === 'role') {
            return roles.find(x => x.id === subject).label
        }
        return await hcRpc.modernuser.profile.getLabel(subject)
    }

    for (let grant of grants) {

        if (sorted_subjects.findIndex(x => x === grant.subject) !== -1) {
            continue;
        }

        let all_grants_of_subject = grants.filter(x => x.subject === grant.subject);

        /** @type {import("./types.js").FrontendUserPermissions} */
        let subject_frontend_permissions = {
            subject: {
                id: grant.subject,
                type: grant.subject_type,
                label: await get_subject_label(grant.subject, grant.subject_type)
            },
            permissions: []
        }

        for (let subject_grant of all_grants_of_subject) {
            subject_frontend_permissions.permissions.push(
                {
                    label: data.find(x => x.name === subject_grant.permission)?.label || "Invalid Permission",
                    name: subject_grant.permission,
                    expires: subject_grant.expires,
                    freedom: subject_grant.freedom,
                    time: subject_grant.time,
                    zone: (() => {
                        if (subject_grant.subject_type === 'role') {
                            return {}
                        }

                        return {
                            id: subject_grant.zone,
                            label: zones.find(x => x.id === subject_grant.zone)?.label
                        }
                    })()
                },


            )
        }

        sorted_subjects.push(grant.subject)

        user_permissions.push(subject_frontend_permissions)

    }


    return user_permissions

}


export default {
    fetch_items
}