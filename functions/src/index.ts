/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import {initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";
import {lookup} from "node:dns/promises";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });
initializeApp();

const MAX_SOURCE_BYTES = 3 * 1024 * 1024;
const MAX_EXTRACTED_CHARS = 12000;

function isPublicIp(address: string): boolean {
  if (address.includes(":")) return address !== "::1" && !address.toLowerCase().startsWith("fc") && !address.toLowerCase().startsWith("fd") && !address.toLowerCase().startsWith("fe80");
  const parts = address.split(".").map(Number);
  return parts.length === 4 && !(
    parts[0] === 10 || parts[0] === 127 || parts[0] === 0 ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168)
  );
}

async function safePublicUrl(rawUrl: string): Promise<URL> {
  const url = new URL(rawUrl);
  if (url.protocol !== "https:" || !url.hostname || url.username || url.password) {
    throw new Error("Use a public HTTPS learning-resource URL.");
  }
  const addresses = await lookup(url.hostname, {all: true});
  if (!addresses.length || addresses.some(({address}) => !isPublicIp(address))) {
    throw new Error("The learning-resource host is not publicly reachable.");
  }
  return url;
}

function textFromHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'").replace(/\s+/g, " ").trim();
}

async function downloadText(url: URL): Promise<{sourceUrl: string; title: string; content: string; contentType: string}> {
  let current = url;
  for (let redirects = 0; redirects <= 3; redirects += 1) {
    const response = await fetch(current, {redirect: "manual", signal: AbortSignal.timeout(12000), headers: {"User-Agent": "NumeRead-Learning-Material/1.0"}});
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location || redirects === 3) throw new Error("The source redirected too many times.");
      current = await safePublicUrl(new URL(location, current).toString());
      continue;
    }
    if (!response.ok) throw new Error(`The source returned ${response.status}.`);
    const contentType = (response.headers.get("content-type") || "").toLowerCase();
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      throw new Error("This importer currently accepts public HTML or plain-text files. Use a web lesson or .txt source.");
    }
    const length = Number(response.headers.get("content-length") || 0);
    if (length > MAX_SOURCE_BYTES) throw new Error("The source is too large (maximum 3 MB).");
    const body = await response.text();
    if (body.length > MAX_SOURCE_BYTES) throw new Error("The source is too large (maximum 3 MB).");
    const content = (contentType.includes("html") ? textFromHtml(body) : body.replace(/\s+/g, " ").trim()).slice(0, MAX_EXTRACTED_CHARS);
    if (content.length < 80) throw new Error("The source did not contain enough readable lesson text.");
    const title = contentType.includes("html") ? (body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || current.hostname).replace(/<[^>]+>/g, "").trim() : current.pathname.split("/").pop() || current.hostname;
    return {sourceUrl: current.toString(), title: title.slice(0, 160), content, contentType};
  }
  throw new Error("The source could not be imported.");
}

// A teacher selects the public resource. The server fetches it so browser CORS
// restrictions do not prevent access, stores its readable text, and makes that
// same text available to the game-content generator.
export const importOnlineMaterial = onRequest({cors: true}, async (request, response) => {
  if (request.method !== "POST") {
    response.status(405).json({error: "POST is required."});
    return;
  }
  try {
    const token = String(request.get("authorization") || "").replace(/^Bearer\s+/i, "");
    if (!token) throw new Error("Sign in as a verified teacher first.");
    const user = await getAuth().verifyIdToken(token);
    if (!user.email_verified) throw new Error("Verify the teacher email before importing a resource.");
    const teacher = await getFirestore().collection("teacherAccounts").doc(user.uid).get();
    if (!teacher.exists || teacher.data()?.role !== "teacher") throw new Error("A teacher account is required.");
    const input = request.body || {};
    const downloaded = await downloadText(await safePublicUrl(String(input.sourceUrl || "")));
    const data = teacher.data() || {};
    const material = {
      title: String(input.title || downloaded.title).trim().slice(0, 160), category: "Online Learning Material",
      area: String(input.area || "Reading").slice(0, 40), level: String(input.level || "All Levels").slice(0, 40),
      section: data.section, teacherUid: user.uid, createdBy: data.name || "Teacher", sourceUrl: downloaded.sourceUrl,
      sourceType: downloaded.contentType, content: downloaded.content, summary: downloaded.content.slice(0, 240),
      keywords: Array.isArray(input.keywords) ? input.keywords.slice(0, 12).map(String) : [], activityIds: Array.isArray(input.activityIds) ? input.activityIds.slice(0, 4).map(String) : [],
      gameQuestions: [], createdAt: new Date().toISOString()
    };
    const ref = getFirestore().collection("learningMaterials").doc();
    await ref.set({...material, id: ref.id, createdAtServer: new Date()});
    logger.info("Online learning material imported", {materialId: ref.id, teacherUid: user.uid, host: new URL(downloaded.sourceUrl).hostname});
    response.status(201).json({id: ref.id, ...material});
    return;
  } catch (error) {
    const message = error instanceof Error ? error.message : "The online material could not be imported.";
    logger.warn("Online material import rejected", {message});
    response.status(400).json({error: message});
    return;
  }
});

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
