/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module contains parameters that make up standard platform messages
 */



export declare interface NotificationCallback {



    send: function({ type: ('new_role_uptake'), params: { zone_label: string, role_label: string } })


    send: function({ type: ('role_loss_delete'), params: { role_label: string, zone_label } })


    send: function({ type: ('role_contact_set'), params: { role_label: string, zone_label: string } })


    send: function({ type: ('zone_rename'), params: { old_zone_label: string, new_zone_label } })


    send: function({ type: ('new_event'), params: { link: string, event_label: string } })


    send: function({ type: ('post_event_registration'), params: { photo: Buffer, event_label: string } })


    send: function({ type: ('post_password_reset'), params: { account_label: string, undo_link: string } })


    send: function({ type: ('role_request'), params: { link: string, role_labels: [string], account_label: string, account_icon: string } })

    send: function({ type: ('new_child_account'), params: {} })


}


export declare interface TemplateMap {

    post_password_reset: string

    new_child_account: string

    role_contact_set: string

    post_event_registration: string

    role_request: string

    zone_rename: string

    role_loss_delete: string

    new_event: string

    new_role_uptake

}

//reset_password: 'cayofedpeople_reset_password', new_child_account: 'cayofedpeople_new_child_account', role_contact_set: 'cayofedpeople_role_contact_set', post_event_registration: 'cayofedpeople_post_event_registration', role_request: 'cayofedpeople_role_request', zone_rename: 'cayofedpeople_zone_rename'