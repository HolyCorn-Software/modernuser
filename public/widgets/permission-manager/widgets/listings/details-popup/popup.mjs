/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This widget is a popup that allows managing the details of permission
 */

import HCTSBrandedPopup from "/$/system/static/html-hc/widgets/branded-popup/popup.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class PermissionDetailsPopup extends HCTSBrandedPopup{

    constructor(){
        super(...arguments);
        this.html.classList.add('hc-cayofedpeople-permission-details-popup')
    }
    
}

hc.importModuleCSS(import.meta.url);