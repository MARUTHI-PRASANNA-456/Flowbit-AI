import type { FC } from "react";
import { useMapStore } from "@/store/useMapStore";

export const NavigationBar: FC = () => {
  const handleHomeClick = () => {
    // Reset to initial state
    useMapStore.setState({
      sidebarView: "initial",
      searchQuery: "",
      selectedAreaType: null,
      areas: [],
      selectedAreaId: null,
      searchedBoundary: null,
      drawingMode: null,
      isDrawing: false,
    });
  };

  return (
    <div className="w-[75px] h-screen bg-black/50 flex flex-col items-center py-8 gap-10 border-r border-white/10">
      <div className="w-[100px] h-[20px] flex items-center justify-center">
        <img
          src="/logo.png"
          alt="Logo"
          className="w-[75px] h-[75px] object-contain"
        />
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        <button
          onClick={handleHomeClick}
          className="w-[75px] h-[75px] mx-auto flex items-center justify-center text-white hover:bg-white/10 rounded-2xl transition-colors group"
        >
          <img
            src="/nav-home.png"
            alt="Home"
            className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
          />
        </button>
        <button className="w-[60px] h-[60px] mx-auto flex items-center justify-center text-white hover:bg-white/10 rounded-2xl transition-colors group">
          <img
            src="/nav-grid.png"
            alt="Dashboard"
            className="w-[60px] h-[60px] object-contain opacity-80 group-hover:opacity-100 transition-opacity"
          />
        </button>
      </nav>

      <div className="flex flex-col gap-5">
        <button className="w-[33px] h-[33px] mx-auto flex items-center justify-center text-white hover:bg-white/10 rounded-2xl transition-colors group">
          <img
            src="/nav-user.png"
            alt="User"
            className="w-[33px] h-[33px] object-contain opacity-80 group-hover:opacity-100 transition-opacity"
          />
        </button>
        <button className="w-[35px] h-[35px] mx-auto flex items-center justify-center text-white hover:bg-white/10 rounded-2xl transition-colors group">
          <img
            src="/nav-settings.png"
            alt="Settings"
            className="w-[35px] h-[35px] object-contain opacity-80 group-hover:opacity-100 transition-opacity"
          />
        </button>
      </div>
    </div>
  );
};
