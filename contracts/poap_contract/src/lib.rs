#![no_std]

use soroban_sdk::{
    contracttype, contract, contractimpl, contractevent, symbol_short, Address, Env, Map, Symbol, String,
};
#[contracttype]
#[derive(Clone)]
pub struct Event {
    pub id: u32,
    pub name: String,
    pub description: String,
    pub image_url: String,
    pub max_supply: u32,
    pub creator: Address,
    pub minted_count: u32,
    pub secret: String,
}
#[contracttype]
#[derive(Clone)]
pub struct EventPublicDetails {
    pub id: u32,
    pub name: String,
    pub description: String,
    pub image_url: String,
    pub max_supply: u32,
    pub creator: Address,
    pub minted_count: u32,
}
/// Emitted whenever someone successfully claims a POAP
#[contractevent]
pub struct ClaimedEvent {
    pub event_id: u32,
    pub claimer: Address,
}

#[contract]
pub struct PoapFactory;

#[contractimpl]
impl PoapFactory {
    const NEXT_ID: Symbol = symbol_short!("NEXTID");
    const EVENTS: Symbol = symbol_short!("EVENTS");
    const CLAIMED: Symbol = symbol_short!("CLAIMED");

    pub fn init(env: Env) {
        if env.storage().instance().has(&Self::NEXT_ID) {
            return;
        }
        env.storage().instance().set(&Self::NEXT_ID, &1u32);
        env.storage()
            .instance()
            .set(&Self::EVENTS, &Map::<u32, Event>::new(&env));
        env.storage()
            .instance()
            .set(&Self::CLAIMED, &Map::<u32, Map<Address, bool>>::new(&env));
    }

    pub fn create_event(
        env: Env,
        creator: Address,
        name: String,
        description: String,
        image_url: String,
        max_supply: u32,
        secret: String,
    ) -> u32 {
        creator.require_auth();

        if !env.storage().instance().has(&Self::NEXT_ID) {
            Self::init(env.clone());
        }

        let mut next_id: u32 = env.storage().instance().get(&Self::NEXT_ID).unwrap_or(1u32);
        let event_id = next_id;

        let evt = Event {
            id: event_id,
            name,
            description,
            image_url,
            max_supply,
            creator: creator.clone(),
            minted_count: 0,
            secret,
        };

        let mut events: Map<u32, Event> =
            env.storage().instance().get(&Self::EVENTS).unwrap_or(Map::new(&env));
        events.set(event_id, evt);
        env.storage().instance().set(&Self::EVENTS, &events);

        let mut claimed_all: Map<u32, Map<Address, bool>> =
            env.storage().instance().get(&Self::CLAIMED).unwrap_or(Map::new(&env));
        claimed_all.set(event_id, Map::<Address, bool>::new(&env));
        env.storage().instance().set(&Self::CLAIMED, &claimed_all);

        next_id = next_id.checked_add(1).expect("event id overflow");
        env.storage().instance().set(&Self::NEXT_ID, &next_id);

        event_id
    }

    pub fn claim_poap(env: Env, to: Address, event_id: u32, provided_secret: String) {
        to.require_auth();

        let mut events: Map<u32, Event> =
            env.storage().instance().get(&Self::EVENTS).unwrap_or(Map::new(&env));
        let evt_opt = events.get(event_id);
        if evt_opt.is_none() {
            panic!("event not found");
        }
        let mut evt = evt_opt.unwrap();

        if evt.secret != provided_secret {
            panic!("invalid secret");
        }

        if evt.minted_count >= evt.max_supply {
            panic!("max supply reached");
        }

        let mut claimed_all: Map<u32, Map<Address, bool>> =
            env.storage().instance().get(&Self::CLAIMED).unwrap_or(Map::new(&env));
        let mut claimed_for_event: Map<Address, bool> =
            claimed_all.get(event_id).unwrap_or(Map::new(&env));

        let already = claimed_for_event.get(to.clone()).unwrap_or(false);
        if already {
            panic!("already claimed");
        }

        claimed_for_event.set(to.clone(), true);
        claimed_all.set(event_id, claimed_for_event);
        env.storage().instance().set(&Self::CLAIMED, &claimed_all);

        evt.minted_count += 1;
        events.set(event_id, evt);
        env.storage().instance().set(&Self::EVENTS, &events);

        // ✅ Use new event macro
        let event = ClaimedEvent {
            event_id,
            claimer: to.clone(),
        };
        event.publish(&env);
    }

    pub fn get_event(env: Env, event_id: u32) -> EventPublicDetails {
    let events: Map<u32, Event> =
        env.storage().instance().get(&Self::EVENTS).unwrap_or(Map::new(&env));
    let evt = events.get(event_id).expect("event not found"); 
    EventPublicDetails {
        id: evt.id,
        name: evt.name,
        description: evt.description,
        image_url: evt.image_url,
        max_supply: evt.max_supply,
        creator: evt.creator,
        minted_count: evt.minted_count,
    }
}
    pub fn has_claimed(env: Env, event_id: u32, addr: Address) -> bool {
        let claimed_all: Map<u32, Map<Address, bool>> =
            env.storage().instance().get(&Self::CLAIMED).unwrap_or(Map::new(&env));
        let claimed_for_event: Map<Address, bool> =
            claimed_all.get(event_id).unwrap_or(Map::new(&env));
        claimed_for_event.get(addr).unwrap_or(false)
    }
}
