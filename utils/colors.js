export async function GetColorText(hex) {
  try {
    const response = await fetch(
      `https://www.thecolorapi.com/id?hex=${encodeURIComponent(hex)}`
    );

    if (!response.ok) {
      console.error(`[ColorService]: Failed GET to https://www.thecolorapi.com/id?hex=${encodeURIComponent(hex)}`);
    }

    console.log(`[ColorService]: Completed GET to https://www.thecolorapi.com/id?hex=${encodeURIComponent(hex)} with status: ${response.status}`);

    const data = await response.json();

    return data.name.value;
  } catch (error) {
    console.error(`[ColorService]: Failed GET to https://www.thecolorapi.com/id?hex=${encodeURIComponent(hex)} with error: ${error}`);
    return "Unknown Color";
  }
}