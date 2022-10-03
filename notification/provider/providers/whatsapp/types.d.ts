/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module contains type definitions for the whatsapp notification provider
 * 
 */

import { TemplateMap } from "faculty/modernuser/notification/message-templates"


export declare interface WhatsAppContact {
    phone: string
}


export declare interface WhatsAppProviderCredentials {
    name: 'email',
    phone_number_id: string,
    bearer_token: string,
    template_map: TemplateMap
}



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