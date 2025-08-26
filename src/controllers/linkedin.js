let access_token = null;
const welcomeLinkedin = async (req, res) => {
  res.json({ success: "Welcome to linkedin api" });
};
const SaveCallbackLinkedin = async (req, res) => {
  const { code, state } = req.body;
  if (!code) {
    res.status(500).json({ error: "Pas de code" });
  }
  if (!state) {
    res.status(500).json({ error: "Pas de state" });
  }
  try {
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.REDIRECT_URI,
      client_id: process.env.LINKEDIN_CLIENT_ID,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET,
    });

    const response = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      params
    );
    access_token = response.data.access_token;
    res.json({ success: true, code: code, state: state });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to get access token" });
  }
};

// 2. Partager une publication
const ShareOnLinkedin = async (req, res) => {
  const { message } = req.body;
  try {
    const profile = await axios.get("https://api.linkedin.com/v2/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const urn = profile.data.id;

    const postData = {
      author: `urn:li:person:${urn}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: message,
          },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    await axios.post("https://api.linkedin.com/v2/ugcPosts", postData, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json",
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to share post" });
  }
};
module.exports = {
  SaveCallbackLinkedin,
  ShareOnLinkedin,
  welcomeLinkedin,
};
