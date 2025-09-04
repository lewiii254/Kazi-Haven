import React, { useEffect, useState, useCallback } from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useDispatch, useSelector } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import { ChevronDown, ChevronUp, Filter, X, Save, Clock } from "lucide-react";

const filterData = [
  {
    filterType: "location",
    displayName: "Location",
    array: ["Nairobi", "Kisumu", "Mombasa", "Meru", "Nakuru", "Eldoret", "Embu", "Kakamega", "Thika", "Nyeri"],
  },
  {
    filterType: "industry", 
    displayName: "Industry",
    array: ["Frontend Developer", "Backend Developer", "Full-stack Developer", "Data Science", "Graphic Designer", "Mobile Developer", "UI/UX Designer", "Product Manager", "Software Engineer", "QA/Tester", "Marketing Manager", "Sales Manager", "Finance Manager", "Teacher", "Lecturer"],
  },
  {
    filterType: "job-type",
    displayName: "Job Type", 
    array: ["Full-time", "Contract", "Part-time", "Internship"],
  },
  {
    filterType: "experience-level",
    displayName: "Experience Level",
    array: ["Entry Level", "Mid Level", "Senior Level", "Lead/Manager"],
  },
  {
    filterType: "company-size",
    displayName: "Company Size",
    array: ["Startup (1-50)", "Small (51-200)", "Medium (201-1000)", "Large (1000+)"],
  },
  {
    filterType: "posted-date",
    displayName: "Posted Date",
    array: ["Last 24 hours", "Last 3 days", "Last week", "Last month"],
  },
];

const AdvancedFilterCard = () => {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [salaryRange, setSalaryRange] = useState({ min: "", max: "" });
  const [expandedSections, setExpandedSections] = useState({});
  const [savedSearches, setSavedSearches] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [showSaveSearch, setShowSaveSearch] = useState(false);
  
  const dispatch = useDispatch();
  const { allJobs } = useSelector(store => store.job);

  // Load saved searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
  }, []);

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const handleFilterChange = useCallback((filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  const handleSalaryChange = useCallback((type, value) => {
    setSalaryRange(prev => ({
      ...prev,
      [type]: value
    }));
  }, []);

  const clearFilters = () => {
    setSelectedFilters({});
    setSalaryRange({ min: "", max: "" });
    dispatch(setSearchedQuery(""));
  };

  const saveCurrentSearch = () => {
    if (!searchName.trim()) return;
    
    const searchData = {
      id: Date.now(),
      name: searchName,
      filters: selectedFilters,
      salaryRange,
      timestamp: new Date().toISOString()
    };

    const newSavedSearches = [...savedSearches, searchData];
    setSavedSearches(newSavedSearches);
    localStorage.setItem('savedSearches', JSON.stringify(newSavedSearches));
    setSearchName("");
    setShowSaveSearch(false);
  };

  const loadSavedSearch = (searchData) => {
    setSelectedFilters(searchData.filters);
    setSalaryRange(searchData.salaryRange);
  };

  const deleteSavedSearch = (searchId) => {
    const newSavedSearches = savedSearches.filter(search => search.id !== searchId);
    setSavedSearches(newSavedSearches);
    localStorage.setItem('savedSearches', JSON.stringify(newSavedSearches));
  };

  // Apply filters effect
  useEffect(() => {
    const activeFilters = Object.values(selectedFilters).filter(Boolean);
    const hasFilters = activeFilters.length > 0 || salaryRange.min || salaryRange.max;
    
    if (hasFilters) {
      // Combine all active filters for search query
      const searchQuery = activeFilters.join(' ');
      dispatch(setSearchedQuery(searchQuery));
    } else {
      dispatch(setSearchedQuery(""));
    }
  }, [selectedFilters, salaryRange, dispatch]);

  const getFilterCount = () => {
    const filterCount = Object.values(selectedFilters).filter(Boolean).length;
    const salaryCount = (salaryRange.min || salaryRange.max) ? 1 : 0;
    return filterCount + salaryCount;
  };

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-sm border dark:bg-gray-900 dark:text-white dark:border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h1 className="font-bold text-lg">Advanced Filters</h1>
          {getFilterCount() > 0 && (
            <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
              {getFilterCount()}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSaveSearch(!showSaveSearch)}
            className="text-xs"
          >
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearFilters}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Save Search Section */}
      {showSaveSearch && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex gap-2">
            <Input
              placeholder="Search name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="flex-1"
            />
            <Button size="sm" onClick={saveCurrentSearch} disabled={!searchName.trim()}>
              Save
            </Button>
          </div>
        </div>
      )}

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="mb-4">
          <div 
            className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
            onClick={() => toggleSection('savedSearches')}
          >
            <h3 className="font-medium text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Saved Searches ({savedSearches.length})
            </h3>
            {expandedSections.savedSearches ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </div>
          
          {expandedSections.savedSearches && (
            <div className="mt-2 space-y-2">
              {savedSearches.map((search) => (
                <div key={search.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                  <button 
                    onClick={() => loadSavedSearch(search)}
                    className="flex-1 text-left hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {search.name}
                  </button>
                  <button 
                    onClick={() => deleteSavedSearch(search.id)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <hr className="mb-4" />

      {/* Salary Range Filter */}
      <div className="mb-4">
        <div 
          className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
          onClick={() => toggleSection('salary')}
        >
          <h3 className="font-medium text-sm">Salary Range (KSH)</h3>
          {expandedSections.salary ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />
          }
        </div>
        
        {expandedSections.salary && (
          <div className="mt-2 space-y-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="salary-min" className="text-xs">Minimum</Label>
                <Input
                  id="salary-min"
                  type="number"
                  placeholder="0"
                  value={salaryRange.min}
                  onChange={(e) => handleSalaryChange('min', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="salary-max" className="text-xs">Maximum</Label>
                <Input
                  id="salary-max"
                  type="number"
                  placeholder="No limit"
                  value={salaryRange.max}
                  onChange={(e) => handleSalaryChange('max', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {['50000', '100000', '200000', '500000'].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleSalaryChange('min', amount)}
                >
                  {amount}+
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter Sections */}
      <div className="space-y-3">
        {filterData.map((data, index) => (
          <div key={index}>
            <div 
              className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
              onClick={() => toggleSection(data.filterType)}
            >
              <h3 className="font-medium text-sm">
                {data.displayName}
                {selectedFilters[data.filterType] && (
                  <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                    • {selectedFilters[data.filterType]}
                  </span>
                )}
              </h3>
              {expandedSections[data.filterType] ? 
                <ChevronUp className="h-4 w-4" /> : 
                <ChevronDown className="h-4 w-4" />
              }
            </div>
            
            {expandedSections[data.filterType] && (
              <RadioGroup 
                value={selectedFilters[data.filterType] || ""} 
                onValueChange={(value) => handleFilterChange(data.filterType, value)}
                className="mt-2 ml-4"
              >
                {data.array.map((item, idx) => {
                  const itemId = `${data.filterType}-${idx}`;
                  return (
                    <div key={itemId} className="flex items-center space-x-2 my-1">
                      <RadioGroupItem value={item} id={itemId} />
                      <Label htmlFor={itemId} className="text-sm">{item}</Label>
                    </div>
                  );
                })}
              </RadioGroup>
            )}
          </div>
        ))}
      </div>

      {/* Filter Summary */}
      {getFilterCount() > 0 && (
        <div className="mt-4 pt-4 border-t dark:border-gray-800">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <span className="font-medium">{allJobs?.length || 0}</span> jobs match your filters
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilterCard;