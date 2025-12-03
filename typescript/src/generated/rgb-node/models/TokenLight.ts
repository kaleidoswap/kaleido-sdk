/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { Media } from './Media';
export type TokenLight = {
  index?: number;
  ticker?: string;
  name?: string;
  details?: string;
  embedded_media?: boolean;
  media?: Media;
  attachments?: Record<string, Media>;
  reserves?: boolean;
};
