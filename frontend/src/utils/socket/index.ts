import { io } from 'socket.io-client';
import { config } from '../../config';

const URL = config.SOCKET_URL === 'production' ? undefined : 'http://localhost:4000';

export const socket = io(URL);