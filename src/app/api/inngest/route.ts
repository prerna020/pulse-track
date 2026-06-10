import { serve } from "inngest/next";

import { inngest } from "@/inngest/client";
import { dailyScrape } from "@/inngest/functions/dailyScrape";
import { weeklyEmailDigest } from "@/inngest/functions/weeklyEmailDigest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [dailyScrape, weeklyEmailDigest],
});
