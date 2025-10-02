import { useEffect, useState } from "react"
export const useSocket = ()=>{
    const [socket,setSocket] = useState<WebSocket|null>(null)



    useEffect(()=>{
        const ws = new WebSocket('ws://localhost:4000')

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