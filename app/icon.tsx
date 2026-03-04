import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";
export const size = {
  width: 192,
  height: 192,
};

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
          background: "#0f766e",
          color: "#ffffff",
          fontSize: 110,
          fontWeight: 700,
          borderRadius: 40,
        }}
      >
        H
      </div>
    ),
    {
      ...size,
    }
  );
}
