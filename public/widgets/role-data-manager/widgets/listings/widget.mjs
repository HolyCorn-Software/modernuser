/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * Adapated from the Donor Forms Project
 * 
 * This widget is the main widget of it's parent (roles-data-manager). 
 * It contains a list of all role entries
 */

import RolesListing from "./entry.mjs";
import logic from "./logic.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import { Checkbox } from "/$/system/static/lib/hc/checkbox/checkbox.mjs";
import { hc } from "/$/system/static/lib/hc/lib/index.js";
import { Widget } from "/$/system/static/lib/hc/lib/widget.js";


export default class RolesListings extends Widget {


    constructor() {
        super();

        this.html = hc.spawn({
            classes: ['hc-cayofedpeople-roles-data-listings'],
            innerHTML: `
                <table class='container'>
                    <thead>
                        <tr class='headers'>
                            <td class='checkbox'></td>
                            <!-- The other headers go here. Such as Role, ID ... -->
                        </tr>
                    </thead>

                    <tbody>
                    </tbody>
                    
                </table>
            `
        });


        /** @type {function(('checked-state-change'), function( CustomEvent<>), AddEventListenerOptions)} */ this.addEventListener


        /** @type {[import("./types.js").FrontendRoleData]} */ this.itemsData

        this.pluralWidgetProperty({
            selector: '.hc-cayofedpeople-roles-listings-item',
            parentSelector: '.container >tbody',
            property: 'itemsData',
            immediate: true,
            transforms: {
                /**
                 * 
                 * @param {import("./types.js").FrontendRoleData} data 
                 */
                set: (data) => {
                    let widget = new RolesListing(data, this);

                    widget.checkbox.addEventListener('change', () => {
                        this.dispatchEvent(new CustomEvent('checked-state-change'))
                    })

                    return widget.html
                },
                /** @returns {import("./types.js").FrontendRoleData} */
                get: (html) => {
                    /** @type {RolesListing} */
                    const widget = html?.widgetObject //TODO: Work on this
                    return widget?.data

                }
            }
        });


        /** @type {[RolesListing]} */ this.itemWidgets
        this.pluralWidgetProperty({
            selector: '.hc-cayofedpeople-roles-listings-item',
            parentSelector: '.container >tbody',
            childType: 'widget',
            property: 'itemWidgets',
            immediate: true,
        });

        /** @type {[string]} */ this.checked_items
        Reflect.defineProperty(this, 'checked_items', {
            get: () => this.itemWidgets.filter(x => x.checkbox.checked).map(x => x.data.id),
            /** @param {[string]} array */
            set: (array) => {
                const widgets = this.itemWidgets;

                for (let item_id of array) {
                    const widget = widgets.filter(w => w.id === item_id)[0]
                    if (widget) {
                        widget.checkbox.checked = true
                    }
                }
            },
            enumerable: true,
            configurable: true
        })

        /** @type {Checkbox} */ this.mainCheckbox
        this.widgetProperty({
            selector: '.hc-uCheckbox',
            childType: 'widget',
            property: 'mainCheckbox',
            parentSelector: '.container .headers .checkbox'
        });

        this.mainCheckbox = new Checkbox()


        /** @type {[string]} */ this.headers
        this.pluralWidgetProperty({
            selector: '.header',
            parentSelector: '.headers ',
            childType: 'html',
            property: 'headers',
            transforms: {
                set: (string) => {
                    return hc.spawn({
                        tag: 'td',
                        innerHTML: string,
                        classes: ['header']
                    })
                },
                get: (html) => html.innerHTML
            }
        });

        this.headers = [
            'ID',
            'Role',
            'Inherited Roles',
            'Supervised Roles',
            'Description'
        ];


        this.waitTillDOMAttached().then(() => this.populateUI())


    }

    async populateUI() {

        this.loadBlock();

        try {


            this.itemsData = []

            this.itemsData = await logic.fetch_roles()

            this.loadUnblock()

        } catch (e) {
            setTimeout(() => this.loadUnblock(), 1000)
            handle(e)
        }



    }

    static get testWidget() {
        let widget = new this()

        return widget;
    }


}
