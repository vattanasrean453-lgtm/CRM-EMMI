import https from "node:https";
import fs from "node:fs";

// Reliable IPv4 fetch to eliminate Windows undici ConnectTimeoutError
function fetchIPv4(
  urlStr: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  } = {}
): Promise<{
  ok: boolean;
  status: number;
  text: () => Promise<string>;
  json: () => Promise<any>;
}> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const req = https.request(
      url,
      {
        method: options.method || "GET",
        headers: options.headers || {},
        family: 4, // Force IPv4 to eliminate IPv6 hangs
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          resolve({
            ok: (res.statusCode || 500) >= 200 && (res.statusCode || 500) < 300,
            status: res.statusCode || 500,
            text: async () => data,
            json: async () => JSON.parse(data),
          });
        });
      }
    );
    req.on("error", reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

let cachedAccessToken: string | null = null;
let tokenExpiresAt = 0;

export async function getAccessToken(forceRefresh = false): Promise<string> {
  const now = Date.now();
  if (!forceRefresh && cachedAccessToken && now < tokenExpiresAt - 60000) {
    return cachedAccessToken;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  let refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  // Check token.json file as backup if env var missing
  const tokenJsonPath = "C:\\Users\\KRC\\.gemini\\antigravity\\plugin_data\\gsheets\\token.json";
  if ((!refreshToken || !clientId) && fs.existsSync(tokenJsonPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(tokenJsonPath, "utf-8"));
      if (data.token?.refresh_token) {
        refreshToken = data.token.refresh_token;
      }
    } catch {
      // ignore
    }
  }

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing Google OAuth credentials in environment variables.");
  }

  const response = await fetchIPv4("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    cachedAccessToken = null;
    tokenExpiresAt = 0;
    throw new Error(`Failed to refresh Google access token: ${errorText}`);
  }

  const data = await response.json();
  cachedAccessToken = data.access_token;
  tokenExpiresAt = now + (data.expires_in || 3600) * 1000;

  return cachedAccessToken as string;
}

export async function getSheetValues(spreadsheetId: string, range: string): Promise<any[][]> {
  let accessToken = await getAccessToken();
  const encodedRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}`;

  let response = await fetchIPv4(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  // If 401, clear cache and retry once with a freshly refreshed token
  if (response.status === 401) {
    accessToken = await getAccessToken(true);
    response = await fetchIPv4(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to read sheet [${range}]: ${errorText}`);
  }

  const data = await response.json();
  return data.values || [];
}

export async function appendSheetValues(
  spreadsheetId: string,
  range: string,
  values: any[][]
): Promise<any> {
  let accessToken = await getAccessToken();
  const encodedRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}:append?valueInputOption=USER_ENTERED`;

  let response = await fetchIPv4(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values }),
  });

  if (response.status === 401) {
    accessToken = await getAccessToken(true);
    response = await fetchIPv4(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values }),
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to append sheet [${range}]: ${errorText}`);
  }

  return await response.json();
}

export async function updateSheetValues(
  spreadsheetId: string,
  range: string,
  values: any[][]
): Promise<any> {
  let accessToken = await getAccessToken();
  const encodedRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}?valueInputOption=USER_ENTERED`;

  let response = await fetchIPv4(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values }),
  });

  if (response.status === 401) {
    accessToken = await getAccessToken(true);
    response = await fetchIPv4(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values }),
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update sheet [${range}]: ${errorText}`);
  }

  return await response.json();
}
