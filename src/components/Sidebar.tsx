import { type FC, useState, useEffect } from "react";
import {
  ArrowLeft,
  Eye,
  Trash2,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMapStore, type AreaType } from "@/store/useMapStore";

const AREA_TYPES: AreaType[] = [
  "City Proper",
  "Inner City / Downtown",
  "Districts / Boroughs",
  "Neighborhoods / Quarters",
  "Metropolitan Area",
  "Suburbs / Peripheral Towns",
  "Greater Region / Administrative Region",
  "Functional Use Zones",
];

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  showAddButton?: boolean;
  onAdd?: () => void;
  children?: React.ReactNode;
}

const CollapsibleSection: FC<CollapsibleSectionProps> = ({
  title,
  isExpanded,
  onToggle,
  showAddButton = false,
  onAdd,
  children,
}) => {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 px-0 hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          )}
          <span className="text-sm font-medium text-gray-700">{title}</span>
        </div>
        {showAddButton && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd?.();
            }}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </button>
      {isExpanded && children && <div className="pb-4 px-0">{children}</div>}
    </div>
  );
};

export const Sidebar: FC = () => {
  const {
    areas,
    toggleAreaVisibility,
    deleteArea,
    setFlyToCoordinates,
    setFlyToBounds,
    setSearchedBoundary,
    applyBoundaryAsArea,
    sidebarView,
    setSidebarView,
    setSelectedAreaType,
    selectedAreaType,
  } = useMapStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Section expansion states for project scope view
  const [expandedSections, setExpandedSections] = useState({
    baseImage: false,
    areaOfInterest: true,
    objects: false,
  });

  // Search functionality
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              searchQuery
            )}`
          );
          const data = await response.json();
          setSearchResults(data);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // INITIAL VIEW - First screen with options
  if (sidebarView === "initial") {
    return (
      <div className="w-[375px] h-screen bg-white border-r border-gray-200 flex flex-col">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
          <h1 className="text-lg font-medium text-[#c17a4a]">
            Define Area of Interest
          </h1>
        </div>

        <div className="flex-1 px-6 py-6 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-800 mb-1">
                Define the area(s){" "}
                <span className="font-normal text-gray-600">
                  where you will apply your object count & detection model
                </span>
              </h2>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800 mb-4">Options:</p>

              <div className="space-y-3">
                {/* Search Option */}
                <button
                  onClick={() => setSidebarView("search")}
                  className="w-full bg-[#FFF8F3] border border-[#d4c5a9] rounded-lg p-4 hover:border-[#c17a4a] transition-colors text-left"
                >
                  <div className="flex items-start gap-3">
                    <Search className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">
                        <span className="font-medium">Search</span> for a city,
                        town...
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5">
                        or <span className="font-medium">draw</span> area on map
                      </p>
                    </div>
                  </div>
                </button>

                {/* Upload Option */}
                <button className="w-full bg-[#FFF8F3] border border-[#d4c5a9] rounded-lg p-4 opacity-60 cursor-not-allowed text-left">
                  <div className="flex items-center gap-3">
                    <Upload className="w-5 h-5 text-gray-400 shrink-0" />
                    <p className="text-sm text-gray-800">
                      Uploading a shape file
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SEARCH VIEW - City search interface
  if (sidebarView === "search") {
    return (
      <div className="w-[375px] h-screen bg-white border-r border-gray-200 flex flex-col">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
          <button
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
            onClick={() => setSidebarView("initial")}
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-medium text-[#c17a4a]">
            Define Area of Interest
          </h1>
        </div>

        <div className="flex-1 px-6 py-6 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-600">
                Search or use vector tool to create your region.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Area
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="city, town, region..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c17a4a] focus:border-transparent bg-[#FFF8F3]"
                />
              </div>

              {searchQuery && (
                <div className="mt-2 bg-white border border-[#d4c5a9] rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-3 text-sm text-gray-500">
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((result: any, index: number) => (
                      <div
                        key={index}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                      >
                        <p className="text-sm font-medium text-gray-800">
                          {result.display_name}
                        </p>
                        <div className="mt-1 flex flex-col gap-0.5">
                          {AREA_TYPES.map((type) => (
                            <button
                              key={type}
                              onClick={async () => {
                                setSelectedAreaType(type);
                                const locationName =
                                  result.display_name.split(",")[0];
                                setSearchQuery(locationName);

                                try {
                                  const detailResponse = await fetch(
                                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                                      result.display_name
                                    )}&polygon_geojson=1&limit=1`
                                  );
                                  const detailData =
                                    await detailResponse.json();

                                  if (detailData[0]?.geojson) {
                                    setSearchedBoundary({
                                      name: `${locationName} - ${type}`,
                                      geometry: detailData[0].geojson,
                                      displayName: result.display_name,
                                    });
                                  }
                                } catch (error) {
                                  console.error(
                                    "Failed to fetch boundary:",
                                    error
                                  );
                                }

                                if (result.boundingbox) {
                                  const bbox = result.boundingbox;
                                  setFlyToBounds([
                                    [parseFloat(bbox[0]), parseFloat(bbox[2])],
                                    [parseFloat(bbox[1]), parseFloat(bbox[3])],
                                  ]);
                                } else {
                                  setFlyToCoordinates([
                                    parseFloat(result.lat),
                                    parseFloat(result.lon),
                                  ]);
                                }
                              }}
                              className="text-xs text-gray-600 hover:text-[#c17a4a] text-left py-0.5"
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-gray-500">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => {
                  applyBoundaryAsArea();
                }}
                disabled={!selectedAreaType}
                className="w-full bg-[#c17a4a] hover:bg-[#a66a3e] text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply outline as base image
              </button>
              <p className="text-xs text-gray-500 mt-2">
                You can always edit the shape of the area later
              </p>
            </div>

            {/* List of Defined Areas */}
            {areas.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-800 mb-3">
                  Defined Areas
                </h3>
                <div className="space-y-2">
                  {areas.map((area) => (
                    <div
                      key={area.id}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-4 h-4 rounded bg-[#D4A574] border border-[#c17a4a] flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate font-medium">
                          {area.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleAreaVisibility(area.id)}
                          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                          title={area.visible ? "Hide area" : "Show area"}
                        >
                          <Eye
                            className={`w-4 h-4 ${area.visible ? "text-[#c17a4a]" : "text-gray-400"
                              }`}
                          />
                        </button>
                        <button
                          onClick={() => deleteArea(area.id)}
                          className="p-1.5 hover:bg-red-100 rounded transition-colors group"
                          title="Delete area"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            disabled={areas.length === 0}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setSidebarView("areas-defined")}
          >
            Confirm Area of Interest
          </button>
        </div>
      </div>
    );
  }

  // PROJECT SCOPE VIEW - Collapsible sections with areas
  return (
    <div className="w-[375px] h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
        <button
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
          onClick={() => setSidebarView("search")}
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-medium text-[#c17a4a]">
          Define Project Scope
        </h1>
        <span className="ml-auto text-xs text-gray-500">
          Areas: {areas.length}
        </span>
      </div>

      <div className="flex-1 px-6 py-4 overflow-y-auto">
        <div className="space-y-0">
          <CollapsibleSection
            title="Select Base Image"
            isExpanded={expandedSections.baseImage}
            onToggle={() => toggleSection("baseImage")}
            showAddButton={true}
            onAdd={() => console.log("Add base image")}
          >
            <div className="text-sm text-gray-600">
              <p>Upload or select a base satellite image for your project.</p>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="Define Area of Interest"
            isExpanded={expandedSections.areaOfInterest}
            onToggle={() => toggleSection("areaOfInterest")}
            showAddButton={true}
            onAdd={() => console.log("Add area - use drawing tools on map")}
          >
            <div className="space-y-3">
              {areas.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  No areas defined yet. Use the drawing tools on the map to
                  create areas.
                </p>
              ) : (
                areas.map((area, index) => (
                  <div key={area.id} className="flex items-center gap-3 group">
                    <div className="w-5 h-5 rounded bg-[#D4A574] border border-[#c17a4a] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {area.name || `Area ${index + 1}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => deleteArea(area.id)}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        title="Delete area"
                      >
                        <Trash2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => toggleAreaVisibility(area.id)}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        title="Toggle visibility"
                      >
                        <Eye
                          className={`w-4 h-4 ${area.visible ? "text-[#c17a4a]" : "text-gray-400"
                            }`}
                        />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="Define Objects"
            isExpanded={expandedSections.objects}
            onToggle={() => toggleSection("objects")}
            showAddButton={true}
            onAdd={() => console.log("Add object definition")}
          >
            <div className="text-sm text-gray-600">
              <p>Define objects to detect within your areas of interest.</p>
            </div>
          </CollapsibleSection>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-800">
            Scope Definition Finished
          </h3>
          <button
            onClick={() =>
              alert("Continuing to object(s) detection workflow...")
            }
            disabled={areas.length === 0}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to object(s) detection workflow
          </button>
        </div>
      </div>
    </div>
  );
};


