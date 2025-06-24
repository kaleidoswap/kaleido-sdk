import { components } from '../types';
import { HttpClient } from '../http/client';

export const getInfo = async (client: HttpClient): Promise<components['schemas']['GetInfoResponseModel']> => {
    return await client.get<components['schemas']['GetInfoResponseModel']>("/api/v1/lsps1/get_info");
}
    
