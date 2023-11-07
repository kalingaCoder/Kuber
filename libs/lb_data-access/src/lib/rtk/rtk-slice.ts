import { createSlice, PayloadAction, SliceCaseReducers, ValidateSliceCaseReducers } from '@reduxjs/toolkit';
import { app_store } from './store';

//Only these keys were available to store in the slice
interface GenericState<T> {
  data?: T;
  status: 'loading' | 'finished' | 'error';
}

type Obj = Record<string, any>;

export const createGenericSlice = <D extends Obj, T extends Obj>({
  name = '',
  initialState,
}: {
  name: string;
  initialState: GenericState<T>;
}) => {
  return <Reducers extends SliceCaseReducers<GenericState<T>>>(
    reducers: Reducers & ValidateSliceCaseReducers<GenericState<T>, Reducers> = {} as Reducers &
      ValidateSliceCaseReducers<GenericState<T>, Reducers>,
  ) => {
    const createSliceVal =  createSlice({
      name,
      initialState,
      reducers: {
        start: {
          reducer(state: GenericState<T>, action: PayloadAction<D>) {
            state.status = 'loading';
          },
          prepare(payload: D) {
            return { payload };
          },
        },
        success(state: GenericState<T>, action: PayloadAction<T>) {
          state.data = action.payload;
          state.status = 'finished';
        },
        ...reducers,
      },
    });
   
    app_store.injectReducer(createSliceVal.name, createSliceVal.reducer);
    return createSliceVal;
  };
};
