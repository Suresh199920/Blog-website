import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Favicon, generated as an edge route so it always matches the logo
 * component without a build step or a binary file in the repo.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4f46e5 0%, #312e81 100%)",
          borderRadius: 7,
          color: "white",
          fontSize: 21,
          fontWeight: 700,
        }}
      >
        S
      </div>
    ),
    { ...size }
  );
}