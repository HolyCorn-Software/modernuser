/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module contains type definitions for the email notification provider
 * 
 */


export declare interface EmailContact {
    email: string
}


export declare interface EmailProviderCredentials {
    name: 'email',
    phone_number_id: string,
    bearer_token: string
}


