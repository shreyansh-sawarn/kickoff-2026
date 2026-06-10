import React from "react";

interface JsonLdProps {
  schema: Record<string, any>;
}

export default function JsonLd({ schema }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Helper to generate a SportsEvent schema for a Match
 */
export function generateMatchSchema(match: any) {
  const homeName = match.homeTeam?.name || "Home";
  const awayName = match.awayTeam?.name || "Away";
  const homeCode = match.homeTeam?.code || "us";
  const awayCode = match.awayTeam?.code || "us";

  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "name": `${homeName} vs ${awayName}`,
    "description": `FIFA World Cup 2026 Match: ${homeName} vs ${awayName} - Group stage or Knockout.`,
    "startDate": match.datetime,
    "sport": "https://en.wikipedia.org/wiki/Association_football",
    "homeTeam": {
      "@type": "SportsTeam",
      "name": homeName,
      "logo": `https://flagcdn.com/w160/${homeCode.toLowerCase()}.png`
    },
    "awayTeam": {
      "@type": "SportsTeam",
      "name": awayName,
      "logo": `https://flagcdn.com/w160/${awayCode.toLowerCase()}.png`
    },
    "location": {
      "@type": "Place",
      "name": match.stadium || "World Cup Stadium",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": match.city || "USA/Mexico/Canada",
        "addressCountry": match.country || "North America"
      }
    },
    "competitor": [
      {
        "@type": "SportsTeam",
        "name": homeName
      },
      {
        "@type": "SportsTeam",
        "name": awayName
      }
    ],
    "eventStatus": match.status === "live" 
      ? "https://schema.org/EventActive" 
      : match.status === "finished" 
        ? "https://schema.org/EventCompleted" 
        : "https://schema.org/EventScheduled"
  };
}

/**
 * Helper to generate a SportsTeam schema for a Team
 */
export function generateTeamSchema(team: any) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    "name": team.name,
    "sport": "https://en.wikipedia.org/wiki/Association_football",
    "memberOf": {
      "@type": "SportsOrganization",
      "name": "FIFA"
    },
    "subOrganization": team.group ? {
      "@type": "SportsOrganization",
      "name": `Group ${team.group}`
    } : undefined
  };
}
