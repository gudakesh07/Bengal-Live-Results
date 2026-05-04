import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const SOURCE = "https://results.eci.gov.in/ResultAcGenMay2026/election-json-S25-live.json";

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
    console.error("ECI fetch failed, falling back to empty/error:", err);
    return res.status(500).json({ error: "ECI fetch failed", details: String(err) });
  }

  try {
    let targetArray = [];
    if (Array.isArray(raw)) {
      targetArray = raw;
    } else if (raw.S25 && Array.isArray(raw.S25.chartData)) {
      targetArray = raw.S25.chartData.map((item: any) => ({
        party: item[0],
        constituencyId: item[2],
        candidate: item[3],
        status: "Leading",
        color: item[4]
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
        votes: item.votes || 0,
        status: item.status,
        color: color
      };
    });

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
    console.error("Vercel Serverless Error:", err);
    res.status(500).json({ error: "Data processing failed", details: String(err) });
  }
}
