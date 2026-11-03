import type { ImageName } from '../components/ResponsiveImage';
import manifest from './image-manifest.json';
import cmsJson from './cms.json';
import type { CmsContent } from '../lib/cms';

/**
 * Photos of the Bina Adult Care home in El Sobrante, carried over from the
 * previous site's gallery (same order). To add a photo: put it in src-images/
 * as gallery-<id>.webp, run `npm run images`, then add a row here.
 */
export const GALLERY_CATEGORIES = {
  outdoor: 'Outside & entrance',
  living: 'Living spaces',
  rooms: 'Bedrooms & bath',
  dining: 'Dining & kitchen',
} as const;

export type GalleryCategory = keyof typeof GALLERY_CATEGORIES;

export interface GalleryPhoto {
  image: ImageName;
  category: GalleryCategory;
  alt: string;
}

export const defaultGallery: GalleryPhoto[] = [
  { image: 'gallery-0845', category: 'outdoor', alt: 'Side path with an accessible ramp along the house' },
  { image: 'gallery-0846', category: 'outdoor', alt: 'Driveway and parking in front of the home' },
  { image: 'gallery-0849', category: 'outdoor', alt: 'Back of the house with an exterior staircase' },
  { image: 'gallery-0851', category: 'outdoor', alt: 'Outdoor yard with chairs and garden trees' },
  { image: 'gallery-0855', category: 'living', alt: 'Living room with sofas, fireplace and television' },
  { image: 'gallery-0857', category: 'outdoor', alt: 'Front gate and street view of the home' },
  { image: 'gallery-0858', category: 'outdoor', alt: 'Arched front porch of the home' },
  { image: 'gallery-0859', category: 'outdoor', alt: 'Front entrance with arched doorway and ramp' },
  { image: 'gallery-0860', category: 'outdoor', alt: 'Wooden deck walkway beside the garden' },
  { image: 'gallery-0862', category: 'outdoor', alt: 'Covered deck walkway at the side of the house' },
  { image: 'gallery-0863', category: 'outdoor', alt: 'Front door with an accessible entry ramp' },
  { image: 'gallery-0864', category: 'living', alt: 'Living room fireplace with a glass coffee table' },
  { image: 'gallery-0865', category: 'living', alt: 'Hallway leading to the stairs from the living area' },
  { image: 'gallery-0866', category: 'living', alt: 'Quiet sitting corner with two armchairs and a plant' },
  { image: 'gallery-0868', category: 'rooms', alt: 'Bedroom with wood-panelled walls and a window' },
  { image: 'gallery-0869', category: 'rooms', alt: 'Spacious bedroom with mirrored closet doors' },
  { image: 'gallery-0870', category: 'rooms', alt: 'Bedroom with sliding doors and an armchair' },
  { image: 'gallery-0873', category: 'living', alt: 'Open hall with hardwood floors and staircase' },
  { image: 'gallery-0874', category: 'living', alt: 'Bright hall at the foot of the stairs' },
  { image: 'gallery-0875', category: 'rooms', alt: 'Open bedroom door showing the room inside' },
  { image: 'gallery-0876', category: 'rooms', alt: 'Furnished bedroom with natural light' },
  { image: 'gallery-0877', category: 'rooms', alt: 'Bedroom with a window and hardwood floor' },
  { image: 'gallery-0878', category: 'rooms', alt: 'Bedroom with a made bed by the window' },
  { image: 'gallery-0879', category: 'dining', alt: 'Dining table beside sliding glass doors' },
  { image: 'gallery-0880', category: 'dining', alt: 'Kitchen with breakfast bar and stools' },
  { image: 'gallery-0881', category: 'rooms', alt: 'Numbered bedroom door in the hallway' },
  { image: 'gallery-0882', category: 'rooms', alt: 'Bedroom door with a carved chair beside it' },
  { image: 'gallery-0883', category: 'living', alt: 'Long hallway with a patterned runner rug' },
  { image: 'gallery-0884', category: 'living', alt: 'Entry hallway looking through to the living room' },
  { image: 'gallery-0885', category: 'living', alt: 'Hallway leading up a short flight of stairs' },
  { image: 'gallery-0886', category: 'living', alt: 'Hallway towards the front door and living room' },
  { image: 'gallery-0887', category: 'living', alt: 'Living room with sofas, rug and fireplace' },
  { image: 'gallery-0888', category: 'outdoor', alt: 'Covered front porch with arched opening' },
  { image: 'gallery-0889', category: 'living', alt: 'Lounge with a cream sofa' },
  { image: 'gallery-0890', category: 'living', alt: 'Fireplace with decorative screen and candles' },
  { image: 'gallery-0891', category: 'living', alt: 'Window with curtains looking out to the street' },
  { image: 'gallery-0892', category: 'living', alt: 'Sitting area with armchairs facing a garden window' },
  { image: 'gallery-0893', category: 'living', alt: 'Sitting room with wooden armchairs and a plant' },
  { image: 'gallery-0894', category: 'living', alt: 'Open room with hardwood floors and bedroom doors' },
  { image: 'gallery-0895', category: 'living', alt: 'Staircase and hall with hardwood floors' },
  { image: 'gallery-0896', category: 'living', alt: 'Hallway with doors to bedrooms and bathroom' },
  { image: 'gallery-0897', category: 'rooms', alt: 'Bathroom with vanity and window' },
  { image: 'gallery-0898', category: 'rooms', alt: 'Doorway into a room with a closet' },
  { image: 'gallery-0899', category: 'living', alt: 'Upstairs hallway with doors to rooms' },
];

/** Published gallery from the admin dashboard; photos not yet optimized are skipped. */
const cmsGallery = (cmsJson as CmsContent).gallery;
export const gallery: GalleryPhoto[] = cmsGallery
  ? cmsGallery
      .filter((p) => !p.hidden && p.image in manifest)
      .map((p) => ({ image: p.image as ImageName, category: p.category, alt: p.alt }))
  : defaultGallery;
