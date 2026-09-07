// ISO 3166-1 alpha-2 codes for the countries offered in the registration
// form's country <select> (src/pages/training/register/[session].astro).
// Lexware Office's address fields want a two-letter countryCode, not the
// full country name the form collects.
export const COUNTRY_CODES = {
  Germany: "DE",
  Austria: "AT",
  Belgium: "BE",
  Croatia: "HR",
  "Czech Republic": "CZ",
  Denmark: "DK",
  Estonia: "EE",
  Finland: "FI",
  France: "FR",
  Greece: "GR",
  Hungary: "HU",
  Ireland: "IE",
  Italy: "IT",
  Latvia: "LV",
  Lithuania: "LT",
  Luxembourg: "LU",
  Netherlands: "NL",
  Norway: "NO",
  Poland: "PL",
  Portugal: "PT",
  Romania: "RO",
  Slovakia: "SK",
  Slovenia: "SI",
  Spain: "ES",
  Sweden: "SE",
  Switzerland: "CH",
  "United Kingdom": "GB",
  "United States": "US",
  // "Other" has no ISO code — countryCode is omitted for it, and Lexware's
  // own API error (if it turns out to be required) will surface in the
  // function logs rather than us guessing a wrong country.
};

export function toCountryCode(countryName) {
  return COUNTRY_CODES[countryName];
}
