interface CloudinaryTransformations {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'thumb' | 'scale';
}

/**
 * Optimizes a Cloudinary URL by adding transformations.
 * Always adds f_auto, q_auto for automatic format and quality.
 * @param url The original Cloudinary image URL.
 * @param options Optional transformations like width, height, crop.
 * @returns The optimized URL.
 */
export const optimizeCloudinaryUrl = (url: string, options: CloudinaryTransformations = {}): string => {
  if (!url || !url.includes('res.cloudinary.com/')) {
    return url;
  }
  
  const parts = url.split('/upload/');
  if (parts.length !== 2) {
    return url;
  }

  const newTransforms: string[] = ['f_auto', 'q_auto'];
  if (options.width) newTransforms.push(`w_${options.width}`);
  if (options.height) newTransforms.push(`h_${options.height}`);
  if (options.crop) newTransforms.push(`c_${options.crop}`);

  const transformationString = newTransforms.join(',');
  const path = parts[1];

  return `${parts[0]}/upload/${transformationString}/${path}`;
};
