/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This widget allows a user to input his email contact
 * 
 */

import FormBasedContactInput from "/$/modernuser/notification/static/widgets/form-based-contact-input/input-widget.mjs";



export default class EmailContactInput extends FormBasedContactInput {

    constructor() {
        super(
            [
                [
                    {
                        label: 'Email Address',
                        type: 'text',
                        name: 'email'
                    }
                ]
            ]
        );

        this.html.classList.add('hc-cayofedpeople-notification-contact-input-email')

    }

    /**
     * @returns {import("../types.js").EmailContact}
     */
    get value() {
        return super.value
    }
    /**
     * @param {import("../types.js").EmailContact} v
     */
    set value(v) {
        super.value = v
    }

}