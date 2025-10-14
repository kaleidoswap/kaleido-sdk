import { components } from '../types';
import { HttpClient } from '../http/client';
export declare const getInfo: (client: HttpClient) => Promise<components["schemas"]["GetInfoResponseModel"]>;
