/* Contains the functions to requests to URL Paths in relation to the `images` collection */

import axios from "axios";

const IMAGE_API_BASE_URL = "/api/images"

const ImageService = {
  getAllImages: () => axios.get(IMAGE_API_BASE_URL),
  addImage: (data) => axios.post(`${IMAGE_API_BASE_URL}/add`, data),
}

export default ImageService;