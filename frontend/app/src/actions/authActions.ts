import axios from "axios";
import { Dispatch } from "redux";

export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGIN_FAILURE = "LOGIN_FAILURE";
export const LOGOUT = "LOGOUT";

interface LoginSuccessAction {
  type: typeof LOGIN_SUCCESS;
  payload: string;
}

interface LoginFailureAction {
  type: typeof LOGIN_FAILURE;
  payload: string;
}

interface LogoutAction {
  type: typeof LOGOUT;
}

export type AuthActionTypes =
  | LoginSuccessAction
  | LoginFailureAction
  | LogoutAction;

export const login =
  (username: string, password: string) =>
  async (dispatch: Dispatch<AuthActionTypes>) => {
    try {
      const response = await axios.post("/api/login", { username, password });
      const token = response.data.token;
      localStorage.setItem("token", token);

      dispatch({
        type: LOGIN_SUCCESS,
        payload: token,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        dispatch({
          type: LOGIN_FAILURE,
          payload: error.message,
        });
      } else {
        dispatch({
          type: LOGIN_FAILURE,
          payload: "An unexpected error occurred",
        });
      }
    }
  };

export const logout = (): LogoutAction => {
  localStorage.removeItem("token");
  return {
    type: LOGOUT,
  };
};
