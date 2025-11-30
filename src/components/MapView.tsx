import { type FC, useEffect, useRef } from "react";
import * as React from "react";
import {
  MapContainer,
  TileLayer,
  WMSTileLayer,
  Polygon,
  Polyline,
  Marker,
  useMap,
  Popup,
} from "react-leaflet";

import { useMapStore } from "@/store/useMapStore";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "@geoman-io/leaflet-geoman-free";
import HelpAssistantImage from "@/assets/help-assistant.png";
import ToolPolyline from "@/assets/tool-polyline.png";
import ToolCurved from "@/assets/tool-curved.png";
import ToolArea from "@/assets/tool-area.png";
import ToolSelect from "@/assets/tool-select.png";
import ToolRectangle from "@/assets/tool-rectangle.png";
import IconChat from "@/assets/icon-chat.png";
import IconPlus from "@/assets/icon-plus.png";
import IconMinus from "@/assets/icon-minus.png";

// Component to handle drawing tools
function DrawingTools() {
  const map = useMap();
  const { drawingMode, setDrawingMode, setIsDrawing, addArea } = useMapStore();
  const geomanInitialized = React.useRef(false);

  // Initialize Geoman event listeners once
  useEffect(() => {
    if (!map || geomanInitialized.current) return;

    console.log("Setting up Geoman event listeners...");
    console.log("map.pm available:", !!map.pm);

    if (!map.pm) {
      console.error("Geoman (map.pm) is not available on the map instance!");
      return;
    }

    geomanInitialized.current = true;

    // Listen for drawing events
    map.on("pm:create", (e: any) => {
      console.log("🎉 pm:create event fired!", e);
      const layer = e.layer;
      const shape = e.shape;

      let type: "polygon" | "line" | "point" = "polygon";
      if (shape === "Line") type = "line";
      if (shape === "Marker") type = "point";
      if (shape === "Polygon") type = "polygon";

      if (layer) {
        const coords = layer.getLatLngs
          ? layer.getLatLngs()
          : layer.getLatLng();

        // Get current area count to generate sequential names
        const currentAreas = useMapStore.getState().areas;
        const areaNumber = currentAreas.length + 1;

        const newArea = {
          name: `Area ${areaNumber}`,
          type,
          coordinates: coords,
          visible: true,
        };

        console.log("Adding area to store:", newArea);
        addArea(newArea);

        // Log the updated store state
        setTimeout(() => {
          const updatedAreas = useMapStore.getState().areas;
          console.log("Store areas after adding:", updatedAreas);
        }, 100);

        // Keep the drawing mode active so users can draw multiple areas
        console.log(
          "Area created, drawing mode remains active for multiple areas"
        );
      }
    });

    // Listen for ALL Geoman events to debug
    map.on("pm:drawstart", (e: any) => {
      console.log("🟢 pm:drawstart - Drawing started", e);
    });

    map.on("pm:drawend", (e: any) => {
      console.log("🔴 pm:drawend - Drawing ended", e);
    });

    map.on("pm:vertexadded", (e: any) => {
      console.log("📍 pm:vertexadded - Vertex added", e);
    });

    // Additional Geoman events
    map.on("pm:globaldrawmodetoggled", (e: any) => {
      console.log("🔄 pm:globaldrawmodetoggled", e);
    });

    // FALLBACK: Listen for Leaflet's layeradd event
    map.on("layeradd", (e: any) => {
      console.log("🆕 layeradd event fired", e);

      const layer = e.layer;

      // Check if this layer was created by Geoman
      if (layer.pm && layer.pm._shape) {
        console.log("✨ Detected Geoman-drawn layer!", layer.pm._shape);

        const shape = layer.pm._shape;
        let type: "polygon" | "line" | "point" = "polygon";

        if (shape === "Line" || shape === "Polyline") type = "line";
        if (shape === "Marker") type = "point";
        if (shape === "Polygon" || shape === "Rectangle" || shape === "Circle")
          type = "polygon";

        const coords = layer.getLatLngs
          ? layer.getLatLngs()
          : layer.getLatLng
            ? layer.getLatLng()
            : null;

        if (coords) {
          const currentAreas = useMapStore.getState().areas;
          const areaNumber = currentAreas.length + 1;

          const newArea = {
            name: `Area ${areaNumber}`,
            type,
            coordinates: coords,
            visible: true,
          };

          console.log("📝 Adding area from layeradd event:", newArea);
          addArea(newArea);

          setTimeout(() => {
            const updatedAreas = useMapStore.getState().areas;
            console.log("✅ Store updated, total areas:", updatedAreas.length);
          }, 100);
        }
      }
    });

    console.log("✅ Geoman event listeners set up successfully");

    return () => {
      if (map) {
        map.off("pm:create");
        map.off("pm:drawstart");
        map.off("pm:drawend");
        map.off("pm:vertexadded");
        map.off("pm:globaldrawmodetoggled");
        map.off("layeradd");
      }
    };
  }, [map, addArea, setIsDrawing, setDrawingMode]);

  // Handle drawing mode changes
  useEffect(() => {
    if (!map || !geomanInitialized.current || !map.pm) {
      return;
    }

    console.log("Drawing mode changed to:", drawingMode);

    // Disable all modes first
    try {
      if (map.pm.globalDrawModeEnabled()) {
        map.pm.disableDraw();
      }
      if (map.pm.globalEditModeEnabled()) {
        map.pm.disableGlobalEditMode();
      }
      if (map.pm.globalRemovalModeEnabled()) {
        map.pm.disableGlobalRemovalMode();
      }
    } catch (err) {
      console.error("Error disabling modes:", err);
    }

    // Enable the selected mode
    try {
      if (drawingMode === "curved") {
        map.pm.enableDraw("Polygon", {
          snappable: true,
          snapDistance: 20,
          allowSelfIntersection: true,
          templineStyle: {
            color: "#f59e0b",
            weight: 3,
          },
          hintlineStyle: {
            color: "#f59e0b",
            dashArray: "5, 5",
          },
          pathOptions: {
            color: "#f59e0b",
            weight: 3,
            fillColor: "#f59e0b",
            fillOpacity: 0.2,
          },
        });
        map.getContainer().style.cursor = "crosshair";
        setIsDrawing(true);
      } else if (drawingMode === "polygon") {
        map.pm.enableDraw("Polygon", {
          snappable: true,
          snapDistance: 20,
          pathOptions: {
            color: "#f59e0b",
            weight: 3,
          },
        });
        map.getContainer().style.cursor = "crosshair";
        setIsDrawing(true);
      } else if (drawingMode === "polyline") {
        map.pm.enableDraw("Line", {
          snappable: true,
          snapDistance: 20,
          pathOptions: {
            color: "#f59e0b",
            weight: 3,
          },
        });
        map.getContainer().style.cursor = "crosshair";
        setIsDrawing(true);
      } else if (drawingMode === "line") {
        map.pm.enableDraw("Line", {
          snappable: true,
          snapDistance: 20,
          pathOptions: {
            color: "#f59e0b",
            weight: 3,
          },
        });
        map.getContainer().style.cursor = "crosshair";
        setIsDrawing(true);
      } else if (drawingMode === "point") {
        map.pm.enableDraw("Marker", {
          snappable: true,
          snapDistance: 20,
        });
        map.getContainer().style.cursor = "crosshair";
        setIsDrawing(true);
      } else if (drawingMode === "rectangle") {
        map.pm.enableDraw("Rectangle", {
          snappable: true,
          snapDistance: 20,
          pathOptions: {
            color: "#f59e0b",
            weight: 3,
          },
        });
        map.getContainer().style.cursor = "crosshair";
        setIsDrawing(true);
      } else if (drawingMode === "edit") {
        map.pm.enableGlobalEditMode();
        map.getContainer().style.cursor = "default";
      } else if (drawingMode === "erase") {
        map.pm.enableGlobalRemovalMode();
        map.getContainer().style.cursor = "pointer";
      } else {
        map.getContainer().style.cursor = "";
        setIsDrawing(false);
      }
    } catch (err) {
      console.error("Error enabling drawing mode:", err);
    }
  }, [drawingMode, map, setIsDrawing]);

  return null;
}

// Component to render searched boundary
function SearchBoundaryLayer() {
  const { searchedBoundary } = useMapStore();

  if (!searchedBoundary || !searchedBoundary.geometry) return null;

  const geometry = searchedBoundary.geometry;
  let positions: any;

  try {
    if (geometry.type === "Polygon") {
      positions = geometry.coordinates[0].map((coord: number[]) => [
        coord[1],
        coord[0],
      ]);
    } else if (geometry.type === "MultiPolygon") {
      positions = geometry.coordinates[0][0].map((coord: number[]) => [
        coord[1],
        coord[0],
      ]);
    } else {
      return null;
    }

    return (
      <Polygon
        positions={positions}
        pathOptions={{
          color: "#f59e0b",
          weight: 3,
          fillColor: "#f59e0b",
          fillOpacity: 0.1,
        }}
      >
        <Popup>
          <div className="text-sm">
            <p className="font-semibold">{searchedBoundary.name}</p>
            <p className="text-xs text-gray-600 mt-1">
              Outlined city area as your base shape
            </p>
          </div>
        </Popup>
      </Polygon>
    );
  } catch (error) {
    console.error("Error rendering boundary:", error);
    return null;
  }
}

// Component to render areas
function AreasLayer() {
  const { areas } = useMapStore();

  return (
    <>
      {areas.map((area) => {
        if (!area.visible) return null;

        if (area.type === "line") {
          return (
            <Polyline
              key={area.id}
              positions={area.coordinates}
              pathOptions={{
                color: "#f59e0b",
                weight: 4,
              }}
            />
          );
        }

        if (area.type === "point") {
          return <Marker key={area.id} position={area.coordinates} />;
        }

        return (
          <Polygon
            key={area.id}
            positions={area.coordinates}
            pathOptions={{
              color: "#f59e0b",
              weight: 2,
              fillColor: "#f59e0b",
              fillOpacity: 0.2,
            }}
          />
        );
      })}
    </>
  );
}

// Component to handle map view changes
function MapViewController() {
  const map = useMap();
  const { mapView } = useMapStore();

  useEffect(() => {
    if (map) {
      map.invalidateSize();
    }
  }, [map, mapView]);

  return null;
}

// Component to sync map state to store
function MapStateController() {
  const map = useMap();
  const { setMapState } = useMapStore();

  useEffect(() => {
    if (!map) return;

    const updateState = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      setMapState([center.lat, center.lng], zoom);
    };

    map.on("moveend", updateState);
    map.on("zoomend", updateState);

    // Initial sync
    updateState();

    return () => {
      map.off("moveend", updateState);
      map.off("zoomend", updateState);
    };
  }, [map, setMapState]);

  return null;
}

// Component to handle map flyTo
function FlyToController() {
  const map = useMap();
  const { flyToCoordinates, setFlyToCoordinates, flyToBounds, setFlyToBounds } =
    useMapStore();

  useEffect(() => {
    if (flyToCoordinates) {
      map.flyTo(flyToCoordinates, 13, {
        duration: 1.5,
      });
      setFlyToCoordinates(null);
    }
  }, [flyToCoordinates, map, setFlyToCoordinates]);

  useEffect(() => {
    if (flyToBounds) {
      map.flyToBounds(flyToBounds, {
        duration: 1.5,
        padding: [50, 50],
      });
      setFlyToBounds(null);
    }
  }, [flyToBounds, map, setFlyToBounds]);

  return null;
}

// Function to calculate appropriate scale distance based on zoom level
function getScaleDistance(zoom: number): { distance: number; unit: string; width: number } {
  // Approximate meters per pixel at different zoom levels (at equator)
  const metersPerPixel = 156543.03392 * Math.cos(50.9375 * Math.PI / 180) / Math.pow(2, zoom);

  // Target width in pixels for the scale bar
  const targetWidth = 100;
  const metersForWidth = metersPerPixel * targetWidth;

  // Round to nice numbers
  let distance: number;
  let unit: string;
  let width: number;

  if (metersForWidth >= 1000) {
    // Use kilometers
    const km = metersForWidth / 1000;
    if (km >= 10) {
      distance = Math.round(km / 10) * 10;
    } else if (km >= 5) {
      distance = 5;
    } else if (km >= 2) {
      distance = 2;
    } else {
      distance = 1;
    }
    unit = "km";
    width = (distance * 1000) / metersPerPixel;
  } else {
    // Use meters
    if (metersForWidth >= 500) {
      distance = 500;
    } else if (metersForWidth >= 200) {
      distance = 200;
    } else if (metersForWidth >= 100) {
      distance = 100;
    } else if (metersForWidth >= 50) {
      distance = 50;
    } else if (metersForWidth >= 20) {
      distance = 20;
    } else {
      distance = 10;
    }
    unit = "m";
    width = distance / metersPerPixel;
  }

  return { distance, unit, width };
}

export const MapView: FC = () => {
  const mapRef = useRef<LeafletMap | null>(null);
  const { mapView, drawingMode, setDrawingMode, currentCenter, currentZoom } = useMapStore();

  // Cologne, Germany coordinates
  const position: [number, number] = [50.9375, 6.9603];

  // Calculate scale based on current zoom
  const scale = getScaleDistance(currentZoom);

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={position}
        zoom={11}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
        ref={mapRef}
      >
        {mapView === "satellite" ? (
          <WMSTileLayer
            url="https://www.wms.nrw.de/geobasis/wms_nw_dop"
            layers="nw_dop_rgb"
            format="image/png"
            transparent={true}
            attribution='&copy; <a href="https://www.bezreg-koeln.nrw.de/geobasis-nrw">Geobasis NRW</a>'
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}

        <AreasLayer />
        <SearchBoundaryLayer />
        <DrawingTools />
        <MapViewController />
        <MapStateController />
        <FlyToController />
      </MapContainer>

      {/* Measurement Tools Bar - Right Middle */}
      <div className="absolute top-40 right-4 z-[1000]">
        <div className="bg-white rounded-[10px] shadow-lg py-2 px-2 flex flex-col items-center gap-2 w-[60px]">
          {/* Curved/freehand measurement */}
          <button
            onClick={() =>
              setDrawingMode(drawingMode === "curved" ? null : "curved")
            }
            className={`w-12 h-12 flex items-center justify-center transition-all hover:opacity-80 relative group rounded-lg ${drawingMode === "curved"
              ? "bg-[#F5DCC4] opacity-100"
              : "opacity-60"
              }`}
            title="Create your own vector shape"
          >
            <img
              src={ToolCurved}
              alt="Curved"
              className="w-full h-full object-contain p-1"
            />
            {/* Tooltip */}
            <div className="absolute right-full mr-3 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              Create your own vector shape
            </div>
          </button>

          {/* Adjust edges (Edit Mode) */}
          <button
            onClick={() =>
              setDrawingMode(drawingMode === "edit" ? null : "edit")
            }
            className={`w-12 h-12 flex items-center justify-center transition-all hover:opacity-80 relative group rounded-lg ${drawingMode === "edit"
              ? "bg-[#F5DCC4] opacity-100"
              : "opacity-60"
              }`}
            title="Adjust edges"
          >
            <img
              src={ToolPolyline}
              alt="Adjust edges"
              className="w-full h-full object-contain p-1"
            />
            {/* Tooltip for Adjust edges */}
            <div className="absolute right-full mr-3 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              Adjust edges
            </div>
          </button>

          {/* Erase shapes */}
          <button
            onClick={() =>
              setDrawingMode(drawingMode === "erase" ? null : "erase")
            }
            className={`w-12 h-12 flex items-center justify-center transition-all hover:opacity-80 relative group rounded-lg ${drawingMode === "erase"
              ? "bg-[#F5DCC4] opacity-100"
              : "opacity-60"
              }`}
            title="Erase shapes"
          >
            <img
              src={ToolArea}
              alt="Erase"
              className="w-full h-full object-contain p-1"
            />
            {/* Tooltip for Erase shapes */}
            <div className="absolute right-full mr-3 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              Erase shapes
            </div>
          </button>

          {/* Separator */}
          <div className="w-9 h-[2px] bg-[#C17A4A] opacity-50 rounded-full my-1"></div>

          {/* Polyline measurement */}
          <button
            onClick={() =>
              setDrawingMode(drawingMode === "polyline" ? null : "polyline")
            }
            className={`w-12 h-12 flex items-center justify-center transition-all hover:opacity-80 relative group rounded-lg ${drawingMode === "polyline"
              ? "bg-[#F5DCC4] opacity-100"
              : "opacity-60"
              }`}
            title="Polyline Measurement"
          >
            <img
              src={ToolSelect}
              alt="Polyline"
              className="w-full h-full object-contain p-1"
            />
          </button>

          {/* Rectangle selection */}
          <button
            onClick={() =>
              setDrawingMode(drawingMode === "rectangle" ? null : "rectangle")
            }
            className={`w-12 h-12 flex items-center justify-center transition-all hover:opacity-80 relative group rounded-lg ${drawingMode === "rectangle"
              ? "bg-[#F5DCC4] opacity-100"
              : "opacity-60"
              }`}
            title="Rectangle Selection"
          >
            <img
              src={ToolRectangle}
              alt="Rectangle"
              className="w-full h-full object-contain p-1"
            />
          </button>
        </div>
      </div>

      {/* Map Controls & Toggles - Bottom Right */}
      <div className="absolute bottom-8 right-4 flex items-end gap-4 z-[1000]">
        {/* Map View Toggles */}
        <div className="flex gap-3 mb-1">
          <button
            onClick={() => useMapStore.setState({ mapView: "satellite" })}
            className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shadow-lg group ${mapView === "satellite"
              ? "border-white ring-2 ring-[#c17a4a] opacity-100"
              : "border-white/50 hover:border-white opacity-50 hover:opacity-75"
              }`}
            title="Satellite View"
          >
            <div className="absolute inset-0 pointer-events-none">
              <MapContainer
                center={currentCenter}
                zoom={currentZoom - 1} // Slightly zoomed out for context
                zoomControl={false}
                attributionControl={false}
                dragging={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                boxZoom={false}
                keyboard={false}
                className="w-full h-full"
                key={`satellite-preview-${currentCenter[0]}-${currentCenter[1]}-${currentZoom}`}
              >
                <WMSTileLayer
                  url="https://www.wms.nrw.de/geobasis/wms_nw_dop"
                  layers="nw_dop_rgb"
                  format="image/png"
                  transparent={true}
                />
              </MapContainer>
            </div>
            <div className="absolute inset-x-0 bottom-0 px-1 py-1.5 z-[999]">
              <span className="text-white text-[11px] font-semibold leading-tight block text-center drop-shadow-sm">
                Base Image
              </span>
            </div>
          </button>

          <button
            onClick={() => useMapStore.setState({ mapView: "map" })}
            className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shadow-lg group ${mapView === "map"
              ? "border-white ring-2 ring-[#c17a4a] opacity-100"
              : "border-white/50 hover:border-white opacity-50 hover:opacity-75"
              }`}
            title="Map View"
          >
            <div className="absolute inset-0 pointer-events-none">
              <MapContainer
                center={currentCenter}
                zoom={currentZoom - 1}
                zoomControl={false}
                attributionControl={false}
                dragging={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                boxZoom={false}
                keyboard={false}
                className="w-full h-full"
                key={`map-preview-${currentCenter[0]}-${currentCenter[1]}-${currentZoom}`}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </MapContainer>
            </div>
            <div className="absolute inset-x-0 bottom-0 px-1 py-1.5 z-[999]">
              <span className="text-black text-[11px] font-semibold leading-tight block text-center drop-shadow-sm">
                Map View
              </span>
            </div>
          </button>
        </div>

        {/* Vertical Controls */}
        <div className="flex flex-col gap-3 items-center">
          {/* Help Assistant Button */}
          <button className="rounded-[10px] shadow-lg hover:opacity-90 transition-opacity w-[55px] h-[55px] overflow-hidden bg-transparent p-0 border-none">
            <img
              src={HelpAssistantImage}
              alt="Help Assistant"
              className="w-full h-full object-cover"
            />
          </button>

          {/* Control Bar - Chat, Zoom In, Zoom Out */}
          <div className="bg-white rounded-[10px] shadow-lg py-2 flex flex-col items-center w-[44px]">
            {/* Chat Button */}
            <button className="w-8 h-8 flex items-center justify-center transition-opacity hover:opacity-80">
              <img
                src={IconChat}
                alt="Chat"
                className="w-6 h-6 object-contain"
              />
            </button>

            {/* Zoom In Button */}
            <button
              onClick={handleZoomIn}
              className="w-8 h-8 flex items-center justify-center transition-opacity hover:opacity-80"
              title="Zoom In"
            >
              <img
                src={IconPlus}
                alt="Zoom In"
                className="w-5 h-5 object-contain"
              />
            </button>

            {/* Separator */}
            <div className="w-6 h-[2px] bg-[#C17A4A] opacity-50 rounded-full"></div>

            {/* Zoom Out Button */}
            <button
              onClick={handleZoomOut}
              className="w-8 h-8 flex items-center justify-center transition-opacity hover:opacity-80"
              title="Zoom Out"
            >
              <img
                src={IconMinus}
                alt="Zoom Out"
                className="w-5 h-5 object-contain"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Scale Indicator */}
      <div className="absolute bottom-2 right-5 z-[1000]">
        <div className="flex items-center gap-2 bg-white px-1 py-0.2 rounded shadow">
          <span className="text-[10px] font-medium text-black whitespace-nowrap">
            {scale.distance} {scale.unit}
          </span>
          <div className="relative flex items-center" style={{ width: `${scale.width}px`, height: '8px' }}>
            {/* Left tick */}
            <div className="absolute left-0 top-0 w-[2px] h-full bg-black"></div>
            {/* Horizontal line */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[2px] bg-black"></div>
            {/* Right tick */}
            <div className="absolute right-0 top-0 w-[2px] h-full bg-black"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
