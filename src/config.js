// Central configuration for API and asset URLs
// Uses environment variables in production, falls back to localhost for development

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000';

// Helper to build upload URLs
export const getUploadUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${BASE_URL}/uploads/${path}`;
};

export const getProductImageUrl = (image) => {
  if (!image) return '';
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  return `${BASE_URL}/uploads/products/${image}`;
};

export const getCategoryImageUrl = (image) => {
  if (!image) return '';
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  return `${BASE_URL}/uploads/categories/${image}`;
};

export const getBrandImageUrl = (image) => {
  if (!image) return '';
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  return `${BASE_URL}/uploads/brands/${image}`;
};

export const getSlideImageUrl = (image) => {
  if (!image) return '';
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  return `${BASE_URL}/uploads/slides/${image}`;
};
