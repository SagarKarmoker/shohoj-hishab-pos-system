import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function getAuthHeaders() {
  const token = localStorage.getItem('jwt_token');
  return {
    Authorization: token ? `Bearer ${token}` : '',
  };
}

export interface UploadResult {
  url: string;
  publicId: string;
}

export async function uploadImage(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await axios.post<UploadResult>(`${API_URL}/upload/image`, formData, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
}

export async function uploadImageFromUrl(imageUrl: string): Promise<UploadResult> {
  const { data } = await axios.post<UploadResult>(
    `${API_URL}/upload/image/url`,
    { imageUrl },
    {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    },
  );

  return data;
}
