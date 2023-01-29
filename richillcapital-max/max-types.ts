
export type Profile = {
  sn: string,
  name: string,
  email: string,
  language: string,
  country_code: string,
  phone_number: string,
  status: string //'activated',
  profile_verified: boolean,
  kyc_state: string //'verified',
  any_kyc_rejected: boolean,
  agreement_checked: boolean,
  level: number,
  vip_level: number,
  member_type: string // 'type_twd',
  supplemental_document_type: string //'health_id_card',
  avatar_url: string | null,
  avatar_nft_ownership_sn: string | null
}

export type VipLevel = {
    level: number,
    minimum_trading_volume: number,
    minimum_staking_volume: number,
    maker_fee: number,
    taker_fee: number
};

export type AccountVipLevelInfo = {
    current_vip_level: VipLevel,
    next_vip_level: VipLevel
}

export type Balance = {
    currency: string,
    balance: string,
    locked: string,
    staked: string | null,
    type: string
}

export type Bank = {
    account: string,
    branch: string,
    state: string //'verified',
    bank_code: string //'013',
    bank_name: string //'國泰世華商業銀行股份有限公司',
    bank_branch_name: string //'二重分行'
}

export type DocumentStates = {
    photo_id_front_state: string // 'verified',
    photo_id_back_state: string //'verified',
    cellphone_bill_state: string //'verified',
    selfie_with_id_state: string //'verified'    
}

export type Market = {
    id: string,
    name: string,
    market_status: string // 'active',
    base_unit: string // 'etc',
    base_unit_precision: number,
    min_base_amount: number,
    quote_unit: string //'usdt',
    quote_unit_precision: number,
    min_quote_amount: number,
    m_wallet_supported: boolean
};

export type Fee = {
    fee: string,
    fee_currency: string,
    order_id: number,
}

export type Trade = {
    id: number,
    price: string,
    volume: string,
    funds: string,
    market: string,
    market_name: string,
    created_at: number,
    created_at_in_ms: number,
    side: string, // ask / bid
    fee: string,
    fee_currency: string, // twd
    order_id: number,
    info: { 
        maker: string, 
        ask: Fee | null, 
        bid: Fee | null 
    }
}

