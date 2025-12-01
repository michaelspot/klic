import { useState, useEffect } from "react";

export function useMemeSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const search = async () => {
      if (searchQuery.trim()) {
        await searchMemes(searchQuery);
      } else {
        setSearchResults([]);
      }
    };

    const timeoutId = setTimeout(search, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const searchMemes = async (query) => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.klipy.com/api/v1/x5CvpeifqNmCpSGRk0c8zpCqlUgCcYNhI4uz2dcZcc0bBhXS2sPT9wxQZaulxIdJ/static-memes/search?page=1&per_page=24&q=${encodeURIComponent(query)}&customer_id=user123&locale=france&content_filter=safe`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const data = await response.json();
      if (data.result && data.data && data.data.data) {
        setSearchResults(data.data.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching memes:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
  };
}
