export interface MailRecipient {
  email: string;
  name?: string;
  [key: string]: string | undefined;
}

export interface MailConfig {
  senderEmail: string;
  appPassword: string; 
  senderName?: string;
}

export interface MailTemplate {
  subject: string;
  body: string; 
}

export interface MailSendStatus {
  id: string;
  email: string;
  name?: string;
  status: 'pending' | 'sending' | 'success' | 'failed';
  error?: string;
  sentAt?: string;
}

export interface BulkSendSession {
  id: string;
  total: number;
  successCount: number;
  failedCount: number;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  delaySeconds: number; 
  recipients: MailSendStatus[];
}
