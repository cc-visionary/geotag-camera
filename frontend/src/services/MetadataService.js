/* Contains the functions to requests to URL Paths in relation to the `images` collection */

import axios from "axios";
import { METADATA_API_BASE_URL } from "../utilities/constants";

const MetadataService = {
  getAllMetadata: () => axios.get(METADATA_API_BASE_URL),
  addMetadata: (data) => axios.post(`${METADATA_API_BASE_URL}/add`, data),
}

export default MetadataService;