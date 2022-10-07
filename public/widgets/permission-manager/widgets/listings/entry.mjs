/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This widget represents a single entry in the payment listings widget
 */

import PermissionDetailsPopup from "./details-popup/popup.mjs";
import PermissionsDetails from "./details-popup/popup-content.mjs";
import { Checkbox } from "/$/system/static/html-hc/widgets/checkbox/checkbox.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";
import AlarmObject from "/$/system/static/html-hc/lib/alarm/alarm.mjs"

export default class PermissionsListing extends Widget {

    /**
     * @param {import("./types.js").FrontendUserPermissions} data
     */
    constructor(data) {
        super();

        this.html = hc.spawn({
            classes: ['hc-donorforms-admin-payment-listing'],
            tag: 'tr',
            innerHTML: `
                <td class='checkbox'></td>
                <td class='field subject_label'></td>
                <!-- <td class='field zone_label'></td> -->
                <td class='field subject_id'></td>
                <td class='field permissions_labels'></td>
            `
        });


        /** @type {string} */ this.subject_id
        /** @type {string} */ this.subject_label
        /** @type {string} */ this.permissions_labels
        /** @type {string} */ this.zone_label

        for (let _property of ['subject_id', 'subject_label', 'zone_label', 'permissions_labels']) {
            this.htmlProperty(`.field.${_property}`, _property, 'innerHTML')
        }
        /** @type {{label: string, id: string}} */ this.subject
        Reflect.defineProperty(this, 'subject', {
            /**
             * 
             * @param {import("./types.js").FrontendPermissionSubjectData} v 
             */
            set: (v) => {
                this.__subject__ = v
                this.subject_label = v.label;
                this.subject_id = v.id
            },
            get: () => {
                return this.__subject__
            }
        });


        let permission_storage
        /** @type {[import("./types.js").FrontendPermissionGrant]} */ this.permissions
        Reflect.defineProperty(this, 'permissions', {
            get: () => permission_storage,
            /**
             * 
             * @param {[import("./types.js").FrontendPermissionGrant]} value 
             */
            set: (value) => {
                let long_string = value.map(x => `<x>${x.label}</x>`);
                this.permissions_labels = long_string;
                permission_storage = value
            }
        })

        /** @type {Checkbox} */ this.checkbox
        this.widgetProperty({
            selector: '.hc-uCheckbox',
            childType: 'widget',
            property: 'checkbox',
            parentSelector: '.checkbox',
            immediate: false
        });


        this.checkbox = new Checkbox();

        this.html.addEventListener('click', () => {
            this.details_popup.show()
        });


        /** @type {function(('remove'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener

        /** @type {import("./types.js").UserPermissionsStatedata} */ this.data
        const data_store = new AlarmObject();

        Reflect.defineProperty(this, 'data', {
            get: () => data_store,
            set: (values) => {
                Object.assign(this.data, values)
            },
            configurable: true,
            enumerable: true
        });

        for (let _field of ['subject', 'permissions']) {
            let field = _field
            this.data.$0.addEventListener(`${field}-change`, () => {
                this[field] = this.details_widget.data[field] = this.data[field]
            })
        }




        Object.assign(this.data, data);

        Object.assign(this.details_widget, data);

        this.details_widget.addEventListener('revoke', (event) => {
            setTimeout(() => this.details_popup.hide(), 1800)
            this.data.permissions = this.data.permissions.filter(x => x.name !== event.detail)
            if (this.data.permissions.length === 0) {
                // this.html.remove();
                this.dispatchEvent(new CustomEvent('remove'))
            }
        });


    }


    /**
     * @returns {PermissionDetailsPopup}
     */
    get details_popup() {
        return this[details_popup_symbol] ||= new PermissionDetailsPopup({
            content: this.details_widget.html
        })
    }

    /**
     * @returns {PermissionsDetails}
     */
    get details_widget() {
        return this[details_widget_symbol] ||= new PermissionsDetails()
    }

    static get testWidget() {
        let widget = new this();
        let testdata = {

        }

        Object.assign(widget, testdata)
        return widget;
    }

}



const details_popup_symbol = Symbol(`PermissionsListing.prototype.details_popup`)
const details_widget_symbol = Symbol(`PermissionsListing.prototype.details_widget`)