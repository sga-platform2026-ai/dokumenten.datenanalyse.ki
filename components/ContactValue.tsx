"use client";

import { Fragment } from "react";
import {
  splitContactParts,
  toMailtoHref,
  toTelHref,
} from "@/lib/contactText";
import { useTouchOrTablet } from "@/hooks/useTouchOrTablet";

interface ContactValueProps {
  text: string;
}

export function ContactValue({ text }: ContactValueProps) {
  const isTouchOrTablet = useTouchOrTablet();
  const parts = splitContactParts(text);

  if (parts.length === 0) {
    return null;
  }

  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={`${part.kind}-${part.value}`}>
          {index > 0 && ", "}
          {part.kind === "email" ? (
            <a href={toMailtoHref(part.value)} className="contact-link">
              {part.value}
            </a>
          ) : part.kind === "phone" && isTouchOrTablet ? (
            <a href={toTelHref(part.value)} className="contact-link">
              {part.value}
            </a>
          ) : (
            part.value
          )}
        </Fragment>
      ))}
    </>
  );
}
