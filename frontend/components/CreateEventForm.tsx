"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { SPORTS, createEventInputSchema, type CreateEventInput } from "shared";
import {
  AddressAutocomplete,
  type SelectedPlace,
} from "@/components/AddressAutocomplete";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Button, Field, Form, Input, Select, Textarea } from "@/components/ui";

function getDefaultValues(searchParams: URLSearchParams): CreateEventInput {
  const sportParam = searchParams.get("sport");
  const sportId = SPORTS.some((sport) => sport.id === sportParam)
    ? (sportParam as CreateEventInput["sportId"])
    : SPORTS[0].id;
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  return {
    title: "",
    description: "",
    sportId,
    startTime: "",
    location: {
      name: searchParams.get("locationName") ?? "",
      address: searchParams.get("locationAddress") ?? "",
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng) : undefined,
      placeId: searchParams.get("placeId") ?? undefined,
    },
    isFree: true,
    price: undefined,
    participantLimit: undefined,
  };
}

export function CreateEventForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const geolocation = useGeolocation();
  // Read once — react-hook-form only consumes defaultValues on the initial
  // render, so this doesn't need to track searchParams changes.
  const initialValues = getDefaultValues(searchParams);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventInputSchema),
    defaultValues: initialValues,
  });

  const isFree = watch("isFree");

  const handlePlaceSelected = (place: SelectedPlace) => {
    setValue("location.name", place.name, { shouldValidate: true });
    setValue("location.address", place.address, { shouldValidate: true });
    setValue("location.lat", place.lat);
    setValue("location.lng", place.lng);
    setValue("location.placeId", place.placeId);
  };

  // Biases address suggestions toward the user's current position, once known.
  const locationBias =
    geolocation.status === "success"
      ? { lat: geolocation.position.lat, lng: geolocation.position.lng }
      : undefined;

  const onSubmit = (values: CreateEventInput) => {
    // TODO: replace with POST /events once the backend exposes it.
    console.log("[mock] create event", values);
    router.push("/events?created=1");
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Field label="Title" error={errors.title?.message}>
        <Input type="text" {...register("title")} />
      </Field>

      <Field label="Description">
        <Textarea rows={3} {...register("description")} />
      </Field>

      <Field label="Sport">
        <Select {...register("sportId")}>
          {SPORTS.map((sport) => (
            <option key={sport.id} value={sport.id}>
              {sport.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Date & time" error={errors.startTime?.message}>
        <Input
          type="datetime-local"
          {...register("startTime", {
            setValueAs: (value: string) =>
              value ? new Date(value).toISOString() : value,
          })}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Location name" error={errors.location?.name?.message}>
          <Input type="text" {...register("location.name")} />
        </Field>

        <Field label="Address" error={errors.location?.address?.message}>
          <AddressAutocomplete
            defaultValue={initialValues.location.address}
            onQueryChange={(value) =>
              setValue("location.address", value, { shouldValidate: true })
            }
            onPlaceSelected={handlePlaceSelected}
            locationBias={locationBias}
            placeholder="Start typing an address..."
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isFree")} className="h-4 w-4" />
        <span className="font-medium text-black dark:text-zinc-50">
          This event is free
        </span>
      </label>

      {!isFree && (
        <Field label="Price per player (€)" error={errors.price?.message}>
          <Input
            type="number"
            min="0"
            step="0.5"
            {...register("price", {
              setValueAs: (value: string) =>
                value === "" ? undefined : Number(value),
            })}
          />
        </Field>
      )}

      <Field label="Participant limit (optional)">
        <Input
          type="number"
          min="1"
          step="1"
          {...register("participantLimit", {
            setValueAs: (value: string) =>
              value === "" ? undefined : Number(value),
          })}
        />
      </Field>

      <Button type="submit" disabled={isSubmitting} className="mt-2 self-start">
        Create event
      </Button>
    </Form>
  );
}
