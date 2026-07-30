// Use native global fetch available in Node 18+

const sendResetEmail = async (email, token) => {
  try {
    // Vercel backend API URL (this is hosted inside the frontend vercel project)
    const vercelApiUrl = "https://locked-in-five-olive.vercel.app/api/sendEmail";
    
    // Fallback for local testing if needed
    const apiUrl = process.env.NODE_ENV === "development" 
      ? "http://localhost:5173/api/sendEmail" 
      : vercelApiUrl;

    const response = await fetch(vercelApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, token }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to send email via Vercel API");
    }

    console.log("✅ EMAIL SUCCESSFULLY GAYI VIA VERCEL! Message ID:", data.messageId);
    return data;
  } catch (error) {
    console.error("❌ Error while sending mail via Vercel:", error.message);
    throw error;
  }
};

module.exports = sendResetEmail;