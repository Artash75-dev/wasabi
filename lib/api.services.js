import axios from "axios";
import { POSTER_API, POSTER_TOKEN ,NEXT_BASE_URL} from "./utils";

export const ApiService = {
  async getData(url, props) {
    const response = await axios.get(
      `${POSTER_API}/${url}?${POSTER_TOKEN}${props ? props : ""}`
    );
    return response.data;
  },
  async get(url) {
    const response = await axios.get(`${NEXT_BASE_URL}${url}`);
    return response;
  },
};
