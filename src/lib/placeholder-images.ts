import data from './placeholder-images.json';

/**
 * Interface for placeholder image data
 */
export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

/**
 * Array of placeholder images loaded from JSON data
 */
export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
