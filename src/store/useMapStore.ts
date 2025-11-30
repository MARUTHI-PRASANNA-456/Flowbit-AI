import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LatLngExpression } from "leaflet";

export type AreaType =
  | "City Proper"
  | "Inner City / Downtown"
  | "Districts / Boroughs"
  | "Neighborhoods / Quarters"
  | "Metropolitan Area"
  | "Suburbs / Peripheral Towns"
  | "Greater Region / Administrative Region"
  | "Functional Use Zones";

export interface Area {
  id: string;
  name: string;
  type: "polygon" | "line" | "point";
  coordinates: any; // Leaflet coordinates
  visible: boolean;
  createdAt: number;
}

export interface MapState {
  // UI State
  sidebarView: "initial" | "search" | "areas-defined";
  searchQuery: string;
  selectedAreaType: AreaType | null;

  // Map State
  areas: Area[];
  selectedAreaId: string | null;
  mapView: "map" | "satellite";
  currentCenter: [number, number];
  currentZoom: number;

  // Drawing State
  isDrawing: boolean;
  drawingMode:
  | "polygon"
  | "line"
  | "point"
  | "edit"
  | "erase"
  | "curved"
  | "polyline"
  | "rectangle"
  | null;

  // Actions
  setSidebarView: (view: "initial" | "search" | "areas-defined") => void;
  setSearchQuery: (query: string) => void;
  setSelectedAreaType: (type: AreaType | null) => void;

  addArea: (area: Omit<Area, "id" | "createdAt">) => void;
  updateArea: (id: string, updates: Partial<Area>) => void;
  deleteArea: (id: string) => void;
  toggleAreaVisibility: (id: string) => void;
  setSelectedArea: (id: string | null) => void;

  setMapView: (view: "map" | "satellite") => void;
  setMapState: (center: [number, number], zoom: number) => void;
  setDrawingMode: (
    mode:
      | "polygon"
      | "line"
      | "point"
      | "edit"
      | "erase"
      | "curved"
      | "polyline"
      | "rectangle"
      | null
  ) => void;
  setIsDrawing: (isDrawing: boolean) => void;

  clearAllAreas: () => void;

  flyToCoordinates: LatLngExpression | null;
  setFlyToCoordinates: (coords: LatLngExpression | null) => void;

  flyToBounds: [[number, number], [number, number]] | null;
  setFlyToBounds: (bounds: [[number, number], [number, number]] | null) => void;

  // Searched Boundary State
  searchedBoundary: {
    name: string;
    geometry: any; // GeoJSON geometry
    displayName: string;
  } | null;
  setSearchedBoundary: (
    boundary: {
      name: string;
      geometry: any;
      displayName: string;
    } | null
  ) => void;
  applyBoundaryAsArea: () => void;
}

export const useMapStore = create<MapState>()(
  persist(
    (set) => ({
      // Initial State
      sidebarView: "initial",
      searchQuery: "",
      selectedAreaType: null,

      areas: [],
      selectedAreaId: null,
      mapView: "satellite",
      currentCenter: [50.9375, 6.9603], // Default to Cologne
      currentZoom: 11,

      isDrawing: false,
      drawingMode: null,

      // Actions
      setSidebarView: (view) => set({ sidebarView: view }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedAreaType: (type) => set({ selectedAreaType: type }),

      addArea: (area) =>
        set((state) => ({
          areas: [
            ...state.areas,
            {
              ...area,
              id: `area-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              createdAt: Date.now(),
            },
          ],
        })),

      updateArea: (id, updates) =>
        set((state) => ({
          areas: state.areas.map((area) =>
            area.id === id ? { ...area, ...updates } : area
          ),
        })),

      deleteArea: (id) =>
        set((state) => ({
          areas: state.areas.filter((area) => area.id !== id),
          selectedAreaId:
            state.selectedAreaId === id ? null : state.selectedAreaId,
        })),

      toggleAreaVisibility: (id) =>
        set((state) => ({
          areas: state.areas.map((area) =>
            area.id === id ? { ...area, visible: !area.visible } : area
          ),
        })),

      setSelectedArea: (id) => set({ selectedAreaId: id }),

      setMapView: (view) => set({ mapView: view }),
      setMapState: (center, zoom) => set({ currentCenter: center, currentZoom: zoom }),
      setDrawingMode: (mode) => set({ drawingMode: mode }),
      setIsDrawing: (isDrawing) => set({ isDrawing }),

      clearAllAreas: () => set({ areas: [], selectedAreaId: null }),

      // Search Navigation
      flyToCoordinates: null,
      setFlyToCoordinates: (coords) => set({ flyToCoordinates: coords }),

      flyToBounds: null,
      setFlyToBounds: (bounds) => set({ flyToBounds: bounds }),

      // Searched Boundary
      searchedBoundary: null,
      setSearchedBoundary: (boundary) => set({ searchedBoundary: boundary }),
      applyBoundaryAsArea: () =>
        set((state) => {
          if (!state.searchedBoundary) return state;

          // Convert GeoJSON geometry to Leaflet coordinates
          const geometry = state.searchedBoundary.geometry;
          let coordinates: any;

          if (geometry.type === "Polygon") {
            // GeoJSON uses [lon, lat], Leaflet uses [lat, lon]
            coordinates = geometry.coordinates[0].map((coord: number[]) => [
              coord[1],
              coord[0],
            ]);
          } else if (geometry.type === "MultiPolygon") {
            // Take the first polygon from multipolygon
            coordinates = geometry.coordinates[0][0].map((coord: number[]) => [
              coord[1],
              coord[0],
            ]);
          }

          return {
            areas: [
              ...state.areas,
              {
                id: `area-${Date.now()}-${Math.random()
                  .toString(36)
                  .substr(2, 9)}`,
                name: state.searchedBoundary.name,
                type: "polygon" as const,
                coordinates,
                visible: true,
                createdAt: Date.now(),
              },
            ],
            searchedBoundary: null, // Clear after applying
          };
        }),
    }),
    {
      name: "map-storage",
      partialize: (state) => ({
        areas: state.areas,
        mapView: state.mapView,
      }),
    }
  )
);
