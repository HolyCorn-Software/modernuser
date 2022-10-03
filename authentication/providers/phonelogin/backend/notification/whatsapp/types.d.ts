/**
 * Copyright 2022 HOlyCorn Software
 * The CAYOFED People System
 * This module is part of the WhatsAppNotifier module and contains the type definitions used by it's super
 */


export declare interface WhatsAppTemplateImageParam {
    type: ('image'),
    image: {
        link: string
    }
}
export declare interface WhatsAppTemplateTextParam {
    type: ('text'),
    text: string
}




export declare interface WhatsAppTemplateParam {
    type: ('text' | 'image'),
    image: { link: string },
    text: string
}



export declare interface WhatsAppTemplateMap{
    msg_activate_new_account: string,
    msg_reset_password: string
}
