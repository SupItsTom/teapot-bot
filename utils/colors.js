export async function GetColorText(hex) {
  try {
    const response = await fetch(
      `https://www.thecolorapi.com/id?hex=${encodeURIComponent(hex)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    console.log("COLORS:", data);

    return data.name.value;
  } catch (error) {
    console.error("Failed to fetch color data:", error);
    return "Unknown Color";
  }
}