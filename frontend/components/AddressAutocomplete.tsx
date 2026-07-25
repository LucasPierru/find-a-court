"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { useDebouncedCallback } from "use-debounce";
import {
  autocompletePlaces,
  getPlaceDetails,
  type LocationBias,
  type PlaceSuggestion,
} from "@/services/googlePlaces";
import { Input } from "@/components/ui";

export type SelectedPlace = {
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  placeId?: string;
};

type AddressAutocompleteProps = {
  onPlaceSelected: (place: SelectedPlace) => void;
  /** Fired on every keystroke (not just on selecting a suggestion), so a
   * bound form field stays in sync even if the user types freely without
   * picking a result. */
  onQueryChange?: (value: string) => void;
  defaultValue?: string;
  locationBias?: LocationBias;
  placeholder?: string;
  className?: string;
};

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 250;

export function AddressAutocomplete({
  onPlaceSelected,
  onQueryChange,
  defaultValue = "",
  locationBias,
  placeholder,
  className,
}: AddressAutocompleteProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const listboxId = useId();

  const search = useDebouncedCallback((value: string) => {
    if (!apiKey || value.trim().length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    autocompletePlaces(value, apiKey, controller.signal, locationBias)
      .then((results) => {
        setSuggestions(results);
        setIsOpen(results.length > 0);
        setHighlightedIndex(-1);
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") setSuggestions([]);
      });
  }, DEBOUNCE_MS);

  // Cancel any pending debounce/fetch on unmount.
  useEffect(() => {
    return () => {
      search.cancel();
      abortControllerRef.current?.abort();
    };
  }, [search]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setQuery(value);
    onQueryChange?.(value);
    search(value);
  }

  async function selectSuggestion(suggestion: PlaceSuggestion) {
    setIsOpen(false);
    const nextQuery = suggestion.secondaryText
      ? `${suggestion.primaryText}, ${suggestion.secondaryText}`
      : suggestion.primaryText;
    setQuery(nextQuery);
    onQueryChange?.(nextQuery);

    if (!apiKey) return;
    try {
      const details = await getPlaceDetails(suggestion.placeId, apiKey);
      onPlaceSelected({
        name: details.name || suggestion.primaryText,
        address: details.address || suggestion.secondaryText,
        lat: details.lat,
        lng: details.lng,
        placeId: details.placeId,
      });
    } catch {
      // Fall back to just the prediction text if the details lookup fails.
      onPlaceSelected({
        name: suggestion.primaryText,
        address: suggestion.secondaryText,
        placeId: suggestion.placeId,
      });
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((index) => (index - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter" && highlightedIndex >= 0) {
      event.preventDefault();
      void selectSuggestion(suggestions[highlightedIndex]);
    } else if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => setIsOpen(suggestions.length > 0)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls={listboxId}
        className={className ?? "w-full"}
      />
      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-zinc-300 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          {suggestions.map((suggestion, index) => (
            <li key={suggestion.placeId}>
              <button
                type="button"
                onClick={() => void selectSuggestion(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`block w-full px-3 py-2 text-left text-sm ${
                  index === highlightedIndex ? "bg-zinc-100 dark:bg-zinc-800" : ""
                }`}
              >
                <div className="text-black dark:text-zinc-50">
                  {suggestion.primaryText}
                </div>
                {suggestion.secondaryText && (
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {suggestion.secondaryText}
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
