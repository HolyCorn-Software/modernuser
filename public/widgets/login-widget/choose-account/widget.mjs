/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This widget allows the user to choose from a list of user accounts. He chooses the one he wants to log in to.
 * 
 */

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs"
import ChooseAccountContent from "./content.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs";
import HCTSBrandedPopup from "/$/system/static/html-hc/widgets/branded-popup/popup.mjs";



export default class ChooseAccount extends HCTSBrandedPopup {

    /**
     * 
     * @param {object} login_data
     * @param {object} login_data.login 
     * @param {string} login_data.login.plugin
     * @param {object} login_data.login.data
     * @param {{active: boolean, profile: modernuser.profile.UserProfileData}[]} login_data.profiles
     */
    constructor(login_data) {
        super()

        /** @type {function(("complete"), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener

        const content_widget = new ChooseAccountContent();
        this.content = content_widget.html

        content_widget.addEventListener('complete', () => {
            this.dispatchEvent(new CustomEvent('complete'))
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

    /**
     * The account that was finally selected
     */
    get value() {
        return this.content.widgetObject.selected_account
    }


}

