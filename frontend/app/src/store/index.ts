import { createStore, applyMiddleware, combineReducers } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk, { ThunkMiddleware } from "redux-thunk";
import authReducer from "../reducers/authReducer";
import { AnyAction } from "redux";

const rootReducer = combineReducers({
  auth: authReducer,
  // 他のリデューサーがあればここに追加
});

export type RootState = ReturnType<typeof rootReducer>;

const store = createStore(
  rootReducer,
  composeWithDevTools(
    applyMiddleware(thunk as ThunkMiddleware<RootState, AnyAction>)
  )
);

export default store;
