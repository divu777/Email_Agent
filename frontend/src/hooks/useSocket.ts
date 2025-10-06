import { useEffect, useState } from "react"
import { config } from "../config"
export const useSocket = ()=>{
    const [socket,setSocket] = useState<WebSocket|null>(null)



    useEffect(()=>{
        const ws = new WebSocket(config.SOCKET_URL)

        ws.onopen=()=>{
            setSocket(ws)
        }

        return ()=>{
            ws.close()
            setSocket(null)
        }

    },[])

    return socket
}