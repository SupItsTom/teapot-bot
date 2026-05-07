import { error } from "itty-router";

export class JsonResponse extends Response {
  constructor(body, init) {
    const jsonBody = JSON.stringify(body);
    init = init || {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    };
    super(jsonBody, init);
  }
}


// Retrieves the value of a specific search parameter from a given request URL
export function getSearchParams(request, param) {
  const { searchParams } = new URL(request.url);
  let value = searchParams.get(param);
  return value;
}


// Handles HTTP response codes and returns an error message based on the code
export function dropRequest(code) {
  switch (code) {
    case 200: return error(code, "The request completed successfully.");
    case 201: return error(code, "The entity was created successfully.");
    case 204: return error(code, "The request completed successfully but returned no content.");
    case 304: return error(code, "The entity was not modified (no action was taken).");
    case 400: return error(code, "The request was improperly formatted, or the server couldn't understand it.");
    case 401: return error(code, "The request was denied permission to the resource.");
    case 403: return error(code, "The request failed authentication.");
    case 404: return error(code, "The resource at the location specified doesn't exist.");
    case 405: return error(code, "The HTTP method used is not valid for the location specified.");
    case 418: return error(code, "This maze isn't meant for you.");
    case 429: return error(code, "You are being rate limited.");
    default: return error(code, "The server had an error processing your request (these are rare).");
  }
}


// Formats a number string by adding commas as thousand separators
export function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Truncate time relative to input string
// Eg: 8 months, 28 days, 13 hours, 19 minutes => 8 months, 28 days
export function truncateRelativeTime(str) {
  const regex = /(\d+)\s+(year|month|day|hour|minute)s?/g;
  const parts = [];
  let match;

  while ((match = regex.exec(str)) !== null) {
    parts.push({
      value: parseInt(match[1], 10),
      unit: match[2],
    });
  }

  const filtered = parts.filter(p => p.value > 0);
  const result = filtered.slice(0, 2);

  return result
    .map(({ value, unit }) => {
      return `${value} ${unit}${value !== 1 ? "s" : ""}`;
    })
    .join(", ");
}

// Can maybe remove this or actually fuckin' use it :sob:
export const ATXHeader = {
  None: 0,
  Large: 1,
  Medium: 2,
  Small: 3,
  Tiny: -1
};

// Check if bot is running locally by lack of deployment ID
export const IsStaging = (env) => {
  return env.CF_VERSION_METADATA.id === '' ? true : false;
}