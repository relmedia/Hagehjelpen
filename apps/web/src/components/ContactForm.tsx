"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CONTACT_PREFILL_EVENT,
  CONTACT_PREFILL_KEY,
  type ContactPrefill,
} from "@/lib/contact-prefill";

const SERVICES = [
  { value: "installasjon", label: "Installasjon" },
  { value: "feilsoking", label: "Feilsøking" },
  { value: "usikker", label: "Usikker" },
] as const;

const LAWN_SIZES = [
  { value: "0-1000", label: "0–1000 m²" },
  { value: "1000-2000", label: "1000–2000 m²" },
  { value: "2000-plus", label: "2000 m² og oppover" },
  { value: "ukjent", label: "Vet ikke" },
] as const;

const MOWERS = [
  { value: "ingen", label: "Har ikke robotgressklipper ennå" },
  { value: "husqvarna", label: "Husqvarna Automower" },
  { value: "gardena", label: "Gardena" },
  { value: "worx", label: "Worx Landroid" },
  { value: "ambrogio", label: "Ambrogio" },
  { value: "segway", label: "Segway Navimow" },
  { value: "annet", label: "Annet / vet ikke" },
] as const;

const MAX_FILES = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

type FormState = {
  name: string;
  email: string;
  phone: string;
  service: string;
  lawnSize: string;
  mower: string;
  message: string;
};

const INITIAL: FormState = {
  name: "",
  email: "",
  phone: "",
  service: "installasjon",
  lawnSize: "",
  mower: "",
  message: "",
};

const inputClass =
  "w-full rounded-xl border border-leaf-100 bg-white px-4 py-3 text-sm text-ink outline-none transition-shadow placeholder:text-ink-soft/50 focus:border-leaf-400 focus:ring-2 focus:ring-leaf-400/20";

const labelClass = "mb-1.5 block text-sm font-medium text-ink";

function formatSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function applyPrefill() {
      const raw = sessionStorage.getItem(CONTACT_PREFILL_KEY);
      if (!raw) return;

      try {
        const prefill = JSON.parse(raw) as ContactPrefill;
        setForm((prev) => ({
          ...prev,
          service: prefill.service ?? prev.service,
          lawnSize: prefill.lawnSize ?? prev.lawnSize,
          mower:
            prefill.mower ??
            (prefill.service === "installasjon" && !prev.mower ? "ingen" : prev.mower),
          message: prefill.message
            ? prev.message.includes(prefill.message)
              ? prev.message
              : [prev.message, prefill.message].filter(Boolean).join("\n\n")
            : prev.message,
        }));
      } finally {
        sessionStorage.removeItem(CONTACT_PREFILL_KEY);
      }
    }

    applyPrefill();
    window.addEventListener(CONTACT_PREFILL_EVENT, applyPrefill);
    return () => window.removeEventListener(CONTACT_PREFILL_EVENT, applyPrefill);
  }, []);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  function update(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length === 0) return;

    const images = selected.filter((file) => file.type.startsWith("image/"));
    const withinSize = images.filter((file) => file.size <= MAX_FILE_SIZE);

    if (images.length !== selected.length) {
      setError("Bare bildefiler kan lastes opp.");
    } else if (withinSize.length !== images.length) {
      setError(`Hvert bilde må være mindre enn ${formatSize(MAX_FILE_SIZE)}.`);
    } else {
      setError("");
    }

    setFiles((prev) => [...prev, ...withinSize].slice(0, MAX_FILES));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    if (!form.phone.trim() || !form.lawnSize || !form.mower) {
      setError("Fyll ut alle obligatoriske felt.");
      setStatus("error");
      return;
    }

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    files.forEach((file) => payload.append("images", file));

    try {
      const res = await fetch("/api/contact", { method: "POST", body: payload });
      const data = (await res.json()) as {
        ok?: boolean;
        mailto?: string;
        error?: string;
      };

      if (!res.ok) {
        setError(data.error ?? "Noe gikk galt. Prøv igjen.");
        setStatus("error");
        return;
      }

      if (data.mailto) {
        window.location.href = data.mailto;
      }

      setStatus("success");
      setForm(INITIAL);
      setFiles([]);
    } catch {
      setError("Kunne ikke sende skjemaet. Sjekk nettverket og prøv igjen.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-leaf-200 bg-leaf-50 px-8 py-12 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-leaf-500 text-white">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M5 12l5 5L19 7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="mt-5 font-display text-xl font-semibold text-ink">
          Takk for henvendelsen!
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Vi tar kontakt innen 24 timer. Hvis e-postklienten din åpnet seg,
          kan du sende meldingen der – ellers ringer vi deg.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-semibold text-leaf-600 transition-colors hover:text-leaf-700"
        >
          Send ny henvendelse
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={labelClass}>
            Navn *
          </label>
          <input
            id="contact-name"
            type="text"
            required
            autoComplete="name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputClass}
            placeholder="Ola Nordmann"
          />
        </div>
        <div>
          <label htmlFor="contact-phone" className={labelClass}>
            Telefon *
          </label>
          <input
            id="contact-phone"
            type="tel"
            required
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={inputClass}
            placeholder="+47 000 00 000"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-email" className={labelClass}>
          E-post *
        </label>
        <input
          id="contact-email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          className={inputClass}
          placeholder="ola@eksempel.no"
        />
      </div>

      <fieldset>
        <legend className={labelClass}>Hva trenger du hjelp med? *</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {SERVICES.map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                form.service === option.value
                  ? "border-leaf-500 bg-leaf-500 text-white"
                  : "border-leaf-100 bg-white text-ink-soft hover:border-leaf-300"
              }`}
            >
              <input
                type="radio"
                name="service"
                value={option.value}
                checked={form.service === option.value}
                onChange={(e) => update("service", e.target.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-lawn" className={labelClass}>
            Plenstørrelse *
          </label>
          <Select
            value={form.lawnSize || undefined}
            onValueChange={(value) => update("lawnSize", value)}
          >
            <SelectTrigger id="contact-lawn" aria-label="Plenstørrelse">
              <SelectValue placeholder="Velg størrelse" />
            </SelectTrigger>
            <SelectContent>
              {LAWN_SIZES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="contact-mower" className={labelClass}>
            Robotgressklipper *
          </label>
          <Select
            value={form.mower || undefined}
            onValueChange={(value) => update("mower", value)}
          >
            <SelectTrigger id="contact-mower" aria-label="Robotgressklipper">
              <SelectValue placeholder="Velg modell" />
            </SelectTrigger>
            <SelectContent>
              {MOWERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>
          Melding
        </label>
        <textarea
          id="contact-message"
          rows={4}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          className={`${inputClass} resize-y`}
          placeholder="Fortell gjerne litt om hagen, utfordringer eller spørsmål du har …"
        />
      </div>

      <div>
        <span className={labelClass}>Bilder av hagen</span>
        <p className="mb-3 text-xs leading-relaxed text-ink-soft/70">
          Legg ved bilder av plenen, så treffer vi bedre på pris og modell.
          Inntil {MAX_FILES} bilder, maks {formatSize(MAX_FILE_SIZE)} per bilde.
        </p>

        <label
          htmlFor="contact-images"
          className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-leaf-200 bg-leaf-50/50 px-5 py-4 transition-colors hover:border-leaf-400 hover:bg-leaf-50"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-leaf-600 shadow-sm">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path
                d="M12 16V5m0 0L7.5 9.5M12 5l4.5 4.5M4 17v1.5A2.5 2.5 0 006.5 21h11a2.5 2.5 0 002.5-2.5V17"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink">
              Last opp hagebilder
            </span>
            <span className="block text-xs text-ink-soft/70">
              JPG, PNG eller HEIC
            </span>
          </span>
          <input
            id="contact-images"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="sr-only"
          />
        </label>

        {files.length > 0 && (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="group relative overflow-hidden rounded-xl border border-leaf-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previews[index]}
                  alt={file.name}
                  className="h-24 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  aria-label={`Fjern ${file.name}`}
                  className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition-colors hover:bg-white hover:text-red-600"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    aria-hidden
                  >
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-leaf-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-leaf-500/25 transition-all hover:bg-leaf-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "loading" ? "Sender …" : "Send henvendelse"}
      </button>

      <p className="text-xs text-ink-soft/70">
        Vi kontakter deg innen 24 timer. Felter merket med * er obligatoriske.
      </p>
    </form>
  );
}
