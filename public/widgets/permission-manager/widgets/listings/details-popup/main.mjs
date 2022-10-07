/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * 
 * 
 * This widget shows the details of a users permissions (All of them)
 */

import PermissionActions from "./actions.mjs";
import AccordionItem from "/$/system/static/html-hc/widgets/arcordion/item.mjs";
import Accordion from "/$/system/static/html-hc/widgets/arcordion/widget.mjs";



/**
 * @extends {Accordion<import('../types.js').FrontendPermissionGrant>}
 */
export default class PermissionsDetailsMainWidget extends Accordion {

    /**
     * 
     * @param {import("../types.js").FrontendPermissionSubjectData} subject 
     */
    constructor(subject) {
        super();
        this.html.classList.add('hc-cayofedpeople-permission-details-main')

        this.subject = subject;

        /** @type {function(('revoke'), function(CustomEvent<string>), AddEventListenerOptions)} */ this.addEventListener
    }

    /**
     * 
     * @param {import("../types.js").FrontendPermissionGrant} data 
     */
    dataToWidget(data) {
        const actions_widget = new PermissionActions({ subject: this.subject, data })
        let widget = new AccordionItem({
            label: data.label,
            content: actions_widget.html,
        })

        actions_widget.addEventListener('revoke', () => {
            this.dispatchEvent(new CustomEvent('revoke', { detail: data.name }))
        })

        return widget;
    }

}