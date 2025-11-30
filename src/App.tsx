import { NavigationBar } from "@/components/NavigationBar";
import { Sidebar } from "@/components/Sidebar";
import { MapView } from "@/components/MapView";

function App() {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Map Background */}
      <div className="absolute inset-0 z-0">
        <MapView />
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 flex pointer-events-none">
        <div className="pointer-events-auto">
          <NavigationBar />
        </div>
        <div className="pointer-events-auto">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}

export default App;
