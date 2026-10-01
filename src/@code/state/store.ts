import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { profileReducer, profileInitialState } from "./profileSlice";
import { walletReducer, walletInitialState } from "./walletSlice";
import { gamesReducer, gamesInitialState } from "./gamesSlice";
import { feedReducer, feedInitialState } from "./feedSlice";
import { adminUsersReducer, adminUsersInitialState } from "./adminUsersSlice";
import { missionsReducer, missionsInitialState } from "./missionsSlice";
import { streakReducer, streakInitialState } from "./streakSlice";
import { playerMissionsReducer, playerMissionsInitialState } from "./playerMissionsSlice";
import { gameRegistrationsReducer, gameRegistrationsInitialState } from "./gameRegistrationsSlice";
import { loadPersistedState } from "./persistence";

const rootReducer = combineReducers({
  profile: profileReducer,
  wallet: walletReducer,
  games: gamesReducer,
  feed: feedReducer,
  adminUsers: adminUsersReducer,
  missions: missionsReducer,
  streak: streakReducer,
  playerMissions: playerMissionsReducer,
  gameRegistrations: gameRegistrationsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const PROFILE_KEY = "profile";
const WALLET_KEY = "wallet";
const FEED_KEY = "feed";
const ADMIN_USERS_KEY = "adminUsers";
const MISSIONS_KEY = "missions";
const STREAK_KEY = "streak";
const PLAYER_MISSIONS_KEY = "playerMissions";

function buildPreloadedState(overrides: Partial<RootState> = {}, useBrowserPersistence = true): RootState {
  return {
    profile: useBrowserPersistence ? loadPersistedState(PROFILE_KEY, profileInitialState) : profileInitialState,
    wallet: useBrowserPersistence ? loadPersistedState(WALLET_KEY, walletInitialState) : walletInitialState,
    games: gamesInitialState,
    feed: useBrowserPersistence ? loadPersistedState(FEED_KEY, feedInitialState) : feedInitialState,
    adminUsers: useBrowserPersistence ? loadPersistedState(ADMIN_USERS_KEY, adminUsersInitialState) : adminUsersInitialState,
    missions: useBrowserPersistence ? loadPersistedState(MISSIONS_KEY, missionsInitialState) : missionsInitialState,
    streak: useBrowserPersistence ? loadPersistedState(STREAK_KEY, streakInitialState) : streakInitialState,
    playerMissions: useBrowserPersistence ? loadPersistedState(PLAYER_MISSIONS_KEY, playerMissionsInitialState) : playerMissionsInitialState,
    gameRegistrations: gameRegistrationsInitialState,
    ...overrides,
  };
}

export function makeStore(preloadedState?: Partial<RootState>, useBrowserPersistence = true) {
  return configureStore({
    reducer: rootReducer,
    preloadedState: buildPreloadedState(preloadedState, useBrowserPersistence),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];

export const PERSISTED_STATE_KEYS = {
  profile: PROFILE_KEY,
  wallet: WALLET_KEY,
  feed: FEED_KEY,
  adminUsers: ADMIN_USERS_KEY,
  missions: MISSIONS_KEY,
  streak: STREAK_KEY,
  playerMissions: PLAYER_MISSIONS_KEY,
};
