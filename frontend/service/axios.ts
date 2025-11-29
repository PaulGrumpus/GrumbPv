import axios from 'axios';
import https from 'https';

import { EscrowBackendConfig } from '../config/config';

export const EscrowBackend = axios.create({
    baseURL: EscrowBackendConfig.baseURL,
    httpsAgent: new https.Agent({
        rejectUnauthorized: false,
    }),
});
