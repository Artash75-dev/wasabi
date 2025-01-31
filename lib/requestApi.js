import axios from "axios";
import { POSTER_API, POSTER_TOKEN } from "./utils";

async function postApi(prop) {
  const { url, body } = prop;
  const { data } = await axios.post(`${POSTER_API}/${url}?${POSTER_TOKEN}`, {
    ...body,
  });
  return data;
}
async function getApi(prop) {
  const { url } = prop;
  const { data } = await axios.get(`${POSTER_API}/${url}?${POSTER_TOKEN}`);
  return data;
}

export { postApi, getApi };