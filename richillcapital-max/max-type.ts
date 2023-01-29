
export type MaxMarket = {
    id: string;
    name: string;
    market_status: string;
    base_unit: string;
    base_unit_precision: number;
    min_base_amount: number;
    quote_unit: string;
    quote_unit_precision: number;
    min_quote_amount: number;
    m_wallet_supported: boolean;
}

export type MaxCurrency = {
    id: string,
    precision: number,
    sygna_supported: boolean,
    m_wallet_supported: boolean,
    min_borrow_amount: string
}

export type MaxTicker = {
    at: number,
    buy: number,
    sell: number,
    open: number,
    low: number,
    high: number,
    last: number,
    vol: number,
    vol_in_btc: number,
}

export type MaxDepositDetails = {
    uuid: string,
    currency: string,
    currency_version: string,
    amount: string,
    fee: string,
    txid: string,
    created_at: number,
    confirmations: number,
    updated_at: number,
    state: string,
    status: string  
}

export type MaxOrder = {
    id: number,
    client_oid: string | null,
    side: string,
    ord_type: string,
    price: number | null,
    stop_price: number | null,
    avg_price: string,
    state: string,
    market: string,
    created_at: number,
    created_at_in_ms: number,
    updated_at: number,
    updated_at_in_ms: number,
    volume: string,
    remaining_volume: string,
    executed_volume: string,
    trades_count: number,
    group_id: string | null
}

export type MaxAccount = {
    currency: string,
    balance: string,
    locked: string,
    staked: string | null,
    type: string
}

export type MaxProfile = {
  sn: string,
  name: string,
  email: string,
  language: string,
  country_code: string,
  phone_number: string,
  status: string,
  profile_verified: boolean,
  kyc_state: string,
  any_kyc_rejected: boolean,
  agreement_checked: boolean,
  level: number,
  vip_level: number,
  member_type: string,
  bank: {
    branch: string,
    account: string,
    state: string,
    bank_code: string,
    bank_name: string,
    bank_branch_name: string
  },
  referral_code: string,
  birthday: string,
  gender: string,
  nationality: string,
  identity_type: string,
  identity_number: string,
  invoice_carrier_id: string,
  invoice_carrier_type: string,
  two_factor: { app: string, sms: string },
  current_two_factor_type: string,
  locked_status_of_2fa: null,
  documents: {
    photo_id_front_state: string,
    photo_id_back_state: string,
    cellphone_bill_state: string,
    selfie_with_id_state: string
  },
  supplemental_document_type: string,
  avatar_url: string | null,
  avatar_nft_ownership_sn: null    
};

export type MaxMe = {
  sn: string,
  name: string,
  language: string,
  phone_set: boolean,
  country_code: string,
  nationality: string,
  gender: string,
  identity_type: string,
  identity_number: string,
  birthday: string,
  invoice_carrier_id: string,
  invoice_carrier_type: string,
  is_deleted: boolean,
  is_frozen: boolean,
  is_activated: boolean,
  is_corporate: boolean,
  profile_verified: boolean,
  kyc_approved: boolean,
  kyc_state: string,
  any_kyc_rejected: boolean,
  phone_number: string,
  user_agreement_checked: boolean,
  user_agreement_version: string,
  
  bank: {
    branch: string,
    account: string,
    state: string,
    bank_code: string,
    bank_name: string,
    bank_branch_name: string
  },
  documents: {
    photo_id_front_state: string,
    photo_id_back_state: string,
    cellphone_bill_state: string,
    selfie_with_id_state: string
  },
  supplemental_document_type: string,
  email: string,
  accounts: [
    {
      currency: string,
      balance: string,
      locked: string,
      staked: string,
      type: string
    },
  ],
  member_type: string,
  level: number,
  vip_level: number,
  two_factor: string[],
  withdrawable: boolean,
  locked_status_of_2fa: string | null,
  referral_code: string
}