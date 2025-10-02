export interface FeatureDetail {
    title: string;
    content: string;
  }
  
  export interface Feature {
    id: number;
    title: string;
    description: string;
    image: string;
    details: FeatureDetail[];
  }


  export type EmailsType = {
  id: string;
  threadId: string;
  snippet: string;
  from: string;
  subject: string;
};

export type SendReply =
  | {
      type: "thread-reply";
      payload: EmailSummary;
    }
  | {
      type: "new-message";
      payload: {
        to: string;
        subject: string;
        body: string;
      };
    };

export type EmailSummary = {
  id: string;
  snippet: string;
  labels: string[];
  impheaders: { value: string; name: string }[];
};

export type EmailType = {
  id: string;
  messages: EmailsType[];
  impheaders: { value: string; name: string }[];
};

export type EmailType2 = {
  id: string;
  messages: EmailSummary[];
};

 export type Mail = {
    to: string;
    subject: string;
    body: string;
  };