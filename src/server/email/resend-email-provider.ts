import type {
  EmailProvider,
  SendEmailInput,
  SendEmailResult,
} from "./email-provider";

export class ResendEmailProvider implements EmailProvider {
  readonly name = "resend";

  constructor(
    private readonly apiKey: string,
    private readonly fromAddress: string,
  ) {}

  async sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
    const body: Record<string, unknown> = {
      from: this.fromAddress,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    };

    if (input.attachments?.length) {
      body.attachments = input.attachments.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content.toString("base64"),
      }));
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const payload = (await response.json()) as {
      id?: string;
      message?: string;
    };

    if (!response.ok) {
      throw new Error(payload.message ?? "Resend email send failed.");
    }

    return {
      provider: this.name,
      providerMessageId: payload.id ?? null,
      accepted: true,
    };
  }
}
