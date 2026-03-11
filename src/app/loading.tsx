export default function Loading() {
  return (
    <div className="h-screen w-screen bg-selah-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-4 h-4 rounded-full animate-pulse-glow"
          style={
            {
              "--glow-color": "#00f0ff",
              backgroundColor: "#00f0ff",
              boxShadow: "0 0 12px 4px #00f0ff",
            } as React.CSSProperties
          }
        />
        <span className="text-selah-400 text-sm">Loading...</span>
      </div>
    </div>
  );
}
