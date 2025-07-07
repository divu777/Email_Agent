import z from 'zod';
export const EmailsTypeSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  snippet: z.string(),
  from: z.string(),
  subject: z.string()
});


export const EmailTypeSchema = z.object({
  id: z.string(),
  messages: z.array(EmailsTypeSchema),
  impheaders: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
    })
  ),
});

export type tokens={
    access_token:string,
    expiry_date:Date,
    refresh_token:string
}


export type GlobalUserType = Record<string,tokens>

export type generateReplySchema  = z.infer<typeof EmailsTypeSchema>