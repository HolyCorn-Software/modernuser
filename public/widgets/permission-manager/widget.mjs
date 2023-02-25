/**
 * Copyright 2022 HolyCorn Software
 * Adapted from The Donor Forms Project
 * 
 * The CAYOFED People System
 * 
 * This widget allows an authorized personnel to manage the permissions of 
 */


import muserRpc from "../../lib/rpc.mjs";
import PermissionListings from "./widgets/listings/widget.mjs";
import { PermissionGrantPopup } from "./widgets/new/widget.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs"
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class PermissionsManager extends Widget {

    constructor() {
        super();

        this.html = hc.spawn({
            classes: ['hc-cayofedpeople-permissions-manager'],
            innerHTML: `
                <div class='container'>

                    <div class='top-section'>
                        <div class='title'>Permissions</div>
                        <div class='actions'>

                        </div>
                    </div>

                    <div class='listings'>

                    </div>
                
                </div>
            `
        });

        /** @type {string} */ this.title
        this.htmlProperty('.top-section >.title', 'title', 'innerHTML')

        /** @type {PermissionListings} */ this.listings
        this.widgetProperty({
            selector: '.hc-donorforms-admin-payment-listings',
            parentSelector: '.container >.listings',
            childType: 'widget',
            property: 'listings',
            transforms: {
                /**
                 * 
                 * @param {PermissionListings} widget 
                 * @returns 
                 */
                set: (widget) => {
                    //TODO: Proper clean up
                    widget.addEventListener('show-detail-popup', (e) => {
                        this.dispatchEvent(new CustomEvent('show-detail-popup', { detail: e.detail }))
                    })
                    return widget.html
                },
                get: (html) => html?.widgetObject
            }
        });

        this.listings = PermissionListings.testWidget

        /** @type {[ActionButton]} */ this.actions
        this.pluralWidgetProperty({
            selector: '.hc-action-button',
            property: 'actions',
            parentSelector: '.top-section >.actions',
            childType: 'widget',
        });

        let createNew = new ActionButton({
            content: 'Grant New',
            onclick: () => {
                let popup = new PermissionGrantPopup()
                popup.show()


                popup.addEventListener('create', async () => {
                    try {
                        const permissionData = await muserRpc.modernuser.permissions.data.getPermissionInfo({ name: popup.value.permissions[0].name })
                        const newValue = popup.value
                        newValue.permissions[0].label = permissionData.label
                        newValue.permissions[0].name = permissionData.name

                        //In the case where a permission added to a user's list of permission...
                        const existing = this.listings.itemsData.find(x => x.subject.id === popup.value.subject.id)
                        if (existing) {
                            existing.permissions.push(newValue)
                            this.listings.itemsData = [...this.listings.itemsData]
                        } else {
                            //The case where the user to whom the permission was granted was not in the list
                            this.listings.itemsData.push(newValue)

                        }
                    } catch (e) {
                        handle(e)
                    }
                })
            }
        });

        let deleteMany = new ActionButton({
            content: 'Revoke Many'
        })
        this.actions.push(
            createNew,
            deleteMany
        );

    }

}