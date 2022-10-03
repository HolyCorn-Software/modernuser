/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This widget is a popup that allows managing the details of permission
 */

import { HCTSBrandedPopup } from "/$/system/static/lib/hc/branded-popup/popup.js";
import { hc } from "/$/system/static/lib/hc/lib/index.js";


export default class PermissionDetailsPopup extends HCTSBrandedPopup{

    constructor(){
        super(...arguments);
        this.html.classList.add('hc-cayofedpeople-permission-details-popup')
    }
    
}

hc.importModuleCSS(import.meta.url);