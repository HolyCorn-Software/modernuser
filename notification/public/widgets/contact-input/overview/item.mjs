/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The contact-input overview widget
 * This widget represents a single contact that has been added. 
 */

import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class ContactInputOverviewItem extends Widget {

    constructor(provider) {
        super();

        this.html = hc.spawn({
            classes: ['hc-cayofedpeople-contact-input-overview-item'],
            innerHTML: `
                <div class='container'>
                    <div class='top'>
                        <div class='delete-btn'>X</div>
                    </div>
                    
                    <div class='img'>
                        <img>
                    </div>
                </div>
            `
        })

        /** @type {string} */ this.image
        this.htmlProperty('.container >.img img', 'image', 'attribute', undefined, 'src')

        /** @type {string} */ this.provider

        Reflect.defineProperty(this, 'provider', {
            set: () => {
                this.image = `/$/modernuser/notification/providers/${provider}/public/icon.png`
            },
            get: () => {
                return /providers\/(.+)\/public\/icon.png$/.exec(this.image)[1]
            },
            configurable: true,
            enumerable: true
        })

        /** @type {boolean} */ this.highlighted
        this.htmlProperty(undefined, 'highlighted', 'class', undefined, 'highlighted')

        if(provider){
            this.provider = provider
        }
        
        /** @type {function(('highlight'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener
        this.html.addEventListener('click', (event)=>{
            if(event.target === this.html.$('.top') || event.target?.parentElement === this.html.$('.top')){
                return;
            }
            this.dispatchEvent(new CustomEvent('highlight'))
        })
        
    }

}