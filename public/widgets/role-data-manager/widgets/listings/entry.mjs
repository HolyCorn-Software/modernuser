/**
 * Copyright 2022 HolyCorn Software
 * Adapted from the Donor Forms Project
 * This widget represents a single entry in the payment listings widget
 */


import { Checkbox } from "/$/system/static/html-hc/widgets/checkbox/checkbox.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";
import AlarmObject from "/$/system/static/html-hc/lib/alarm/alarm.mjs"
import RoleEditPopup from "./generic-edit-popup.mjs";
import RolesListings from "./widget.mjs";
import SuperRolesEditPopup from "./edit-super-roles.mjs";
import SupervisedRolesEditPopup from "./edit-supervised-roles.mjs";

export default class RolesListing extends Widget {

    /**
     * @param {import("./types.js").FrontendRoleData} data
     * @param {RolesListings} parent
     */
    constructor(data, parent) {
        super();

        this.html = hc.spawn({
            classes: ['hc-cayofedpeople-roles-listings-item'],
            tag: 'tr',
            innerHTML: `
                <td class='checkbox'></td>
                <td class='field id'></td>
                <td class='field'>
                    <div class='content'>
                        <div class='icon'></div>
                        <div class='label'></div>
                    </div>
                </td>
                <td class='field super_roles_labels is_label_list'></td>
                <td class='field supervised_roles_labels is_label_list'></td>
                <td class='field description'></td>
            `
        });


        /** @type {string} */ this.id
        /** @type {string} */ this.super_roles_labels
        /** @type {string} */ this.supervised_roles_labels
        /** @type {string} */ this.description

        for (let _property of ['id', 'super_roles_labels', 'supervised_roles_labels', 'description']) {
            this.htmlProperty(`.field.${_property}`, _property, 'innerHTML')
        }
        /** @type {string} */ this.label
        this.htmlProperty(`td.field >.content >.label`, 'label', 'innerHTML')


        /** @type {string} */ this.icon
        this.defineImageProperty(
            {
                selector: 'td.field >.content >.icon',
                property: 'icon',
                mode: 'background'
            }
        )


        /** @type {import("./types.js").SuperRoleData[]} */ this.super_roles
        /** @type {import("./types.js").SupervisedRoleData[]} */ this.supervised_roles

        for (let property of ['supervised_roles', 'super_roles']) {

            let storage

            Reflect.defineProperty(this, property, {
                get: () => storage,
                /**
                 * 
                 * @param {import("./types.js").SuperRoleData|import("./types.js").SupervisedRoleData[]} value 
                 */
                set: (value) => {
                    let long_string = value.map(x => `<x>${x.label}</x>`).join('');
                    this[`${property}_labels`] = long_string;
                    storage = value
                }
            })

        }

        /** @type {Checkbox} */ this.checkbox
        this.widgetProperty({
            selector: '.hc-uCheckbox',
            childType: 'widget',
            property: 'checkbox',
            parentSelector: '.checkbox',
            immediate: false
        });


        this.checkbox = new Checkbox();


        /** @type {import("./types.js").RolesStatedata} */ this.data
        const data_store = new AlarmObject();

        Reflect.defineProperty(this, 'data', {
            get: () => {
                return data_store
            },
            set: (values) => {
                Object.assign(this.data, values)
            },
            configurable: true,
            enumerable: true
        });

        for (let field of ['id', 'icon', 'label', 'super_roles', 'supervised_roles', 'description']) {
            this.data.$0.addEventListener(`${field}-change`, (ev) => {
                this[field] = this.data[field]
            })
        }

        //Configure the action of editing the role label, and role description
        for (let item of [{ name: 'label', label: 'Name' }, { name: 'description', label: 'Description' }]) {


            this.html.$(`.field${item.name === 'label' ? `>.content >.${item.name}` : `.${item.name}`}`).addEventListener('click', () => {
                let popup = new RoleEditPopup({ fields: { [item.name]: item.label }, data: { id: this.data.id, [item.name]: this.data[item.name] } })
                popup.show();
                popup.addEventListener('update', () => {
                    Object.assign(this.data, popup.value);
                })
            })
        }


        //Configure the action of editing the super roles

        this.html.$('.field.super_roles_labels').addEventListener('click', () => {
            let popup = new SuperRolesEditPopup({ id: this.data.id, super_roles: this.super_roles, all_roles: parent.itemsData })
            popup.show();
            popup.addEventListener('complete', () => {
                this.super_roles = popup.value;
            })
        })

        //Configure the action of editing the supervised roles

        this.html.$('.field.supervised_roles_labels').addEventListener('click', () => {
            let popup = new SupervisedRolesEditPopup({ id: this.data.id, supervised_roles: this.supervised_roles, all_roles: parent.itemsData })
            popup.show();
            popup.addEventListener('complete', () => {
                this.super_roles = popup.value;
            })
        })



        Object.assign(this.data, data);


    }

}
