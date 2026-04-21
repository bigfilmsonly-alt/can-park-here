import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Park - Can I Park Here?"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #070b14, #0c1322, #0a0f1a)",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 72 }}>
          {/* Left: branding */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 460,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 28,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: "#3b82f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 30,
                  fontWeight: 800,
                }}
              >
                P
              </div>
              <span
                style={{
                  fontSize: 38,
                  fontWeight: 600,
                  color: "white",
                  letterSpacing: -2,
                }}
              >
                park
                <span style={{ color: "#3b82f6" }}>.</span>
              </span>
            </div>
            <h1
              style={{
                fontSize: 58,
                fontWeight: 800,
                color: "white",
                lineHeight: 1.1,
                letterSpacing: -2,
                margin: 0,
              }}
            >
              Can I Park Here?
            </h1>
            <p
              style={{
                fontSize: 24,
                color: "rgba(255,255,255,0.5)",
                margin: "18px 0 0",
                lineHeight: 1.4,
              }}
            >
              Clear answers. No tickets. No confusion.
            </p>
          </div>

          {/* Right: iPhone mockup */}
          <div
            style={{
              width: 250,
              height: 510,
              borderRadius: 42,
              background:
                "linear-gradient(145deg, #3a3a3e, #1f1f23, #2a2a2e)",
              padding: 10,
              boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
              display: "flex",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 34,
                background: "#fafbff",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              {/* Dynamic Island */}
              <div
                style={{
                  width: 90,
                  height: 26,
                  background: "#000",
                  borderRadius: 14,
                  position: "absolute",
                  top: 10,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "50px 14px 0",
                  gap: 10,
                  flex: 1,
                }}
              >
                {/* Avatar row */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      background:
                        "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                    }}
                  />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 9, color: "#94a3b8" }}>
                      Good evening
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#0f172a",
                      }}
                    >
                      Park
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginTop: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 7,
                      fontWeight: 700,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    You&apos;re on
                  </span>
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#0f172a",
                      letterSpacing: -0.5,
                      marginTop: 2,
                    }}
                  >
                    Market St &amp; Valencia
                  </span>
                </div>

                {/* CTA */}
                <div
                  style={{
                    background:
                      "linear-gradient(150deg, #3b82f6, #1d4ed8)",
                    borderRadius: 18,
                    padding: "14px 12px",
                    color: "white",
                    marginTop: 6,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <span
                    style={{
                      fontSize: 7,
                      fontWeight: 800,
                      opacity: 0.85,
                      letterSpacing: 1,
                    }}
                  >
                    CAN I PARK HERE?
                  </span>
                  <span
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      letterSpacing: -1,
                      marginTop: 2,
                    }}
                  >
                    Tap to check.
                  </span>
                  <span style={{ fontSize: 9, opacity: 0.8, marginTop: 4 }}>
                    Instant answer &middot; Protected by Guarantee
                  </span>
                </div>

                {/* Quick actions */}
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  <div
                    style={{
                      flex: 1,
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 14,
                      padding: 10,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#0f172a",
                      }}
                    >
                      Scan sign
                    </span>
                    <span
                      style={{ fontSize: 8, color: "#94a3b8", marginTop: 1 }}
                    >
                      Point at any sign
                    </span>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 14,
                      padding: 10,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#0f172a",
                      }}
                    >
                      Set timer
                    </span>
                    <span
                      style={{ fontSize: 8, color: "#94a3b8", marginTop: 1 }}
                    >
                      Remind me before
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom nav mockup */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  padding: "10px 16px 16px",
                }}
              >
                {["Home", "Map", "Spots", "Rewards"].map((label) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        background:
                          label === "Home" ? "#3b82f6" : "#e2e8f0",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 7,
                        fontWeight: 600,
                        color:
                          label === "Home" ? "#3b82f6" : "#94a3b8",
                      }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
