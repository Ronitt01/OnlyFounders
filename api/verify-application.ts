import { verifyApplication } from "../lib/verifyApplication.js";

export default function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });
  return verifyApplication(req, res);
}
