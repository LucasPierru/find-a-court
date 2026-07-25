"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Sport } from "shared";
import { Button, Field, Input, Select } from "@/components/ui";

type EventFilterBarProps = {
  sports: readonly Sport[];
  sport?: string;
  keyword?: string;
  location?: string;
};

export function EventFilterBar({
  sports,
  sport,
  keyword,
  location,
}: EventFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [keywordInput, setKeywordInput] = useState(keyword ?? "");
  const [locationInput, setLocationInput] = useState(location ?? "");

  function pushParams(next: { sport?: string; q?: string; location?: string }) {
    const merged = {
      sport: "sport" in next ? next.sport : sport,
      q: "q" in next ? next.q : keyword,
      location: "location" in next ? next.location : location,
    };
    const params = new URLSearchParams();
    if (merged.sport) params.set("sport", merged.sport);
    if (merged.q) params.set("q", merged.q);
    if (merged.location) params.set("location", merged.location);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <Field label="Sport">
        <Select
          value={sport ?? ""}
          onChange={(event) =>
            pushParams({ sport: event.target.value || undefined })
          }
        >
          <option value="">All sports</option>
          {sports.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </Field>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          pushParams({
            q: keywordInput || undefined,
            location: locationInput || undefined,
          });
        }}
        className="flex flex-1 flex-col gap-3 sm:flex-row"
      >
        <div className="flex-1">
          <Field label="Keyword">
            <Input
              type="text"
              value={keywordInput}
              onChange={(event) => setKeywordInput(event.target.value)}
              placeholder="e.g. doubles, pickup"
            />
          </Field>
        </div>

        <div className="flex-1">
          <Field label="Location">
            <Input
              type="text"
              value={locationInput}
              onChange={(event) => setLocationInput(event.target.value)}
              placeholder="e.g. Paris"
            />
          </Field>
        </div>

        <Button type="submit" className="self-end">
          Search
        </Button>
      </form>
    </div>
  );
}
