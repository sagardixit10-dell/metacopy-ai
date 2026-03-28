import { useState, useRef } from "react";

const TONES = ["Bold & Punchy", "Soft & Emotional", "Witty & Playful", "Urgent & FOMO", "Luxury & Premium", "Trust & Social Proof"];
const GOALS = ["Drive Sales", "Generate Leads", "Brand Awareness", "App Installs", "Website Traffic", "Retargeting"];
const AUDIENCES = ["Women 25-35", "Men 30-45", "Gen Z (18-24)", "Parents", "Professionals", "Fitness Enthusiasts", "Beauty Lovers", "Tech Savvy"];

const TAGLINE_COLORS = ["#FF6B35", "#00D4AA", "#A78BFA"];

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
    </svg>
  );
}

function AdCard({ ad, index, onCopy, copiedField }) {
  const color = TAGLINE_COLORS[index % 3];
  const labels = [
    { key: "primary_text", label: "Primary Text" },
    { key: "headline", label: "Headline" },
    { key: "description", label: "Description" },
    { key: "cta", label: "CTA Button" },
  ];

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: `1px solid rgba(255,255,255,0.08)`,
      borderRadius: "16px",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
      animation: `slideUp 0.5s ease ${index * 0.15}s both`,
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "3px",
        background: `linear-gradient(90deg, ${color}, transparent)`,
      }} />
      <div style={{
        display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px"
      }}>
        <div style={{
          width: "28px", height: "28px", borderRadius: "8px",
          background: `${color}20`, border: `1px solid ${color}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "12px", fontWeight: "700", color,
        }}>
          {index + 1}
        </div>
        <span style={{ fontSize: "13px", fontWeight: "600", color: "#888", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Ad Variation {index + 1}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {labels.map(({ key, label }) => (
          <div key={key} style={{
            background: "rgba(255,255,255,0.04)",
            borderRadius: "10px",
            padding: "12px 14px",
            position: "relative",
          }}>
            <div style={{ fontSize: "10px", fontWeight: "700", color: color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>
              {label}
            </div>
            <div style={{ fontSize: "14px", color: "#E8E8E8", lineHeight: "1.6", paddingRight: "32px" }}>
              {ad[key] || "—"}
            </div>
            <button
              onClick={() => onCopy(`${index}-${key}`, ad[key])}
              style={{
                position: "absolute", top: "12px", right: "12px",
                background: copiedField === `${index}-${key}` ? "#00D4AA20" : "rgba(255,255,255,0.06)",
                border: `1px solid ${copiedField === `${index}-${key}` ? "#00D4AA40" : "rgba(255,255,255,0.1)"}`,
                borderRadius: "6px", padding: "5px 6px", cursor: "pointer",
                color: copiedField === `${index}-${key}` ? "#00D4AA" : "#666",
                display: "flex", alignItems: "center", transition: "all 0.2s",
              }}
            >
              {copiedField === `${index}-${key}` ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MetaAdCopyGenerator() {
  const [form, setForm] = useState({
    brand: "", product: "", audience: "", goal: "Drive Sales", tone: "Bold & Punchy", usp: ""
  });
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState("");
  const [generated, setGenerated] = useState(false);

  const handleCopy = (fieldKey, text) => {
    navigator.clipboard.writeText(text || "");
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const handleGenerate = async () => {
    if (!form.brand || !form.product) {
      setError("Please fill in Brand Name and Product/Service at minimum.");
      return;
    }
    setError("");
    setLoading(true);
    setAds([]);

    const prompt = `You are an expert Meta Ads copywriter with 10+ years of experience writing high-converting Facebook and Instagram ad copy.

Generate 3 distinct Meta Ad variations for the following:

Brand: ${form.brand}
Product/Service: ${form.product}
Target Audience: ${form.audience || "General"}
Campaign Goal: ${form.goal}
Tone/Style: ${form.tone}
USP / Key Message: ${form.usp || "Not specified"}

For each variation, provide:
- primary_text: (Facebook/Instagram primary text, 1-3 sentences, compelling hook + value prop + soft CTA, max 125 chars for feed)
- headline: (Bold headline, max 40 characters, punchy and benefit-driven)
- description: (News feed link description, max 30 characters)
- cta: (Best CTA button: Shop Now / Learn More / Sign Up / Get Offer / Book Now / Download)

Return ONLY a valid JSON array with exactly 3 objects. No extra text, no markdown fences. Example:
[{"primary_text":"...","headline":"...","description":"...","cta":"..."},...]`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await response.json();
      const text = data.content?.map(i => i.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setAds(parsed);
      setGenerated(true);
    } catch (err) {
      setError("Something went wrong generating the ads. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0F",
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      color: "#fff",
      padding: "0",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .input-field {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 12px 14px;
          color: #fff;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: all 0.2s;
        }
        .input-field:focus {
          border-color: #FF6B35;
          background: rgba(255,107,53,0.05);
          box-shadow: 0 0 0 3px rgba(255,107,53,0.1);
        }
        .input-field::placeholder { color: #444; }
        
        select.input-field option { background: #1a1a1a; }
        
        .tag-btn {
          padding: 6px 12px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: #777;
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .tag-btn:hover, .tag-btn.active {
          border-color: #FF6B35;
          color: #FF6B35;
          background: rgba(255,107,53,0.08);
        }
        
        .gen-btn {
          width: 100%;
          padding: 15px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #FF6B35, #FF3366);
          background-size: 200% 200%;
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: 0.02em;
        }
        .gen-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(255,107,53,0.4);
          animation: gradientShift 2s ease infinite;
        }
        .gen-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .loader {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "20px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(255,255,255,0.02)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "linear-gradient(135deg, #FF6B35, #FF3366)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <SparkIcon />
          </div>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: "800", letterSpacing: "-0.01em" }}>
              MetaCopy<span style={{ color: "#FF6B35" }}>AI</span>
            </div>
            <div style={{ fontSize: "11px", color: "#555", letterSpacing: "0.05em" }}>AI-POWERED META ADS GENERATOR</div>
          </div>
        </div>
        <div style={{
          fontSize: "11px", color: "#444", background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "5px 12px",
          display: "flex", alignItems: "center", gap: "6px"
        }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00D4AA", animation: "pulse 2s infinite" }} />
          Claude AI
        </div>
      </div>

      <div style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "32px 24px",
        display: "grid",
        gridTemplateColumns: "360px 1fr",
        gap: "24px",
        alignItems: "start",
      }}>
        {/* LEFT PANEL - Form */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "20px",
          padding: "24px",
          position: "sticky",
          top: "90px",
        }}>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "20px", fontWeight: "800", marginBottom: "6px" }}>
              Campaign Brief
            </h2>
            <p style={{ fontSize: "13px", color: "#555" }}>Fill in your brand details to generate high-converting Meta ad copy</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Brand */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#888", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                Brand Name *
              </label>
              <input
                className="input-field"
                placeholder="e.g. Dr. Rashel, Nykaa, OZiva"
                value={form.brand}
                onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
              />
            </div>

            {/* Product */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#888", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                Product / Service *
              </label>
              <input
                className="input-field"
                placeholder="e.g. Vitamin C Serum, Hair Growth Oil"
                value={form.product}
                onChange={e => setForm(f => ({ ...f, product: e.target.value }))}
              />
            </div>

            {/* USP */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#888", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                Key USP / Hook
              </label>
              <input
                className="input-field"
                placeholder="e.g. 2% Niacinamide, 30-day results, Dermat tested"
                value={form.usp}
                onChange={e => setForm(f => ({ ...f, usp: e.target.value }))}
              />
            </div>

            {/* Audience */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#888", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                Target Audience
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {AUDIENCES.map(a => (
                  <button
                    key={a}
                    className={`tag-btn ${form.audience === a ? "active" : ""}`}
                    onClick={() => setForm(f => ({ ...f, audience: f.audience === a ? "" : a }))}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Goal */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#888", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                Campaign Goal
              </label>
              <select
                className="input-field"
                value={form.goal}
                onChange={e => setForm(f => ({ ...f, goal: e.target.value }))}
              >
                {GOALS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>

            {/* Tone */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#888", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                Ad Tone
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {TONES.map(t => (
                  <button
                    key={t}
                    className={`tag-btn ${form.tone === t ? "active" : ""}`}
                    onClick={() => setForm(f => ({ ...f, tone: t }))}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ background: "rgba(255,51,102,0.08)", border: "1px solid rgba(255,51,102,0.2)", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#FF3366" }}>
                {error}
              </div>
            )}

            <button className="gen-btn" onClick={handleGenerate} disabled={loading}>
              {loading ? (
                <><div className="loader" /> Generating 3 Ads...</>
              ) : (
                <><SparkIcon /> Generate Ad Copy</>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL - Results */}
        <div>
          {!generated && !loading && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              minHeight: "400px", textAlign: "center", padding: "40px",
            }}>
              <div style={{
                width: "80px", height: "80px", borderRadius: "20px",
                background: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "20px", fontSize: "36px"
              }}>
                📢
              </div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: "800", marginBottom: "10px" }}>
                Ready to Create?
              </h3>
              <p style={{ color: "#555", fontSize: "14px", maxWidth: "320px", lineHeight: "1.7" }}>
                Fill in your campaign brief on the left and hit Generate. Claude AI will write 3 unique, high-converting Meta ad variations for you instantly.
              </p>
              <div style={{ display: "flex", gap: "20px", marginTop: "32px", flexWrap: "wrap", justifyContent: "center" }}>
                {["Primary Text", "Headline", "Description", "CTA"].map(f => (
                  <div key={f} style={{ fontSize: "12px", color: "#444", display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FF6B35" }} />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              minHeight: "400px", gap: "16px"
            }}>
              <div style={{
                width: "48px", height: "48px",
                border: "3px solid rgba(255,107,53,0.2)",
                borderTop: "3px solid #FF6B35",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }} />
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: "700" }}>
                Claude is writing your ads...
              </div>
              <div style={{ fontSize: "13px", color: "#555" }}>Analyzing brand, audience & tone</div>
            </div>
          )}

          {ads.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "20px", fontWeight: "800" }}>
                    Your Ad Variations
                  </h2>
                  <p style={{ fontSize: "13px", color: "#555", marginTop: "2px" }}>
                    3 variations for <span style={{ color: "#FF6B35" }}>{form.brand}</span> · {form.goal} · {form.tone}
                  </p>
                </div>
                <button
                  onClick={handleGenerate}
                  style={{
                    background: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.2)",
                    borderRadius: "8px", padding: "8px 14px", color: "#FF6B35",
                    fontSize: "13px", fontWeight: "600", cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: "6px"
                  }}
                >
                  <SparkIcon /> Regenerate
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {ads.map((ad, i) => (
                  <AdCard key={i} ad={ad} index={i} onCopy={handleCopy} copiedField={copiedField} />
                ))}
              </div>

              <div style={{
                marginTop: "20px", padding: "16px 20px",
                background: "rgba(0,212,170,0.05)", border: "1px solid rgba(0,212,170,0.12)",
                borderRadius: "12px", display: "flex", alignItems: "center", gap: "12px"
              }}>
                <span style={{ fontSize: "20px" }}>💡</span>
                <div style={{ fontSize: "13px", color: "#888", lineHeight: "1.6" }}>
                  <strong style={{ color: "#00D4AA" }}>Pro Tip:</strong> A/B test all 3 variations with equal budget for 3-5 days. Let data decide the winner before scaling. Always pair with strong creative visuals.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center", padding: "20px", borderTop: "1px solid rgba(255,255,255,0.05)",
        fontSize: "12px", color: "#333", marginTop: "20px"
      }}>
        Built with Claude AI · VibeCon 2025 · Made by Sagar Dixit
      </div>
    </div>
  );
}