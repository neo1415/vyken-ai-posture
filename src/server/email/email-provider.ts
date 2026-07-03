export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: {
    filename: string;
    content: Buffer;
    contentType: "application/pdf";
  }[];
};

export type SendEmailResult = {
  provider: string;
  providerMessageId: string | null;
  accepted: boolean;
};

export interface EmailProvider {
  readonly name: string;
  sendEmail(input: SendEmailInput): Promise<SendEmailResult>;
}
