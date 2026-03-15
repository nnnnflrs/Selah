import MapViewDynamic from "@/components/map/MapViewDynamic";
import { Header } from "@/components/layout/Header";
import { UploadModal } from "@/components/modals/UploadModal";
import { RecordingModal } from "@/components/modals/RecordingModal";

export default function Home() {
  return (
    <main className="h-screen w-screen relative overflow-hidden">
      <MapViewDynamic />
      <Header />
      <UploadModal />
      <RecordingModal />
    </main>
  );
}
