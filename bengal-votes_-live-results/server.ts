import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";

async function startServer() {
  const app = express();
  const PORT = 3000;

  const SOURCE = "https://results.eci.gov.in/ResultAcGenMay2026/election-json-S25-live.json";

  app.get("/api/results", async (req, res) => {
    let raw;
    try {
      const response = await fetch(SOURCE, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:126.0) Gecko/20100101 Firefox/126.0',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.5',
          'Referer': 'https://results.eci.gov.in/ResultAcGenMay2026/partywiseresult-S25.htm',
          'Connection': 'keep-alive',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin'
        }
      });
      
      if (!response.ok) {
        throw new Error(`ECI returned ${response.status} ${response.statusText}`);
      }
      raw = await response.json();
    } catch (err) {
      console.error("ECI fetch failed, falling back to local file:", err);
      try {
        const fileContent = await fs.readFile(path.join(process.cwd(), 'src', 'data', 'election-results.json'), 'utf-8');
        raw = JSON.parse(fileContent);
      } catch (fileErr) {
        console.error("Failed to read local fallback:", fileErr);
        return res.status(500).json({ error: "ECI fetch failed and local fallback failed" });
      }
    }

    try {

      let targetArray = [];
      if (Array.isArray(raw)) {
        targetArray = raw;
      } else if (raw.S25 && Array.isArray(raw.S25.chartData)) {
        // Handle ECI legacy JSON payload format
        targetArray = raw.S25.chartData.map((item: any) => ({
          party: item[0],
          constituencyId: item[2],  // index 2 is AC no
          candidate: item[3],       // index 3 is Candidate Name
          status: "Leading",
          color: item[4]            // index 4 is Party Color
        }));
      }

      const formatted = targetArray.map((item: any) => {
        let partyGroup = "OTHERS";
        let color = item.color || "pink";

        if (item.party === "BJP") {
          partyGroup = "BJP";
          color = "orange";
        } else if (
          item.party === "AITC" ||
          item.party === "TMC" ||
          item.party === "All India Trinamool Congress"
        ) {
          partyGroup = "TMC";
          color = "green";
        }

        return {
          constituencyId: item.constituencyId,
          party: partyGroup,
          candidate: item.candidate,
          votes: item.votes,
          status: item.status,
          color: color
        };
      });

      // Optional: seat count summary
      const summary = {
        BJP: formatted.filter((x: any) => x.party === "BJP").length,
        TMC: formatted.filter((x: any) => x.party === "TMC").length,
        OTHERS: formatted.filter((x: any) => x.party === "OTHERS").length
      };

      res.json({
        lastUpdated: new Date().toISOString(),
        summary,
        data: formatted
      });

    } catch (err) {
      console.error("Express Error:", err);
      res.status(500).json({ error: "ECI fetch failed", details: String(err) });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
