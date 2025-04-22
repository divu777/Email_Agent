import { io } from 'socket.io-client';
import { config } from '../../config';

const URL = import.meta.env.VITE_PROD ? config.SOCKET_URL : 'http://localhost:4000';

export const socket = io(URL);
