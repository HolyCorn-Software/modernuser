/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * 
 * This popup-based widget allows a user to rename an item
 */

import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs"
import HCTSBrandedPopup from "/$/system/static/html-hc/widgets/branded-popup/popup.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import *as zm_utils from '../util.mjs'
import { handle } from "/$/system/static/errors/error.mjs";


hc.importModuleCSS(import.meta.url);

export default class NavigationItemDeletePopup extends HCTSBrandedPopup {

    /**
     * 
     * @param {modernuser.zonation.ZoneData data 
     */
    constructor(data) {
        super();

        this.content = hc.spawn({
            classes: ['hc-cayofedpeople-zonation-manager-delete-popup'],
            innerHTML: `
                <div class='prompt'>Do you want to delete ${data.label} ?</div>
                <div class='actions'></div>
            `
        });

        /** @type {ActionButton[]} **/ this.actions
        this.pluralWidgetProperty({
            selector: '.hc-action-button',
            property: 'actions',
            parentSelector: '.hc-cayofedpeople-zonation-manager-delete-popup >.actions',
            childType: 'widget'
        });


        /** @type {function(('complete'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener


        let yes_button;
        this.actions.push(
            yes_button = new ActionButton({
                content: 'Yes',
                onclick: () => {
                    yes_button.state = 'waiting'

                    zm_utils.deleteZone(data.id).then(() => {
                        yes_button.state = 'success'
                        setTimeout(() => this.hide(), 1000);
                        this.dispatchEvent(new CustomEvent('complete'))
                    }).catch(e => {
                        handle(e)
                        yes_button.state = 'initial'
                    })
                }
            }),



            new ActionButton({
                content: 'No',
                onclick: () => this.hide()
            })
        )


        this.html.classList.add('hc-cayofedpeople-zonation-manager-popup')


    }

}