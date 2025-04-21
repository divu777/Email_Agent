import { createSlice } from "@reduxjs/toolkit";

interface Email {
  id: number;
  sender: string;
  recipient: string;
  context: string;
  createdAt: string;
}

interface EmailThread {
  id: number;
  subject: string;
  threadId: string;
  createdAt: Date;
  updatedAt: Date;
  read: boolean;
}

interface EmailThreadState {
  threads: EmailThread[];
  selectedThread: Email[] | null;
  selectedThreadId: string | null;
}

const initialState: EmailThreadState = {
  threads: [],
  selectedThread: null,
  selectedThreadId: null,
};

const emailThreadSlice = createSlice({
  name: "emailThread",
  initialState,
  reducers: {
    setEmailThread: (state, action) => {
      state.threads = action.payload.map((emailThread: any) => ({
        id: emailThread.id,
        subject: emailThread.subject,
        threadId: emailThread.threadId,
        createdAt: new Date(emailThread.createdAt),
        updatedAt: new Date(emailThread.last_updated),
        read: emailThread.read,
      }));
    },
    addEmailThread: (state, action) => {
      state.threads.push({
        id: action.payload.id,
        subject: action.payload.subject,
        threadId: action.payload.threadId,
        createdAt: new Date(action.payload.createdAt),
        updatedAt: new Date(action.payload.last_updated),
        read: false,
      });
    },
    updateEmailThread: (state, action) => {
      state.threads.forEach((email) => {
        if (email.id === action.payload.id) {
          email.read = false;
        }
      });
    },
    setSelectedThread: (state, action) => {
      state.selectedThread = action.payload.emails;
      state.selectedThreadId = action.payload.threadId;

      const thread = state.threads.find(
        (t) => t.id === action.payload.id
      );
      if (thread) {
        thread.read = true;
      }
    },
    clearSelectedThread: (state) => {
      state.selectedThread = null;
      state.selectedThreadId = null;
    },
    clearEmailThreads: () => {
      return initialState;
    },
  },
});

export const {
  setEmailThread,
  addEmailThread,
  updateEmailThread,
  setSelectedThread,
  clearSelectedThread,
  clearEmailThreads,
} = emailThreadSlice.actions;

export const emailThreadReducer = emailThreadSlice.reducer;
