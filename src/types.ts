import { Thread } from "@prisma/client";
import { z } from "zod";

// Gmail API Message Response Structure
export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];  // Label IDs like 'inbox', 'sent', etc.
  snippet: string;      // Short preview of the message content
  historyId: string;
  internalDate: string; // Timestamp of when the message was received
  payload: MessagePayload;
  sizeEstimate: number; // Estimated size in bytes
  raw: string;          // Full raw message (base64 encoded)
  nextPageToken?: string; // Token for fetching the next page of results
  subject?: string;      // Subject of the email
  internetMessageId?: string; // Message ID
  thread?:Thread
}

export interface MessagePayload {
  headers: EmailHeader[];  // Headers like From, To, Subject, etc.
  body: MessagePartBody;   // Body content
  parts?: MessagePart[];   // Nested parts (used for multi-part messages like attachments)
}

export interface EmailHeader {
  name: string;
  value: string;
}

export interface MessagePartBody {
  size: number;
  data: string;  // Base64-encoded content (for example, the body of the email)
}

export interface MessagePart {
  partId: string;
  mimeType: string;
  filename: string;
  headers: EmailHeader[];
  body: MessagePartBody;
  parts?: MessagePart[];
}
export interface EmailAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  inline: boolean;
  contentId?: string;
  content?: string;
  contentLocation?: string;
}

// Utility Function to Extract 'To' Field from Headers
export const getToField = (message: GmailMessage): string | undefined => {
  // Find the 'To' header in the message payload headers
  const toHeader = message.payload.headers.find(header => header.name === "To");
  return toHeader?.value;
};

// Utility Function to Extract 'Date' Field from Headers
export const getDateField = (message: GmailMessage): string | undefined => {
    // Find the 'To' header in the message payload headers
    const DateHeader = message.payload.headers.find(header => header.name === "Date");
    return DateHeader?.value;
  };
  
// Utility Function to Extract 'Subject' Field from Headers
export const getSubjectField = (message: GmailMessage): string | undefined => {
    // Find the 'Subject' header in the message payload headers
    const SubjectHeader = message.payload.headers.find(header => header.name === "Subject");
    return SubjectHeader?.value;
  };

// Utility Function to Extract 'From' Field from Headers
export const getFromField = (message: GmailMessage): string | undefined => {
    // Find the 'From' header in the message payload headers
    const FromHeader = message.payload.headers.find(header => header.name === "From");
    return FromHeader?.value;
  };



// Example Email Address Structure
export interface EmailAddress {
  name: string;
  address: string;
}

// Utility to Parse Email Header into an EmailAddress Format
export const parseEmailHeader = (header: EmailHeader): EmailAddress => {
  const [name, address] = header.value.split(" <");
  return {
    name: name?.trim() || "",
    address: address?.replace(">", "").trim() || "",
  };
};