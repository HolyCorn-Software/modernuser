/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This widget allows a user to input his WhatsApp contact
 * 
 */

import FormBasedContactInput from "/$/modernuser/notification/static/widgets/form-based-contact-input/input-widget.mjs";
import { hc } from "/$/system/static/lib/hc/lib/index.js";

hc.importModuleCSS()


export default class WhatsAppContactInput extends FormBasedContactInput {

    constructor() {
        super(
            [
                [
                    {
                        label: 'WhatsApp contact',
                        type: 'text',
                        name: 'phone'
                    }
                ]
            ]
        );

        this.html.classList.add('hc-cayofedpeople-notification-contact-input-whatsapp')

    }

    /**
     * @returns {import("../types.js").WhatsAppContact}
     */
    get value() {
        return super.value
    }
    /**
     * @param {import("../types.js").WhatsAppContact} v
     */
    set value(v) {
        super.value = v
    }

}