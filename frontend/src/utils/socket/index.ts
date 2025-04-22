import { io } from 'socket.io-client';
import { config } from '../../config';
console.log(config.SOCKET_URL);

const URL = config.SOCKET_URL === 'production' ? undefined : 'http://localhost:3000';

export const socket = io(URL);