/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module contains the main logic for the role-play-manager widget
 * 
 */

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs"
import RolePlayManager from "./widget.mjs";
import AddUserPopup from './add-user-popup.mjs'
import { handle } from "/$/system/static/errors/error.mjs";
import BrandedBinaryPopup from "/$/system/static/html-hc/widgets/branded-binary-popup/widget.mjs";
import * as zm_utils from '../zonation-manager/util.mjs'



/**
 * This returns data that can be used by the widget
 * 
 * @param {modernuser.role.data.Role[]} role_data
 * @param {import("faculty/modernuser/role/membership/types.js").RolePlay[]} role_play
 * @param {RolePlayManager} widget
 * 
 * @returns {[import("/$/system/static/html-hc/widgets/file-explorer/types.js").DirectoryData]}
 */
function draw_actions_for_all_roles(role_data0, role_play0, widget) {
    /**
     * 
     * @param {any} x 
     * @returns {typeof x}
     */
    const copy = (x) => JSON.parse(JSON.stringify(x))

    /** @type {modernuser.role.data.Role[]} */
    const role_data = copy(role_data0)

    /** @type {import("faculty/modernuser/role/membership/types.js").RolePlay[]} */
    const role_play = copy(role_play0)

    /**
     * @type {import("/$/system/static/html-hc/widgets/file-explorer/types.js").DirectoryData[]}
     */
    let final = role_data.map(rd => {


        widget.explorer.waitTillPath(rd.id).then(() => {
            widget.explorer.statedata.loading_items.push(rd.id)

            draw_people_actions(rd, widget).finally(() => {
                setTimeout(() => {
                    widget.explorer.statedata.loading_items = widget.explorer.statedata.loading_items.filter(x => x !== rd.id)
                }, 100)
            })
        })

        return {
            id: rd.id,
            label: rd.label,
            parent: ''
        }
    });


    return final;
}



/**
 * This method gets the items that are immediately located underneath a role
 * @param {modernuser.role.data.Role} role_item 
 * @param {RolePlayManager} widget
 * @returns {Promise<void>}
 */
async function draw_people_actions(role_item, widget) {


    const zonation_info = await zm_utils.fetchZones()

    for (let zone of zonation_info) {

        let path_id = `${role_item.id}$${zone.id}`

        widget.explorer.statedata.items.push({
            id: path_id,
            label: zone.label,
            parent: zone.superzone === '' ? role_item.id : `${role_item.id}$${zone.superzone}`,
            icon: new URL('../zonation-manager/res/zone.png', import.meta.url).href
        });


        widget.explorer.waitTillPath(path_id).then(async () => {

            //Keep the section for users of the role of the this zone waiting
            widget.explorer.statedata.loading_items.push(path_id)


            try {


                //Now fetch the users of the role in this zone

                const users = await hcRpc.modernuser.role.role_play.getUsersInfoFormatted({
                    role: role_item.id,
                    zone: zone.id
                });


                users.forEach((usr) => {

                    add_user_action(
                        {
                            path: path_id,
                            profile: usr.profile,
                            role: role_item,
                            zone: zone,
                            widget
                        }
                    )
                })


            } catch (e) {
                handle(e)
            }

            widget.explorer.statedata.loading_items = widget.explorer.statedata.loading_items.filter(x => x !== path_id)
        })
    }

    const draw_actions = () => {

        widget.explorer.stageActions.push({
            label: `Add Someone`,
            locations: 'global',
            onclick: () => {


                const { current_path } = widget.explorer.statedata

                const zone_id = current_path.split('$')[1]
                const zone = zonation_info.filter(z => z.id === zone_id)[0]

                let popup = new AddUserPopup({
                    roledata: role_item,
                    zone: zone.id
                })

                popup.addEventListener('add', async () => {
                    //Fetch user info
                    let [user] = await hcRpc.modernuser.role.role_play.getUsersInfoFormatted({ role: role_item.id, zone: zone.id, specific_user: popup.value.userid })


                    add_user_action(
                        {
                            path: current_path,
                            profile: user.profile,
                            role: role_item,
                            zone: zone,
                            widget
                        }
                    );

                    setTimeout(() => popup.hide(), 1300)

                })

                popup.show()
            }
        })
    }

    widget.explorer.addEventListener('draw', () => {

        const { current_path: path } = widget.explorer.statedata;

        //Draw the actions only for paths that currespond to a role or a zone
        if (zonation_info.findIndex(z => `${role_item.id}$${z.id}` == path) == -1) {

            return
        }

        if (path === role_item.id) {
            return;
        }

        draw_actions()
    })

}


/**
 * This method returns the data that can be used to add a user to the explorer widget
 * @param {object} param0 
 * @param {{label: string, id: string}} param0.role
 * @param {{id: string, label:string}} param0.zone
 * @param {string} param0.path
 * @param {modernuser.profile.UserProfileData} param0.profile
 * @param {RolePlayManager} param0.widget
 * @returns {import("/$/system/static/html-hc/widgets/file-explorer/types.js").DirectoryData}
 */
function add_user_action({ path, profile, role, zone, widget }) {

    const path_id = `${role.id}$${zone.id}$${profile.id}`

    widget.explorer.deleteItem(path_id)

    widget.explorer.statedata.items.push(
        {
            label: profile.label,
            id: path_id,
            parent: path,
            icon: profile.icon,
            navigable: false,
            actions: [
                {
                    label: 'Remove',
                    onclick: () => {
                        let yes_no_popup = new BrandedBinaryPopup({
                            title: `Removing the role`,
                            question: `${profile.label} will no longer be ${role.label} in ${zone.label}. Is that okay?`,
                            positive: 'Yes',
                            negative: 'No',
                            execute: async () => {
                                await hcRpc.modernuser.role.role_play.removeRoleFromUser(
                                    {
                                        subject: profile.id,
                                        role: role.id,
                                        zone: zone.id
                                    }
                                )
                                widget.explorer.statedata.items = widget.explorer.statedata.items.filter(x => x.id !== path_id)
                            }
                        });

                        yes_no_popup.show()
                    }
                }
            ]
        }
    )

}



export default {
    draw_actions_for_all_roles
}