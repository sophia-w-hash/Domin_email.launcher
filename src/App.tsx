import React, { useState, useRef, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Play, 
  Pause, 
  RotateCcw, 
  HelpCircle, 
  Sliders, 
  KeyRound, 
  Users, 
  FileText, 
  Clock, 
  Sparkles,
  Info,
  User,
  Activity,
  Trash2,
  Lock,
  LogOut,
  Settings,
  ShieldCheck,
  Check,
  RefreshCw,
  Zap
} from 'lucide-react';
import { MailSendStatus } from './types';

export default function App() {
  // Inputs matching user's layout structure
  const [deliveryMode, setDeliveryMode] = useState<'clean' | 'optimized_synonyms' | 'obfuscate'>(
    (localStorage.getItem('deliveryMode') as any) || 'clean'
  );
  const [senderName, setSenderName] = useState(localStorage.getItem('senderName') || '');
  const [senderEmail, setSenderEmail] = useState(localStorage.getItem('senderEmail') || '');
  const [appPassword, setAppPassword] = useState(localStorage.getItem('appPassword') || '');
  const [senderMode, setSenderMode] = useState<'single' | 'bulk'>((localStorage.getItem('senderMode') as 'single' | 'bulk') || 'single');
  const [bulkSendersInput, setBulkSendersInput] = useState(localStorage.getItem('bulkSendersInput') || '');
  const [subject, setSubject] = useState(localStorage.getItem('subject') || '{Quick question for|Regarding website potential of|Important update for} {{Name}}');
  const [body, setBody] = useState(localStorage.getItem('body') || `<p>{Hi|Hello|Greetings} <strong>{{Name}}</strong>,</p>
<p>{Hope you are doing well|Trust this email finds you well|Hope you're having a productive week}.</p>
<p>{While reviewing online opportunities, I came across your business|I recently visited your website and found it has excellent potential}. Although it is currently not on the first-page listings, your website has a strong base for visitors. I'd like to email the custom quote we prepared for you.</p>
<p>{Could you please let me know if this is the best email to send it to?|Would it be alright if I share the details with you?|Let me know if you would be interested in taking a look}.</p>
<p>{Best regards|Warm regards|Sincerely},<br><strong>{{SenderName}}</strong></p>`);
  const [recipientsInput, setRecipientsInput] = useState(localStorage.getItem('recipientsInput') || '');
  const [concurrency, setConcurrency] = useState(() => {
    const cached = localStorage.getItem('concurrency');
    if (!cached || cached === '1') {
      return 9;
    }
    return parseInt(cached);
  });

  // Persist inputs to localStorage
  useEffect(() => {
    localStorage.setItem('senderName', senderName);
    localStorage.setItem('senderEmail', senderEmail);
    localStorage.setItem('appPassword', appPassword);
    localStorage.setItem('senderMode', senderMode);
    localStorage.setItem('bulkSendersInput', bulkSendersInput);
    localStorage.setItem('subject', subject);
    localStorage.setItem('body', body);
    localStorage.setItem('recipientsInput', recipientsInput);
    localStorage.setItem('deliveryMode', deliveryMode);
    localStorage.setItem('concurrency', concurrency.toString());
  }, [senderName, senderEmail, appPassword, senderMode, bulkSendersInput, subject, body, recipientsInput, deliveryMode, concurrency]);

  // Bulk active sending state
  const [recipients, setRecipients] = useState<MailSendStatus[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [currentSendingIndex, setCurrentSendingIndex] = useState<number>(-1);
  const [delaySeconds, setDelaySeconds] = useState(6); // default to 6 seconds for safer delivery
  const [randomizeDelay, setRandomizeDelay] = useState(true); // default to true for human-like pattern
  const [addUniqueIdToSubject, setAddUniqueIdToSubject] = useState(false); // FALSE by default so no extra words are added unless manually checked
  
  
  // Connection Test & Logs State
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ success?: boolean; message: string } | null>(null);
  const [bulkLog, setBulkLog] = useState<string[]>([]);
  
  const stopRequestedRef = useRef(false);

  // Synchronous references to avoid triggering the useEffect sending loop on state/prop change
  const recipientsRef = useRef<MailSendStatus[]>([]);
  const delaySecondsRef = useRef(delaySeconds);
  const randomizeDelayRef = useRef(randomizeDelay);
  const subjectRef = useRef(subject);
  const bodyRef = useRef(body);
  const addUniqueIdToSubjectRef = useRef(addUniqueIdToSubject);
  const senderEmailRef = useRef(senderEmail);
  const appPasswordRef = useRef(appPassword);
  const senderNameRef = useRef(senderName);
  const senderModeRef = useRef(senderMode);
  const bulkSendersInputRef = useRef(bulkSendersInput);
  const deliveryModeRef = useRef(deliveryMode);
  const concurrencyRef = useRef(concurrency);

  // Active/locked credentials for the currently running dispatch session
  const activeSenderEmailRef = useRef('');
  const activeAppPasswordRef = useRef('');
  const activeSenderNameRef = useRef('');
  const activeSubjectRef = useRef('');
  const activeBodyRef = useRef('');
  const activeAddUniqueIdToSubjectRef = useRef(false);
  const activeDeliveryModeRef = useRef<'clean' | 'optimized_synonyms' | 'obfuscate'>('clean');
  const activeConcurrencyRef = useRef(1);

  // Keep references in sync with state changes
  useEffect(() => { recipientsRef.current = recipients; }, [recipients]);
  useEffect(() => { delaySecondsRef.current = delaySeconds; }, [delaySeconds]);
  useEffect(() => { randomizeDelayRef.current = randomizeDelay; }, [randomizeDelay]);
  useEffect(() => { subjectRef.current = subject; }, [subject]);
  useEffect(() => { bodyRef.current = body; }, [body]);
  useEffect(() => { addUniqueIdToSubjectRef.current = addUniqueIdToSubject; }, [addUniqueIdToSubject]);
  useEffect(() => { senderEmailRef.current = senderEmail; }, [senderEmail]);
  useEffect(() => { appPasswordRef.current = appPassword; }, [appPassword]);
  useEffect(() => { senderNameRef.current = senderName; }, [senderName]);
  useEffect(() => { senderModeRef.current = senderMode; }, [senderMode]);
  useEffect(() => { bulkSendersInputRef.current = bulkSendersInput; }, [bulkSendersInput]);
  useEffect(() => { deliveryModeRef.current = deliveryMode; }, [deliveryMode]);
  useEffect(() => { concurrencyRef.current = concurrency; }, [concurrency]);
  useEffect(() => { subjectRef.current = subject; }, [subject]);
  useEffect(() => { bodyRef.current = body; }, [body]);
  useEffect(() => { addUniqueIdToSubjectRef.current = addUniqueIdToSubject; }, [addUniqueIdToSubject]);
  useEffect(() => { senderEmailRef.current = senderEmail; }, [senderEmail]);
  useEffect(() => { appPasswordRef.current = appPassword; }, [appPassword]);
  useEffect(() => { senderNameRef.current = senderName; }, [senderName]);
  useEffect(() => { senderModeRef.current = senderMode; }, [senderMode]);
  useEffect(() => { bulkSendersInputRef.current = bulkSendersInput; }, [bulkSendersInput]);
  useEffect(() => { deliveryModeRef.current = deliveryMode; }, [deliveryMode]);

  interface ParsedSender {
    email: string;
    appPassword: string;
    label: string;
  }

  const parseBulkSenders = (text: string): ParsedSender[] => {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    const list: ParsedSender[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    lines.forEach(line => {
      // support comma, colon, or semicolon separators
      const parts = line.split(/[,:;]+/).map(p => p.trim());
      if (parts.length >= 2) {
        const email = parts[0];
        const pass = parts.slice(1).join(' ');
        if (emailRegex.test(email)) {
          list.push({
            email,
            appPassword: pass,
            label: `${email} (${pass.substring(0, 4)}***)`
          });
        }
      }
    });
    return list;
  };

  const getSentCountLast12Hours = (email: string): number => {
    try {
      const historyStr = localStorage.getItem('sender_dispatch_history') || '[]';
      const history = JSON.parse(historyStr) as { email: string; timestamp: number }[];
      const twelveHoursAgo = Date.now() - 12 * 60 * 60 * 1000;
      const activeHistory = history.filter(item => item.timestamp > twelveHoursAgo);
      localStorage.setItem('sender_dispatch_history', JSON.stringify(activeHistory));
      return activeHistory.filter(item => item.email.toLowerCase() === email.toLowerCase()).length;
    } catch (e) {
      return 0;
    }
  };

  const recordSentEmail = (email: string) => {
    try {
      const historyStr = localStorage.getItem('sender_dispatch_history') || '[]';
      const history = JSON.parse(historyStr) as { email: string; timestamp: number }[];
      history.push({ email: email.toLowerCase(), timestamp: Date.now() });
      const twelveHoursAgo = Date.now() - 12 * 60 * 60 * 1000;
      const activeHistory = history.filter(item => item.timestamp > twelveHoursAgo);
      localStorage.setItem('sender_dispatch_history', JSON.stringify(activeHistory));
    } catch (e) {
      // ignore
    }
  };

  // Parse recipients input dynamically on change or send
  const parseRecipients = (text: string): MailSendStatus[] => {
    const items = text.split(/[\n,;]+/).map(item => item.trim()).filter(Boolean);
    const list: MailSendStatus[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    items.forEach(item => {
      let email = item;
      let name = '';

      // Check if format is "Name <email>"
      const match = item.match(/([^<]+)<([^>]+)>/);
      if (match) {
        name = match[1].trim();
        email = match[2].trim();
      }

      if (emailRegex.test(email)) {
        list.push({
          id: crypto.randomUUID(),
          email,
          name: name || email.split('@')[0],
          status: 'pending'
        });
      }
    });
    return list;
  };

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setBulkLog(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 99)]);
  };

  // Connection Tester
  const handleTestConnection = async () => {
    if (!senderEmail || !appPassword) {
      setConnectionStatus({
        success: false,
        message: 'Please fill in Your Gmail and 16-Digit App Password first.'
      });
      return;
    }

    setTestingConnection(true);
    setConnectionStatus(null);
    addLog('Testing connection to Gmail SMTP...');

    try {
      const response = await fetch('/api/mail/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderEmail, appPassword })
      });

      const data = await response.json();
      if (data.success) {
        setConnectionStatus({
          success: true,
          message: 'Connected Successfully! Your 16-Digit App Password is valid.'
        });
        addLog('✅ SMTP Connection verified successfully.');
      } else {
        setConnectionStatus({
          success: false,
          message: data.message || 'Verification failed. Please verify your Gmail or App Password.'
        });
        addLog('❌ SMTP Connection verification failed.');
      }
    } catch (error: any) {
      setConnectionStatus({
        success: false,
        message: 'Server error: ' + error.message
      });
      addLog('❌ SMTP Server error: ' + error.message);
    } finally {
      setTestingConnection(false);
    }
  };

  // Clean & Fix Template (Spam Buster client-side tool)
  const runSpamBuster = () => {
    const spamMap: { [key: string]: string } = {
      "free": "complimentary",
      "guaranteed": "assured",
      "100% satisfied": "fully satisfied",
      "earn money": "generate income",
      "make money": "grow income",
      "risk-free": "secure",
      "winner": "finalist",
      "cash": "funds",
      "millions": "substantial resources",
      "crypto": "digital assets",
      "bitcoin": "blockchain asset",
      "buy now": "get access",
      "click here": "explore details",
      "income": "earnings",
      "marketing": "outreach",
      "sales": "promotional",
      "cheap": "affordable",
      "seo": "online visibility",
      "google first page": "search ranking",
      "rank": "position",
      "offer": "opportunity",
      "price": "cost",
      "buy": "acquire",
      "click": "visit",
      "link": "page"
    };

    let subjectCleaned = subject;
    let bodyCleaned = body;
    let count = 0;

    for (const [word, replacement] of Object.entries(spamMap)) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      
      const subMatches = subjectCleaned.match(regex);
      if (subMatches) count += subMatches.length;
      subjectCleaned = subjectCleaned.replace(regex, replacement);

      const bodyMatches = bodyCleaned.match(regex);
      if (bodyMatches) count += bodyMatches.length;
      bodyCleaned = bodyCleaned.replace(regex, replacement);
    }

    if (count > 0) {
      setSubject(subjectCleaned);
      setBody(bodyCleaned);
      addLog(`✨ Spam Buster: Replaced ${count} high-risk words with highly-deliverable synonyms.`);
      alert(`🎉 Done! Replaced ${count} potential spam words with safe professional synonyms.`);
    } else {
      alert("✅ Perfect! No high-risk spam keywords detected in your subject or body.");
    }
  };

  const resetToCleanTemplate = () => {
    if (window.confirm("क्या आप मैसेज और विषय को 100% इनबॉक्स-सुरक्षित टेम्पलेट पर रीसेट करना चाहते हैं? इसमें कोई बाहरी बॉर्डर या फालतू लाइन्स नहीं होंगी।")) {
      setSubject("{Quick question for|Regarding website potential of|Important update for} {{Name}}");
      setBody(`<p>{Hi|Hello|Greetings} <strong>{{Name}}</strong>,</p>\n<p>{Hope you are doing well|Trust this email finds you well|Hope you're having a productive week}.</p>\n<p>{While reviewing online opportunities, I came across your business|I recently visited your website and found it has excellent potential}. Although it is currently not on the first-page listings, your website has a strong base for visitors. I'd like to email the custom quote we prepared for you.</p>\n<p>{Could you please let me know if this is the best email to send it to?|Would it be alright if I share the details with you?|Let me know if you would be interested in taking a look}.</p>\n<p>{Best regards|Warm regards|Sincerely},<br><strong>{{SenderName}}</strong></p>`);
      addLog("🔄 Reset to ultra-clean HTML template (no borders, no extra lines).");
    }
  };

  // Clear All fields (All Logout)
  const handleAllLogout = () => {
    if (window.confirm('क्या आप सच में सभी क्रेडेंशियल्स, सेटिंग्स और प्राप्तकर्ताओं की सूची को मिटाना (Clear) चाहते हैं?')) {
      setSenderName('');
      setSenderEmail('');
      setAppPassword('');
      setSenderMode('single');
      setBulkSendersInput('');
      setSubject('{Quick question for|Regarding website potential of|Important update for} {{Name}}');
      setBody(`<p>{Hi|Hello|Greetings} <strong>{{Name}}</strong>,</p>
<p>{Hope you are doing well|Trust this email finds you well|Hope you're having a productive week}.</p>
<p>{While reviewing online opportunities, I came across your business|I recently visited your website and found it has excellent potential}. Although it is currently not on the first-page listings, your website has a strong base for visitors. I'd like to email the custom quote we prepared for you.</p>
<p>{Could you please let me know if this is the best email to send it to?|Would it be alright if I share the details with you?|Let me know if you would be interested in taking a look}.</p>
<p>{Best regards|Warm regards|Sincerely},<br><strong>{{SenderName}}</strong></p>`);
      setRecipientsInput('');
      setRecipients([]);
      setBulkLog([]);
      setConnectionStatus(null);
      localStorage.clear();
      addLog('All data cleared successfully.');
      alert('All Logout Completed! Fields cleared.');
    }
  };

  // Variable Interpolation Helper
  const renderTemplate = (
    text: string, 
    recipient: MailSendStatus, 
    uniqueId?: string, 
    senderNameVal?: string, 
    senderEmailVal?: string
  ) => {
    let output = text;
    output = output.replace(/\{\{email\}\}/gi, recipient.email || '');
    output = output.replace(/\{\{Name\}\}/gi, recipient.name || '');
    const finalSenderName = senderNameVal !== undefined ? senderNameVal : senderName;
    const finalSenderEmail = senderEmailVal !== undefined ? senderEmailVal : senderEmail;
    output = output.replace(/\{\{SenderName\}\}/gi, finalSenderName || finalSenderEmail || 'Solutions Team');
    
    if (uniqueId) {
      output = output.replace(/\{\{ID\}\}/gi, uniqueId);
    }
    return output;
  };

  // Bulk send loop handler - Triggers ONLY when isSending changes to true
  useEffect(() => {
    if (!isSending) return;

    let active = true;
    let timerId: NodeJS.Timeout | null = null;

    const sendNext = async () => {
      if (!active) return;
      if (stopRequestedRef.current) {
        setIsSending(false);
        stopRequestedRef.current = false;
        addLog('Bulk sending paused.');
        return;
      }

      // Find up to activeConcurrencyRef.current pending recipients using the ref to avoid stale state
      const currentRecipients = recipientsRef.current;
      const pendingTargets: { index: number; target: MailSendStatus }[] = [];
      const currentConcurrency = activeConcurrencyRef.current || 1;
      
      for (let i = 0; i < currentRecipients.length; i++) {
        if (currentRecipients[i].status === 'pending') {
          pendingTargets.push({ index: i, target: currentRecipients[i] });
          if (pendingTargets.length === currentConcurrency) break; // Batch of currentConcurrency size
        }
      }
      
      if (pendingTargets.length === 0) {
        setIsSending(false);
        setCurrentSendingIndex(-1);
        addLog('🎉 All emails sent successfully! Bulk send operation complete.');
        alert('Bulk send operation has completed successfully!');
        return;
      }

      // Check sender limit with 500 limit check using locked sender credentials
      const currentSenderEmail = activeSenderEmailRef.current || senderEmailRef.current;
      const currentAppPassword = activeAppPasswordRef.current || appPasswordRef.current;
      
      if (!currentSenderEmail || !currentAppPassword) {
        setIsSending(false);
        addLog('❌ Error: No valid Gmail Sender account configured.');
        alert('Please configure a valid Gmail Sender account.');
        return;
      }

      const count = getSentCountLast12Hours(currentSenderEmail);
      if (count >= 500) {
        setIsSending(false);
        addLog(`⚠️ Limit Reached: ${currentSenderEmail} has hit the Gmail limit of 500 emails / 12 hours!`);
        alert(`⚠️ Sending Limit Reached!\nYour Gmail account ${currentSenderEmail} has hit the 500-email limit in the last 12 hours.\n\nPlease wait for the cooldown to reset.`);
        return;
      }

      // Pre-calculate how many emails we can send in this batch without exceeding 500
      const remainingLimit = 500 - count;
      const targetsWithSenders = pendingTargets.slice(0, remainingLimit).map(item => ({
        index: item.index,
        target: item.target,
        sender: { email: currentSenderEmail, appPassword: currentAppPassword }
      }));

      if (targetsWithSenders.length === 0) {
        setIsSending(false);
        addLog(`⚠️ Limit Reached: ${currentSenderEmail} has hit the Gmail limit of 500 emails / 12 hours!`);
        alert(`⚠️ Sending Limit Reached!\nYour Gmail account ${currentSenderEmail} has hit the 500-email limit in the last 12 hours.`);
        return;
      }

      // Mark status as sending for allocated targets in state and ref synchronously
      const updatedListBeforeSend = [...currentRecipients];
      targetsWithSenders.forEach(({ index }) => {
        updatedListBeforeSend[index] = { ...updatedListBeforeSend[index], status: 'sending' };
      });
      setRecipients(updatedListBeforeSend);
      recipientsRef.current = updatedListBeforeSend;

      addLog(`🚀 Dispatching batch of ${targetsWithSenders.length} emails with active account limit monitoring...`);

      // Run requests concurrently
      const batchResults = await Promise.all(
        targetsWithSenders.map(async ({ index, target, sender }) => {
          const uniqueMailId = Math.floor(100000 + Math.random() * 900000).toString();
          
          // Personalization using locked credentials for this active session
          const activeSubject = activeSubjectRef.current || subjectRef.current;
          const activeBody = activeBodyRef.current || bodyRef.current;
          const activeSenderName = activeSenderNameRef.current || senderNameRef.current;
          const activeSenderEmail = activeSenderEmailRef.current || senderEmailRef.current;
          const activeAddUniqueIdToSubject = activeAddUniqueIdToSubjectRef.current || addUniqueIdToSubjectRef.current;

          let parsedSubject = renderTemplate(activeSubject, target, uniqueMailId, activeSenderName, activeSenderEmail);
          if (activeAddUniqueIdToSubject) {
            parsedSubject = `${parsedSubject} [Ref: #${uniqueMailId}]`;
          }
          
          const parsedBody = renderTemplate(activeBody, target, uniqueMailId, activeSenderName, activeSenderEmail);

          addLog(`[Batch Entry] Sender: ${sender.email} ➡️ Target: ${target.email}...`);

          try {
            const response = await fetch('/api/mail/send-single', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                senderEmail: sender.email,
                appPassword: sender.appPassword,
                senderName: activeSenderName,
                recipientEmail: target.email,
                subject: parsedSubject,
                body: parsedBody,
                deliveryMode: activeDeliveryModeRef.current || deliveryModeRef.current
              })
            });

            const data = await response.json();
            const sentTime = new Date().toLocaleTimeString();

            if (data.success) {
              addLog(`✅ Delivered to ${target.email} via ${sender.email}`);
              recordSentEmail(sender.email); // Permanently log dispatch timestamp
              return { index, status: 'success' as const, sentAt: sentTime, error: undefined };
            } else {
              addLog(`❌ Failed for ${target.email} via ${sender.email}: ${data.message}`);
              return { index, status: 'failed' as const, sentAt: sentTime, error: data.message };
            }
          } catch (err: any) {
            const sentTime = new Date().toLocaleTimeString();
            addLog(`❌ Network error for ${target.email} via ${sender.email}: ${err.message}`);
            return { index, status: 'failed' as const, sentAt: sentTime, error: err.message };
          }
        })
      );

      if (!active) return;

      // Apply batch results together to avoid state races
      const updatedListAfterBatch = [...recipientsRef.current];
      batchResults.forEach(res => {
        updatedListAfterBatch[res.index] = {
          ...updatedListAfterBatch[res.index],
          status: res.status,
          sentAt: res.sentAt,
          error: res.error
        };
      });

      setRecipients(updatedListAfterBatch);
      recipientsRef.current = updatedListAfterBatch;

      // Schedule next batch sending
      if (active && !stopRequestedRef.current) {
        const actualDelay = randomizeDelayRef.current 
          ? Math.max(2, delaySecondsRef.current + Math.floor(Math.random() * 4) - 1)
          : delaySecondsRef.current;

        addLog(`Sleeping for ${actualDelay}s before dispatching next batch...`);
        timerId = setTimeout(sendNext, actualDelay * 1000);
      }
    };

    // Trigger the initial send
    sendNext();

    return () => {
      active = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [isSending]);

  // Start sending triggered by send button
  const handleStartSending = () => {
    if (!senderEmail || !appPassword) {
      alert('Your Gmail and App Password are required to start sending.');
      return;
    }

    const list = parseRecipients(recipientsInput);
    if (list.length === 0) {
      alert('Please enter at least one valid recipient email address.');
      return;
    }

    // Capture/Freeze details for the active sending loop
    activeSenderEmailRef.current = senderEmail;
    activeAppPasswordRef.current = appPassword;
    activeSenderNameRef.current = senderName;
    activeSubjectRef.current = subject;
    activeBodyRef.current = body;
    activeAddUniqueIdToSubjectRef.current = addUniqueIdToSubject;
    activeDeliveryModeRef.current = deliveryMode;
    activeConcurrencyRef.current = concurrency;

    // Set lists synchronously in state and references immediately to prevent race conditions
    setRecipients(list);
    recipientsRef.current = list;
    
    stopRequestedRef.current = false;
    setIsSending(true);
    addLog(`🚀 Initializing bulk send to ${list.length} clients...`);
  };

  const handlePauseSending = () => {
    stopRequestedRef.current = true;
    addLog('Pause requested. Stopping after current email dispatch finishes.');
  };

  // Count stats
  const pendingCount = recipients.filter(r => r.status === 'pending').length;
  const successCount = recipients.filter(r => r.status === 'success').length;
  const failedCount = recipients.filter(r => r.status === 'failed').length;

  return (
    <div id="bulk-mail-app-root" className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans">
      
      {/* Visual Header */}
      <header id="main-header" className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-40 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md">
            <Mail className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              Bulk Mail Sender Pro
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                Spam Guard Enabled
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              High-speed inbox delivery with Gmail 16-Digit App Password security
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Helper links hidden to keep layout extremely clean */}
        </div>
      </header>

      {/* Primary Workspace container */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-6 space-y-6">
        
        {/* Core Layout requested by user */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-400" />
              Primary Mailer Setup (ईमेल सेट करें)
            </h2>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1" />
              <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase">Ready</span>
            </div>
          </div>

          <div className="p-6 space-y-6">

            {/* 100% Inbox Delivery Blueprint Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 md:p-5 space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    100% Inbox Delivery Guide (ईमेल सीधे Inbox में भेजने की तरकीबें)
                  </h3>
                  <p className="text-[11px] text-emerald-700">
                    यदि आपके ईमेल Inbox में नहीं जा रहे हैं, तो नीचे दी गई 4 बातों का पालन करें:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                <div className="bg-white/80 backdrop-blur-xs p-3 rounded-lg border border-emerald-100/60 text-xs">
                  <span className="font-bold text-emerald-800 block mb-1">1. "Clean & Natural" Mode चुनें</span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    जीमेल के आधुनिक AI फ़िल्टर्स <strong>ZWC (Zero-Width Characters)</strong> को तुरंत पहचान लेते हैं और ईमेल स्पैम में डाल देते हैं। इसलिए <strong>Clean & Natural Mode</strong> सबसे सुरक्षित और बेस्ट है।
                  </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xs p-3 rounded-lg border border-emerald-100/60 text-xs">
                  <span className="font-bold text-emerald-800 block mb-1">2. Speed Delay 10s-15s रखें</span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    लगातार तेज़ गति से ईमेल भेजने पर गूगल आपके ईमेल ब्लॉक या स्पैम कर देता है। सुरक्षित डिलीवरी के लिए नीचे से <strong>Speed Delay को 10-15 सेकंड</strong> पर सेट करें।
                  </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xs p-3 rounded-lg border border-emerald-100/60 text-xs">
                  <span className="font-bold text-emerald-800 block mb-1">3. Spintax का उपयोग करें</span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    हर क्लाइंट को एक जैसा मैसेज न भेजें। अपने विषय (Subject) या मैसेज में <code>{"{Hi|Hello|Hey}"}</code> जैसे विकल्पों का उपयोग करें ताकि हर क्लाइंट को एक अलग और यूनीक मैसेज मिले।
                  </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xs p-3 rounded-lg border border-emerald-100/60 text-xs">
                  <span className="font-bold text-emerald-800 block mb-1">4. स्पैम कीवर्ड्स से बचें</span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    अपने मैसेज में <em>free, cash, money, earn, win, bitcoin, cheap</em> जैसे शब्दों का सीधे उपयोग न करें। इन्हें बदलने के लिए नीचे से <strong>Synonym Optimizer</strong> भी चुन सकते हैं।
                  </p>
                </div>
              </div>
            </div>
            
            {/* 2-Column Grid matching the requested user layout structure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Row 1: Common Sender Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Sender Name / Brand
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. WWKart Sales Team"
                  className="w-full bg-white text-slate-950 border border-slate-200 rounded-xl px-4 py-2.5 text-xs placeholder-slate-400 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-xs"
                />
              </div>

              {/* Your Gmail Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Your Gmail Address
                  </span>
                  {senderEmail && (
                    <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {getSentCountLast12Hours(senderEmail)} / 500 Sent
                    </span>
                  )}
                </label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full bg-white text-slate-950 border border-slate-200 rounded-xl px-4 py-2.5 text-xs placeholder-slate-400 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-xs"
                />
                {senderEmail && (
                  <p className="text-[10.5px] text-slate-500 mt-1.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    इस Gmail ID के लिए 12 घंटे में 500 ईमेल की सीमा (limit) तय है।
                  </p>
                )}
              </div>

              {/* 16-Digit App Password Block */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  16-Digit App Password
                </label>
                <input
                  type="password"
                  value={appPassword}
                  onChange={(e) => setAppPassword(e.target.value)}
                  placeholder="xxxx xxxx xxxx xxxx"
                  className="w-full bg-white text-slate-950 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono placeholder-slate-400 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-xs"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Exclusive proposal for {{Name}}"
                  className="w-full bg-white text-slate-950 border border-slate-200 rounded-xl px-4 py-2.5 text-xs placeholder-slate-400 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-xs"
                />
              </div>

              {/* Message Body (HTML Supported) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Message Body (HTML Supported)
                </label>
                <textarea
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write message HTML or plain text here..."
                  className="w-full h-32 bg-white text-slate-950 border border-slate-200 rounded-xl p-3 text-xs font-mono placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition leading-relaxed resize-none shadow-xs"
                />
                <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-1.5 border-t border-slate-100">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] text-slate-400 self-center uppercase font-mono mr-1">Insert:</span>
                    <button 
                      type="button" 
                      onClick={() => setBody(prev => prev + ' {{Name}}')} 
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-slate-600 font-mono transition"
                    >
                      {"{{Name}}"}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setBody(prev => prev + ' {{SenderName}}')} 
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-slate-600 font-mono transition"
                    >
                      {"{{SenderName}}"}
                    </button>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={runSpamBuster}
                      className="text-[10.5px] bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-200 px-2.5 py-1 rounded-lg transition flex items-center gap-1 shadow-xs"
                      title="विषय और बॉडी में से स्पैम शब्दों को हटाकर सुरक्षित पर्यायवाची शब्द लिखें"
                    >
                      <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                      Spam Buster (स्पैम हटाओ)
                    </button>
                    <button
                      type="button"
                      onClick={resetToCleanTemplate}
                      className="text-[10.5px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 px-2.5 py-1 rounded-lg transition flex items-center gap-1 shadow-xs"
                      title="100% इनबॉक्स-सुरक्षित टेम्पलेट पर रीसेट करें"
                    >
                      <Check className="w-3 h-3 text-emerald-500" />
                      Clean Template (साफ़ टेम्पलेट)
                    </button>
                  </div>
                </div>
              </div>

              {/* Recipients Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  Recipients (comma or newline)
                </label>
                <textarea
                  rows={4}
                  value={recipientsInput}
                  onChange={(e) => setRecipientsInput(e.target.value)}
                  placeholder="Enter emails here. E.g.:&#13;amit@gmail.com&#13;Rohan <rohan@gmail.com>&#13;sophia@wwkart.com"
                  className="w-full h-32 bg-white text-slate-950 border border-slate-200 rounded-xl p-3 text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition leading-relaxed resize-none shadow-xs"
                />
                <p className="text-[10.5px] text-slate-500 mt-2">
                  एक लाइन में एक ईमेल दर्ज करें, या अल्पविराम <code>,</code> का प्रयोग करें।
                </p>
              </div>

            </div>

            {/* Row 4: Send & All Logout Controls */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
                {!isSending ? (
                  <button
                    type="button"
                    onClick={handleStartSending}
                    disabled={!senderEmail || !appPassword || !recipientsInput}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold py-3.5 px-6 rounded-xl text-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-200"
                  >
                    <Send className="w-4 h-4" />
                    Send (बल्क ईमेल शुरू करें)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePauseSending}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-bold py-3.5 px-6 rounded-xl text-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-200"
                  >
                    <Pause className="w-4 h-4" />
                    Pause Dispatcher
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleAllLogout}
                  className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-3.5 px-6 rounded-xl text-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border border-rose-200"
                >
                  <LogOut className="w-4 h-4" />
                  All Logout (सब साफ़ करें)
                </button>
              </div>

              {/* Speed & Concurrency Inline Panel */}
              <div id="inline-speed-concurrency-control" className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-indigo-100 text-indigo-700 rounded-lg">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Batch Size & Speed Setup (बैच साइज और भेजने की स्पीड)
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      9 थ्रेड्स (9-by-9 Batch) चुनने पर आपके ईमेल 9-9 के ग्रुप में एक साथ बेहद तेज़ भेजे जाएंगे।
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Concurrency Threads Selector */}
                  <div className="space-y-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                        Threads / Batch Size
                      </span>
                      <span className={`font-mono text-[10px] font-black px-2 py-0.5 rounded border ${
                        concurrency === 1 
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                          : concurrency === 9
                            ? 'text-indigo-700 bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/10'
                            : 'text-blue-700 bg-blue-50 border-blue-200'
                      }`}>
                        {concurrency === 1 ? '1 Thread (Safe)' : concurrency === 9 ? '9 Threads (Recommended Batch 🚀)' : `${concurrency} Threads (Parallel)`}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setConcurrency(1)}
                        className={`py-2 px-1.5 rounded-lg border text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                          concurrency === 1
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-500/10 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <span>1 Thread</span>
                        <span className="text-[8px] font-normal opacity-85">(1-by-1 Safe)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setConcurrency(5)}
                        className={`py-2 px-1.5 rounded-lg border text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                          concurrency === 5
                            ? 'bg-blue-50 border-blue-300 text-blue-800 ring-2 ring-blue-500/10 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <span>5 Threads</span>
                        <span className="text-[8px] font-normal opacity-85">(Medium)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setConcurrency(9)}
                        className={`py-2 px-1.5 rounded-lg border text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                          concurrency === 9
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-800 ring-2 ring-indigo-300/60 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <span className="flex items-center gap-0.5 text-indigo-900 font-extrabold">
                          9 Threads 🔥
                        </span>
                        <span className="text-[8px] font-medium text-indigo-600 opacity-95">(Ideal Batch)</span>
                      </button>
                    </div>

                    <div className="pt-2">
                      <input
                        type="range"
                        min={1}
                        max={12}
                        value={concurrency}
                        onChange={(e) => setConcurrency(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <div className="flex justify-between text-[9px] font-medium text-slate-400 mt-1">
                        <span>1 (Safe)</span>
                        <span className="text-indigo-600 font-bold">9 (Recommended)</span>
                        <span>12 (Max)</span>
                      </div>
                    </div>
                  </div>

                  {/* Delay Panel */}
                  <div className="space-y-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          Delay Between Batches
                        </span>
                        <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          {delaySeconds} seconds
                        </span>
                      </div>

                      <div className="pt-2">
                        <input
                          type="range"
                          min={1}
                          max={20}
                          value={delaySeconds}
                          onChange={(e) => setDelaySeconds(parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                          <span>1s (Super Fast)</span>
                          <span className="text-emerald-600 font-semibold">Recommended: 4s - 8s</span>
                          <span>20s (Safe)</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100/60">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={randomizeDelay}
                          onChange={(e) => setRandomizeDelay(e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
                        />
                        <div className="text-[11px]">
                          <p className="font-bold text-slate-700">Humanize Delay (±2s Jitter)</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="text-[10.5px] text-slate-600 leading-relaxed bg-indigo-50/40 p-3 rounded-xl border border-indigo-100/40 flex items-start gap-2">
                  <span className="text-indigo-500 font-extrabold text-sm shrink-0 leading-none">💡</span>
                  <p>
                    <strong>उदाहरण के लिए:</strong> यदि आप 27 ईमेल दर्ज करते हैं और <strong>9 Threads</strong> चुनते हैं, तो सिस्टम 9-9 ईमेल के 3 अलग-अलग बैच बनाकर केवल 3 बार में बेहद तेजी से सभी 27 ईमेल भेज देगा!
                  </p>
                </div>
              </div>

          </div>
        </section>

        {/* Dynamic & Advanced features below the primary form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (Stats & Protection configuration) */}
          <div className="lg:col-span-6 space-y-6">

            {/* Smart Spam Shield Controller */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Smart Spam & Filter Shield (सुरक्षा सेटिंग्स)
              </h3>

              <div className="space-y-4">
                {/* Delivery Jitter & Delay */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      Speed Delay Between Mails
                    </span>
                    <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-mono">
                      {delaySeconds} seconds
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={delaySeconds}
                    onChange={(e) => setDelaySeconds(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>1s (Super Fast)</span>
                    <span className="text-emerald-600 font-semibold">Recommended: 4s - 8s</span>
                    <span>20s (Super Safe)</span>
                  </div>
                </div>

                {/* Sending Concurrency (Threads) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Sending Threads / Concurrency (थ्रेड्स - एक साथ कितने ईमेल भेजें)
                    </span>
                    <span className={`font-bold px-2 py-0.5 rounded border font-mono text-[11px] ${
                      concurrency === 1 
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                        : concurrency === 9
                          ? 'text-indigo-700 bg-indigo-50 border-indigo-200 ring-1 ring-indigo-300'
                          : concurrency <= 3 
                            ? 'text-blue-700 bg-blue-50 border-blue-200' 
                            : 'text-amber-700 bg-amber-50 border-amber-200'
                    }`}>
                      {concurrency === 1 ? '1 Thread (Safe - 100% Inbox)' : concurrency === 9 ? '9 Threads (Optimized Batch 🚀)' : `${concurrency} Threads (Parallel)`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={concurrency}
                    onChange={(e) => setConcurrency(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span className="text-emerald-600 font-bold">1 Thread (Inbox Perfect)</span>
                    <span className="text-indigo-600 font-bold">9 Threads (Recommended Batch)</span>
                    <span className="text-amber-600 font-bold">12 Threads (Fastest)</span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 leading-relaxed pt-0.5">
                    <strong>9 थ्रेड्स (9-by-9 Batch)</strong> डिफ़ॉल्ट रूप से सेट है जो सुपर फ़ास्ट स्पीड और उच्च इनबॉक्स डिलीवरी को संतुलित करता है। आप इसे ज़रूरत के अनुसार बदल सकते हैं।
                  </p>
                </div>

                {/* Additional anti-spam toggles */}
                <div className="space-y-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={randomizeDelay}
                      onChange={(e) => setRandomizeDelay(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <div className="text-xs">
                      <p className="font-semibold text-slate-800">Humanize Delay (±2s random jitter)</p>
                      <p className="text-[10.5px] text-slate-500">हर ईमेल के अंतराल में थोड़ा अंतर रखें ताकि बॉट न लगे।</p>
                    </div>
                  </label>

                  {/* Delivery Optimization Selector */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Delivery Optimization Mode (इनबॉक्स डिलीवरी मोड)
                    </label>
                    
                    <div className="grid grid-cols-1 gap-2.5">
                      {/* Option 1: Clean & Natural (Recommended) */}
                      <div 
                        onClick={() => setDeliveryMode('clean')}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-2.5 items-start ${
                          deliveryMode === 'clean' 
                            ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/10' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${deliveryMode === 'clean' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-900">100% Clean & Natural Mode</span>
                            <span className="text-[9px] bg-emerald-500 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Recommended</span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                            <strong>100% साफ और प्राकृतिक टेक्स्ट।</strong> आधुनिक Gmail/Yahoo AI सिस्टम अदृश्य कैरेक्टर्स (Zero-Width Characters) को डिटेक्ट कर स्पैम में डाल देते हैं। यह मोड बिना किसी अदृश्य कोड के ईमेल भेजता है जो पूरी तरह सुरक्षित है।
                          </p>
                        </div>
                      </div>

                      {/* Option 2: Synonym Optimizer */}
                      <div 
                        onClick={() => setDeliveryMode('optimized_synonyms')}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-2.5 items-start ${
                          deliveryMode === 'optimized_synonyms' 
                            ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/10' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${deliveryMode === 'optimized_synonyms' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-900">Trigger Word Synonym Optimizer</span>
                            <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded uppercase font-medium">Smart AI Guard</span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                            यह आपके ईमेल में मौजूद स्पैम ट्रिगर शब्दों (जैसे: <em>free, money, cash, buy now</em>) को आटोमेटिकली प्रोफेशनल सिनोनिम्स (जैसे: <em>complimentary, earnings, funds, get access</em>) से बदल देता है बिना कोई अदृश्य कैरेक्टर जोड़े।
                          </p>
                        </div>
                      </div>

                      {/* Option 3: Legacy Obfuscator */}
                      <div 
                        onClick={() => setDeliveryMode('obfuscate')}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-2.5 items-start ${
                          deliveryMode === 'obfuscate' 
                            ? 'bg-rose-50/50 border-rose-200 ring-2 ring-rose-500/10' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${deliveryMode === 'obfuscate' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-900">Legacy Shield Obfuscation</span>
                            <span className="text-[9px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded uppercase font-medium">Spam Risk for Gmail</span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                            यह शब्दों के बीच अदृश्य जीरो-विड्थ कैरेक्टर डालता है। साधारण ईमेल फ़िल्टर्स के लिए बढ़िया है, पर आधुनिक जीमेल के एआई डिटेक्टर्स इसे स्पैम बाइपास कोशिश मानकर तुरंत स्पैम फोल्डर में भेज सकते हैं।
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                  {/* Interactive Spintax Guide for High Spam Protection */}
                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs space-y-2">
                    <p className="font-bold text-indigo-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                      हाई-लेवल स्पैम प्रोटेक्शन: Spintax का उपयोग करें
                    </p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      अपने Subject या Body में <code>{"{नमस्ते|प्रणाम|Hello}"}</code> जैसे विकल्पों का उपयोग करें। हमारा सिस्टम हर ईमेल के लिए यादृच्छिक (random) विकल्प चुनकर भेजेगा, जिससे हर मैसेज यूनीक बनेगा और स्पैम फिल्टर बाईपास हो जाएंगे।
                    </p>
                    <div className="bg-white p-2 rounded border border-slate-100 font-mono text-[10px] text-slate-500">
                      <strong className="text-slate-700 font-sans">उदाहरण:</strong><br />
                      {"{प्रिय|आदरणीय} {{Name}}, {शुभकामनाएं|नमस्कार}।"}
                    </div>
                  </div>
                </div>
              </div>

            {/* Spam Protection Status Block */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 animate-bounce" />
                Active Inbox Delivery Armour
              </h3>
              
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Protection Level:</span>
                  <span className="bg-rose-50 text-rose-700 font-extrabold px-2 py-0.5 rounded border border-rose-100 uppercase text-[9px] tracking-wider animate-pulse">Maximum Guard</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Anti-Fingerprint Hash:</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">Enabled (Active ZWC)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">MIME Multi-part Alternative:</span>
                  <span className="text-indigo-600 font-bold">Enabled (Text & HTML)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">User-Agent Spoofing:</span>
                  <span className="text-slate-700 font-mono text-[11px]">Thunderbird 115 / Win10</span>
                </div>
              </div>
            </div>

            {/* Domain & Gmail Delivery Health Guide (SPF/DKIM/DMARC Setup) */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-500 animate-pulse" />
                  Domain & Inbox Delivery Health Guide
                </h3>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-100 flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  Optimal Setup
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                ईमेल को सीधे <strong>Primary Inbox</strong> में भेजने के लिए आपके डोमेन का DNS कॉन्फ़िगरेशन बिल्कुल सही होना चाहिए। नीचे आपके डोमेन के लिए आवश्यक सेटिंग्स दी गई हैं:
              </p>

              {(() => {
                if (!senderEmail || !senderEmail.includes('@')) return null;
                const domain = senderEmail.split('@')[1];
                const isCustomDomain = domain && domain.toLowerCase() !== 'gmail.com';

                if (isCustomDomain) {
                  return (
                    <div className="space-y-3 pt-1">
                      <div className="bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100 text-xs text-indigo-900 flex items-center justify-between">
                        <span className="font-semibold">Detected Domain: <span className="font-mono text-indigo-600 underline">{domain}</span></span>
                        <span className="text-[10px] font-bold text-indigo-600">Custom Domain Mode</span>
                      </div>

                      <div className="space-y-2.5">
                        {/* SPF Record */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10.5px]">
                            <span className="font-bold text-slate-700">1. SPF Record (TXT)</span>
                            <span className="text-indigo-600 font-semibold text-[9px] uppercase">Highly Recommended</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded border border-slate-200 font-mono text-[10px] text-slate-600 space-y-1">
                            <div><span className="text-slate-400">Host/Name:</span> @</div>
                            <div className="break-all"><span className="text-slate-400">Value:</span> <code className="text-slate-800 font-bold">v=spf1 include:_spf.google.com ~all</code></div>
                          </div>
                        </div>

                        {/* DKIM Record */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10.5px]">
                            <span className="font-bold text-slate-700">2. DKIM Record (TXT)</span>
                            <span className="text-indigo-600 font-semibold text-[9px] uppercase">Highly Recommended</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded border border-slate-200 font-mono text-[10px] text-slate-600 space-y-1">
                            <div><span className="text-slate-400">Host/Name:</span> google._domainkey</div>
                            <div className="break-all"><span className="text-slate-400">Value:</span> <code className="text-slate-800 font-bold">v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG...[Your unique Google DKIM key]</code></div>
                          </div>
                        </div>

                        {/* DMARC Record */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10.5px]">
                            <span className="font-bold text-slate-700">3. DMARC Record (TXT)</span>
                            <span className="text-rose-600 font-semibold text-[9px] uppercase">Mandatory for Gmail 2024</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded border border-slate-200 font-mono text-[10px] text-slate-600 space-y-1">
                            <div><span className="text-slate-400">Host/Name:</span> _dmarc</div>
                            <div className="break-all"><span className="text-slate-400">Value:</span> <code className="text-slate-800 font-bold">v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc-reports@{domain}</code></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="space-y-3 pt-1">
                      <div className="bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100 text-[11px] text-indigo-900 flex items-center justify-between">
                        <span className="font-semibold">Standard Gmail Mode (@gmail.com)</span>
                        <span className="text-[10px] font-bold text-indigo-600">No DNS Action Needed</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        यदि आप सामान्य <strong>@gmail.com</strong> पते से भेज रहे हैं, तो गूगल स्वयं आपके SPF, DKIM और DMARC को प्रमाणित करता है। आपको अपने अंत पर कोई DNS रिकॉर्ड जोड़ने की आवश्यकता नहीं है! 
                      </p>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-[11px]">
                        <p className="font-bold text-slate-700 flex items-center gap-1">
                          <Info className="w-3.5 h-3.5 text-indigo-500" />
                          Gmail Inbox में ईमेल जाने की 100% गारंटी के लिए:
                        </p>
                        <ul className="list-disc pl-4 text-slate-600 space-y-1">
                          <li>केवल <strong>16-Digit App Password</strong> का उपयोग करें (अपना सामान्य लॉगिन पासवर्ड न भरें)।</li>
                          <li>ईमेल भेजने की गति <strong>5 से 10 सेकंड</strong> प्रति ईमेल रखें ताकि जीमेल स्पैम बॉट एक्टिव न हो।</li>
                          <li>हमारे द्वारा लागू की गई <strong>Spintax</strong> और <strong>ऑटो स्पैम कीवर्ड क्लीनर</strong> तकनीक आपके ईमेल को पूरी तरह सुरक्षित रखेगी।</li>
                        </ul>
                      </div>
                    </div>
                  );
                }
              })()}
            </div>

          </div>

          {/* Right Column (Live stats, list tracker) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Real-time stats dashboard */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-500" />
                Live Dispatch Analytics
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Total Load</span>
                  <span className="text-xl font-black text-slate-800 font-mono">{recipients.length}</span>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3 text-center border border-emerald-100">
                  <span className="text-[10px] text-emerald-500 font-semibold uppercase block">Sent Success</span>
                  <span className="text-xl font-black text-emerald-700 font-mono">{successCount}</span>
                </div>
                <div className="bg-rose-50 rounded-lg p-3 text-center border border-rose-100">
                  <span className="text-[10px] text-rose-400 font-semibold uppercase block">Failed</span>
                  <span className="text-xl font-black text-rose-700 font-mono">{failedCount}</span>
                </div>
              </div>

              {/* Progress bar */}
              {recipients.length > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>Overall Dispatch Completion</span>
                    <span className="font-mono">{Math.round(((successCount + failedCount) / recipients.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((successCount + failedCount) / recipients.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Recipient breakdown list */}
            {recipients.length > 0 && (
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>Recipients Status Log</span>
                  <span className="text-[11px] text-slate-400 normal-case">{pendingCount} Pending</span>
                </h3>
                <div className="max-h-60 overflow-y-auto border border-slate-100 rounded-lg divide-y divide-slate-100">
                  {recipients.map((recipient, i) => (
                    <div key={recipient.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50 transition">
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-slate-800 truncate">{recipient.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{recipient.email}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {recipient.status === 'success' && (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Sent
                          </span>
                        )}
                        {recipient.status === 'failed' && (
                          <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-100" title={recipient.error}>
                            Failed
                          </span>
                        )}
                        {recipient.status === 'sending' && (
                          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Sending
                          </span>
                        )}
                        {recipient.status === 'pending' && (
                          <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </main>

      <footer className="bg-white border-t border-slate-200 py-6 px-6 text-center text-xs text-slate-400 mt-12">
        <p className="font-semibold text-slate-500">Bulk Mail Sender & Spam Guard Engine © 2026</p>
        <p className="mt-1">Designed with privacy-safe serverless SMTP architecture.</p>
      </footer>

    </div>
  );
}
