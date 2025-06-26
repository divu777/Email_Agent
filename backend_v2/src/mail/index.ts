type tokens={
    access_token:string,
    expiry_date:Date,
    refresh_token:string
}


type GlobalUserType = Record<string,tokens>


export const GlobalUser:GlobalUserType={}


