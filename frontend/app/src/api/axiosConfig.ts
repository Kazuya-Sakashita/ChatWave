import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3000",
  //ベースURLを設定
});

export default instance;
