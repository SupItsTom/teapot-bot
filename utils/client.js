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


/**
 * Retrieves the value of a specific search parameter from a given request URL.
 *
 * @param {Request} request - The HTTP request object containing the URL.
 * @param {string} param - The name of the search parameter to retrieve.
 * @returns {string | null} The value of the specified search parameter, or null if it does not exist.
 */
export function getSearchParams(request, param) {
  const { searchParams } = new URL(request.url);
  let value = searchParams.get(param);
  return value;
}


/**
 * Handles HTTP response codes and returns an error message based on the code.
 *
 * @param {number} code - The HTTP status code to handle.
 * @returns {Error} An error object containing the status code and a corresponding message.
 *
 * @description
 * This function maps common HTTP status codes to descriptive error messages.
 * It is useful for interpreting server responses and providing meaningful feedback
 * to the user or developer.
 *
 * Supported status codes:
 * - 200: The request completed successfully.
 * - 201: The entity was created successfully.
 * - 204: The request completed successfully but returned no content.
 * - 304: The entity was not modified (no action was taken).
 * - 400: The request was improperly formatted, or the server couldn't understand it.
 * - 401: The request was denied permission to the resource.
 * - 403: The request failed authentication.
 * - 404: The resource at the location specified doesn't exist.
 * - 405: The HTTP method used is not valid for the location specified.
 * - 418: This maze isn't meant for you.
 * - 429: You are being rate limited.
 * - Default: The server had an error processing your request (these are rare).
 */
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


/**
 * Formats a number by adding commas as thousand separators.
 *
 * @param {number|string} x - The number or numeric string to format.
 * @returns {string} The formatted string with commas as thousand separators.
 */
export function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const ATXHeader = {
  None: 0,
  Large: 1,
  Medium: 2,
  Small: 3,
  Tiny: -1
};

export const IsStaging = (env) => {
  // CF_VERSION_METADATA.id returns an empty string when not deployed to edge server
  return env.CF_VERSION_METADATA.id === '' ? true : false;
}