/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This widget is part of the payment-manager widget
 * This widget lists payments providing options for viewing details of a payment
 */

import PermissionsListing from "./entry.mjs";
import logic from "./logic.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import { Checkbox } from "/$/system/static/html-hc/widgets/checkbox/checkbox.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class PermissionListings extends Widget {


    constructor() {
        super();

        this.html = hc.spawn({
            classes: ['hc-donorforms-admin-payment-listings'],
            innerHTML: `
                <table class='container'>
                    <thead>
                        <tr class='headers'>
                            <td class='checkbox'></td>
                            <td class='header'></td>
                            <td class='header'></td>
                            <td class='header'></td>
                            <td class='header'></td>
                        </tr>
                    </thead>

                    <tbody>
                    </tbody>
                    
                </table>
            `
        });


        /** @type {function(('show-detail-popup'), function( CustomEvent<{data: import("./types.js").FrontendUserPermissions, popup:PaymentDetailsPopup}>), AddEventListenerOptions)} */ this.addEventListener

        /** @type {[PermissionsListing]} */ this.itemWidgets
        this.pluralWidgetProperty({
            selector: '.hc-donorforms-admin-payment-listing',
            parentSelector: '.container >tbody',
            childType: 'widget',
            property: 'itemWidgets',
            immediate: false,
        });

        /** @type {[import("./types.js").FrontendUserPermissions]} */ this.itemsData

        this.pluralWidgetProperty({
            selector: '.hc-donorforms-admin-payment-listing',
            parentSelector: '.container >tbody',
            childType: 'widget',
            property: 'itemsData',
            immediate: false,
            transforms: {
                /**
                 * 
                 * @param {import("./types.js").FrontendUserPermissions} data 
                 */
                set: (data) => {
                    let widget = new PermissionsListing(data);

                    widget.addEventListener('remove', () => {
                        this.itemsData = this.itemsData.filter(x => x.subject.id !== data.subject.id)
                    })


                    return widget.html
                },
                get: (html) => {
                    return { ...html?.widgetObject.data }
                }
            }
        });

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
            'Person / Role',
            'ID',
            'Permissions',
        ];

        //TODO: Switch to GenericListings widget


        this.waitTillDOMAttached().then(() => this.populateUI())


    }

    async populateUI() {

        this.loadBlock();

        try {


            this.itemsData = [];

            this.itemsData = await logic.fetch_items()

            this.loadUnblock()

        } catch (e) {
            setTimeout(() => this.loadUnblock(), 500)
            handle(e)
        }



    }

    static get testWidget() {
        let widget = new this()

        return widget;
    }


}
