import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import type {
  EmailProvider,
  SendEmailInput,
  SendEmailResult,
} from "./email-provider";

const DEV_EMAIL_ROOT = resolve(process.cwd(), "storage", "emails-dev");

export class DevEmailProvider implements EmailProvider {
  readonly name = "dev";

  async sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
    await mkdir(DEV_EMAIL_ROOT, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const safeRecipient = input.to.replace(/[^a-z0-9@._-]/gi, "_");
    const baseName = `${timestamp}-${safeRecipient}`;

    const payload = {
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      attachmentCount: input.attachments?.length ?? 0,
      attachmentFilenames:
        input.attachments?.map((item) => item.filename) ?? [],
      sentAt: new Date().toISOString(),
      provider: this.name,
    };

    await writeFile(
      join(DEV_EMAIL_ROOT, `${baseName}.json`),
      JSON.stringify(payload, null, 2),
      "utf8",
    );

    if (input.attachments?.length) {
      for (const attachment of input.attachments) {
        await writeFile(
          join(DEV_EMAIL_ROOT, `${baseName}-${attachment.filename}`),
          attachment.content,
        );
      }
    }

    return {
      provider: this.name,
      providerMessageId: `dev-${baseName}`,
      accepted: true,
    };
  }
}

export function getDevEmailStorageRoot(): string {
  return DEV_EMAIL_ROOT;
}
