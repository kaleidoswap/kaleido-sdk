/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { AssignmentAny } from './AssignmentAny';
import type { AssignmentFungible } from './AssignmentFungible';
import type { AssignmentInflationRight } from './AssignmentInflationRight';
import type { AssignmentNonFungible } from './AssignmentNonFungible';
import type { AssignmentReplaceRight } from './AssignmentReplaceRight';
export type Assignment =
  | AssignmentFungible
  | AssignmentNonFungible
  | AssignmentInflationRight
  | AssignmentReplaceRight
  | AssignmentAny;
