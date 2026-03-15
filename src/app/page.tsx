import MapViewDynamic from "@/components/map/MapViewDynamic";
import { Header } from "@/components/layout/Header";
import { UploadModal } from "@/components/modals/UploadModal";
import { RecordingModal } from "@/components/modals/RecordingModal";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <MapViewDynamic />
      <Header />
      <UploadModal />
      <RecordingModal />
    </main>
  );
}
