/**
 * Copyright 2022 HolyCorn Software
 * Adapted from The Donor Forms Project
 * 
 * The CAYOFED People System
 * 
 * This widget allows an authorized personnel to manage the roles of others in the system
 */


import muserRpc from "../../lib/rpc.mjs";
import RolesListings from "./widgets/listings/widget.mjs";
import NewRolePopup from "./widgets/new.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs"
import BrandedBinaryPopup from "/$/system/static/html-hc/widgets/branded-binary-popup/widget.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class RoleDataManager extends Widget {

    constructor() {
        super();

        this.html = hc.spawn({
            classes: ['hc-cayofedpeople-roles-data-manager'],
            innerHTML: `
                <div class='container'>

                    <div class='top-section'>
                        <div class='title'>Roles Data</div>
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

        /** @type {RolesListings} */ this.listings
        this.widgetProperty({
            selector: '.hc-cayofedpeople-roles-data-listings',
            parentSelector: '.container >.listings',
            childType: 'widget',
            property: 'listings',
            transforms: {
                /**
                 * 
                 * @param {RolesListings} widget 
                 * @returns 
                 */
                set: (widget) => {
                    return widget.html
                },
                get: (html) => html?.widgetObject
            }
        });

        this.listings = new RolesListings()

        /** @type {[ActionButton]} */ this.actions
        this.pluralWidgetProperty({
            selector: '.hc-action-button',
            property: 'actions',
            parentSelector: '.top-section >.actions',
            childType: 'widget',
        });

        let createNew = new ActionButton({
            content: 'New Role',
            onclick: () => {
                let popup = new NewRolePopup()
                popup.show()
                popup.addEventListener('create', (event) => {
                    this.listings.itemsData.push({
                        ...event.detail,
                        super_roles: []
                    })
                })
            }
        });

        let deleteMany = new ActionButton({
            content: 'Delete Roles'
        })

        this.actions.push(
            createNew,
            deleteMany
        );

        //The logic of mark and delete
        this.listings.addEventListener('checked-state-change', () => {
            deleteMany.state = this.listings.checked_items.length === 0 ? 'disabled' : 'initial'
        })

        deleteMany.state = 'disabled'

        deleteMany.onclick = async () => {
            deleteMany.state = 'waiting'
            const selected = this.listings.checked_items;

            /** 
             * @param {[string]} items
             * @returns {string} 
             */
            const english_to_string = (items) => {
                return items.map((x, i, arr) => i == arr.length - 1 && i !== 0 ? `and ${x}` : x) //Place an 'and' before the last item
                    .join(`, `) //Separating the items with a comma
            }

            // Get all items to be delete and construct and English phrase with their names embedded
            let all_item_labels = english_to_string(this.listings.itemsData.filter(x => selected.findIndex(sel => sel === x.id) != -1).map(x => x.label))


            const dependent_roles = this.listings.itemsData.filter(item => {
                return item.super_roles.findIndex(x => x.id == selected.findIndex(sel => sel !== x.id) !== -1) !== -1
            });

            let dependent_roles_labels = english_to_string(dependent_roles.map(x => x.label))

            let popup = new BrandedBinaryPopup({
                title: `Do you want to delete them ?`,
                question: `Do you want to delete ${all_item_labels}? <br>${dependent_roles_labels.length > 0 ? `If you do so, it will affect the way ${dependent_roles_labels} function` : ''}`,
                positive: 'Go ahead',
                negative: 'Cancel',
                execute: async () => {
                    let processed_count = 0;
                    let errors = []

                    await new Promise((resolve, reject) => {

                        for (let role of selected) {
                            muserRpc.modernuser.role.data.delete({ id: role })
                                .then(() => {
                                    this.listings.itemsData = this.listings.itemsData.filter(x => x.id !== role)
                                }).catch(e => {
                                    errors.push({ role, error: e })
                                }).finally(() => {
                                    processed_count += 1
                                    if (processed_count >= selected.length) {
                                        resolve()
                                    }
                                })

                        }

                    })

                    if (errors.length > 0) {
                        let error_string = errors.map(item => {
                            return `Could not delete ${this.listings.itemsData.find(x => x.id === item.role).label} because <br>${item.error.message}${item.error.code ? `<br>code: ${item.error.code}` : ''}${item.error.id ? `<br>id: ${item.error.id}` : ''}`
                        }).join('<br><br>').replaceAll(/<br>/g, `\n<br>`)
                        throw new Error(error_string)
                    }
                }
            });

            popup.show();

            popup.addEventListener('hide', () => deleteMany.state = 'initial')
        }

    }

}