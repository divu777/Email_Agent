import * as z from 'zod/v4';
import type { BaseMessage } from "@langchain/core/messages";

import {Annotation, type Messages, MessagesAnnotation, messagesStateReducer} from '@langchain/langgraph'
export const EmailsTypeSchema = z.object({
  id: z.string(),
  labels:z.array(z.string()),
  snippet: z.string(),
  impheaders: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
    })
  ),
});


export const EmailTypeSchema = z.object({
  id: z.string(),
  historyId:z.string(),
  messages: z.array(EmailsTypeSchema)
});

export type tokens={
    access_token:string,
    expiry_date:Date,
    refresh_token:string
}


export const contextSchema = z.object({
  user: z.string("Please enter a valid user name"),
  user_input: z
    .object({
      body: z.string(),
    })
    .nullable(),
  emails: z.array(
    z.object({
      snippet: z.string(),
      impheaders:z.array(
        z.object({
          name:z.string(),
          value:z.string()
        })
      )
    })
  )
});

export type contextType  = z.infer<typeof contextSchema>

export type GlobalUserType = Record<string,tokens>

export type generateReplySchema  = z.infer<typeof EmailsTypeSchema>


export const StateAnnotation = Annotation.Root({
  user_query: Annotation<string>,
  // messages2: Annotation<BaseMessage[],Messages>({
  //   reducer:messagesStateReducer
  // })

  ...MessagesAnnotation.spec
})