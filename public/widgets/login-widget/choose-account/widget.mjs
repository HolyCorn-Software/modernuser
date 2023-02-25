/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This widget allows the user to choose from a list of user accounts. He chooses the one he wants to log in to.
 * 
 */

import muserRpc from "../../../lib/rpc.mjs";
import ChooseAccountContent from "./content.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs";
import HCTSBrandedPopup  from "/$/system/static/html-hc/widgets/branded-popup/popup.mjs";



export default class ChooseAccount extends HCTSBrandedPopup {

    /**
     * 
     * @param {object} login_data
     * @param {object} login_data.login 
     * @param {string} login_data.login.plugin
     * @param {object} login_data.login.data
     * @param {[{active: boolean, profile: import("faculty/modernuser/profile/types.js").UserProfileData}]} login_data.profiles
     */
    constructor(login_data) {
        super()

        /** @type {function(("complete"), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener

        const content_widget = new ChooseAccountContent();
        this.content = content_widget.html

        content_widget.addEventListener('complete', () => {

            /** @type {ActionButton} */
            const continue_button = content_widget.actions[0].widgetObject

            continue_button.state = 'waiting'
            
            muserRpc.modernuser.authentication.advancedLogin({
                ...login_data.login,
                userid: content_widget.selected_account
            }).then(() => {
                continue_button.state = 'success'
                setTimeout(()=>{
                    this.dispatchEvent(new CustomEvent('complete'))
                }, 1000);
            }).catch(e => {
                handle(e)
                continue_button.state = 'initial'
            })
            
        });

        content_widget.accounts = login_data.profiles.map(profile => {
            return {
                active: profile.active,
                image: profile.profile.icon,
                label: profile.profile.label,
                time: profile.profile.time,
                userid: profile.profile.id
            }
        })

    }


}

