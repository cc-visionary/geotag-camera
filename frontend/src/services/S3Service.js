/* Contains the functions to requests to URL Paths in relation to the `images` collection */

import axios from "axios";
import { S3_API_BASE_URL } from "../utilities/constants";

const S3Service = {
  getPresignedURL: (fileName, fileType) => axios.post(`${S3_API_BASE_URL}/presigned_url`, {fileName, fileType}),
  uploadImage: (url, image) => axios.put(url, image)
}

export default S3Service;