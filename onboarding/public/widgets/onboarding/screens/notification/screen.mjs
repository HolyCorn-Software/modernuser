/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This widget allows a new user to select his preferred ways to be notified
 */

import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";



export default class NotificationSelect extends Widget{

    constructor(){
        super();

        this.html = hc.spawn(
            {
                classes:['hc-cayofedpeople-onboarding-notification-select'],
                innerHTML:`
                    <div class='container'>
                        
                    </div>
                `
            }
        )
    }
    
}