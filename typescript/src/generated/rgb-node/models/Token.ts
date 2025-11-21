/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { EmbeddedMedia } from './EmbeddedMedia';
import type { Media } from './Media';
import type { ProofOfReserves } from './ProofOfReserves';
export type Token = {
  index?: number;
  ticker?: string;
  name?: string;
  details?: string;
  embedded_media?: EmbeddedMedia;
  media?: Media;
  attachments?: Record<string, Media>;
  reserves?: ProofOfReserves;
};
