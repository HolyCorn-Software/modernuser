/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This widget allows the user to edit the properties of a role that involve a relationship, e.g supervised_roles or super_roles
 */

import muserRpc from "/$/modernuser/static/lib/rpc.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import { ActionButton } from "/$/system/static/lib/hc/action-button/button.js";
import { HCTSBrandedPopup } from "/$/system/static/lib/hc/branded-popup/popup.js";

import LabelList from '/$/system/static/lib/hc/label-list/widget.mjs'
import { hc } from "/$/system/static/lib/hc/lib/index.js";


export default class RoleRelationshipEditPopup extends HCTSBrandedPopup {

    /**
     * 
     * @param {object} param0 
     * @param {string} param0.id
     * @param {string} param0.relationship_property
     * @param {[import("./types.js").FrontendRoleData]} param0.all_roles
     * @param {[import("./types.js").SuperRoleData]} param0.related_roles
     * @param {function(role_id:string, all_roles: import("./types.js").FrontendRoleData): void} param0.checker
     */
    constructor({ id, relationship_property, related_roles = [], all_roles, checker }) {
        super();

        let list_widget = new LabelList({
            items_store: all_roles.filter(x => x.id !== id),
            value: related_roles || []
        });

        this.relationship_property = relationship_property;
        this.id = id;

        let button = new ActionButton({
            content: 'Save',
            onclick: () => {

                try {


                    let modified_this = { ...all_roles.filter(x => x.id === id)[0] };

                    modified_this[relationship_property] = this.value

                    const copy = (object) => JSON.parse(JSON.stringify(object))


                    //Put all the roles and add the modified version of this role in it. Then convert the information about the related roles into the atomic state (just id, instead of {id:string, label:string})
                    let modified_all = copy([...all_roles.filter(x => x.id !== id), modified_this]).map(item => {
                        item[relationship_property] ||= []
                        item[relationship_property] = item[relationship_property].map(role => role.id)
                        return item;
                    })

                    checker(modified_all)

                    this.apply_changes(button).then(() => {
                        this.hide()

                        //Now apply the changes here (locally)
                        //Why are we able to apply these changes ?
                        //Well because Arrays are passed by reference. When we modify them here, they get modified everywhere else, especially at the caller
                        all_roles[all_roles.findIndex(x => x.id === id)] = modified_this

                        //Inform the caller that we're done
                        this.dispatchEvent(new CustomEvent('complete'))
                    }).catch(handle)
                } catch (e) {
                    handle(e);
                }
            }
        })

        this.content = hc.spawn({
            classes: ['hc-cayofedpeople-role-relationship-edit-popup-content'],
            children: [
                list_widget.html,
                button.html
            ]
        });

        /** @type {[import("./types.js").SuperRoleData]} */ this.value

        /** @type {function(('complete'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener

        Reflect.defineProperty(this, 'value', {
            get: () => {
                return list_widget.value;
            },
            configurable: true,
            enumerable: true,
        })





    }

    async apply_changes() {
        await muserRpc.modernuser.role.data.update({ id: this.id, data: { [this.relationship_property]: this.value.map(x => x.id) } })
    }

}

hc.importModuleCSS(import.meta.url);