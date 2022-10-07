/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This widget is part of the role-resolve/item widget.
 * It represents a single piece of textual information giving the user the option to tap to make an action, e.g Tap to Change
 */

import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class InfoWidget extends Widget {


    /**
     * 
     * @param {object} data 
     * @param {string} data.content
     * @param {function} data.onclick
     */
    constructor(data) {
        super();

        this.html = hc.spawn(
            {
                classes: ['hc-cayofedpeople-role-resolve-info'],
                innerHTML: `
                    <div class='container'>
                        <div class='content'>Youth Secretary</div>
                        <div class='action'>Tap to Change</div>
                    </div>
                `
            }
        );

        /** @type {string} */ this.content
        this.htmlProperty('.container >.content', 'content', 'innerHTML')

        /** @type {function} */ this.onclick
        Reflect.defineProperty(this, 'onclick', {
            set: (fxn) => {
                this.html.$('.container >.action').onclick = fxn
            },
            get: (html) => {
                return this.html.$('.container >.action').onclick
            },
            configurable: true,
            enumerable: true
        })

        Object.assign(this, data)
    }

}