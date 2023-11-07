import { combineReducers, configureStore } from '@reduxjs/toolkit';


import { makeApi } from './rtk-api';

//https://redux.js.org/usage/code-splitting#:~:text=However%2C%20Redux%20really%20only%20has,re%2Dgenerate%20the%20root%20reducer.

// Define the Reducers that will always be present in the application
const staticReducers = {
  //TODO
  [makeApi.reducerPath]: makeApi.reducer,
};

function configureAppStore() {
  const store: any = configureStore({
    reducer: {},
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(makeApi.middleware),
  });
  // Add a dictionary to keep track of the registered async reducers
  store.asyncReducers = {};

  // Create an inject reducer function
  // This function adds the async reducer, and creates a new combined reducer
  store.injectReducer = (key, asyncReducer) => {
    store.asyncReducers[key] = asyncReducer;
    store.replaceReducer(createReducer(store.asyncReducers));
  };

  // Return the modified store
  return store;
}

export const app_store: any = configureAppStore();

function createReducer(asyncReducers) {
  return combineReducers({
    ...staticReducers,
    ...asyncReducers,
  });
}
export type RootState = ReturnType<typeof app_store>;
