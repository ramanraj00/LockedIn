// Use native global fetch available in Node 18+

const sendResetEmail = async (email, token) => {
  // Vercel backend API URL (this is hosted inside the frontend vercel project)
  const vercelApiUrl = "https://locked-in-five-olive.vercel.app/api/sendEmail";
  
  // Fallback for local testing if needed
  const apiUrl = process.env.NODE_ENV === "development" 
    ? "http://localhost:5173/api/sendEmail" 
    : vercelApiUrl;

  const MAX_RETRIES = 2;
  const TIMEOUT_MS = 25000; // 25 seconds (Vercel cold start + SMTP can take time)

  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        // Exponential backoff: 2s, 4s
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`🔄 Retry attempt ${attempt}/${MAX_RETRIES} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // AbortController for timeout — prevents Render from hanging indefinitely
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email via Vercel API");
      }

      console.log("✅ EMAIL SUCCESSFULLY GAYI VIA VERCEL! Message ID:", data.messageId);
      return data;
    } catch (error) {
      lastError = error;
      
      if (error.name === 'AbortError') {
        console.error(`⏱️ Attempt ${attempt + 1}: Vercel API timed out after ${TIMEOUT_MS}ms`);
      } else {
        console.error(`❌ Attempt ${attempt + 1}: Error sending mail via Vercel:`, error.message);
      }

      // Don't retry on non-retryable errors (4xx client errors)
      if (error.message && error.message.includes("Missing email")) {
        throw error;
      }
    }
  }

  console.error("❌ All retry attempts failed for sending email to:", email);
  throw lastError;
};

module.exports = sendResetEmail;
