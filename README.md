# Photoshop Stack Opacity 🎨

The **Stack Opacity** plugin for Adobe Photoshop provides a powerful, visual curve editor to define and apply custom opacity gradients across a stack of selected layers. This tool is ideal for creating effects like comet tails, volumetric lighting, or complex layer transitions with precision.

-----

## ✨ Features

  * **Interactive Curve Editor:** Visually define the opacity falloff using a simple curve editor.
  * **Custom Points:** Click anywhere on the curve to add a new control point.
  * **Point Manipulation:** Drag control points to adjust the curve.
      * **Endpoints Locked:** The start (0%) and end (100%) points of the curve are fixed horizontally.
      * **Point Removal:** Double-click any intermediate point to remove it.
  * **Presets:** Quickly load pre-defined curves like "Comet," "Bell," or "Full."
  * **Invert Functionality:** Horizontally mirror the current curve (flip the effect across the layer stack).
  * **Responsive UI:** The editor dynamically resizes when the panel is docked or floating.

-----

## 🚀 How to Use

The plugin maps the layers in your selected group (or document) to the X-axis of the curve, with the layer at the bottom of the stack corresponding to **X=0** and the layer at the top corresponding to **X=1**.

The Y-axis represents the layer's opacity, from **0 (transparent)** to **1 (opaque)**.

1.  **Load Files into Stack:** Go to File > Scripts > Load Files into Stack. Select the files or folder you want to add. Make sure you do **not** convert the result into a Smart Object after loading layers.
2.  **Draw Your Curve:**
      * **Add Points:** Click on the canvas to add control points.
      * **Adjust Points:** Click and drag points to shape the curve.
      * **Use Presets:** Select a preset from the **Presets** dropdown to quickly load a shape.
3.  **Apply Curve:** Click the **Apply Curve to Stack** button.
      * The plugin will iterate through your selected layers (from bottom to top).
      * It will set the opacity of each layer based on the curve's value at that layer's corresponding position (X-value).
      * ***Note:*** The code sets the blend mode to `lighten` for the effect, but this can be adjusted manually after application.
4.  **Manage Curve:** Use the **Invert** button to horizontally flip the curve, or the **Reset** button to return to the default diagonal line.

-----

## ⬇️ How to Install and Run

This plugin is built using the Adobe UXP (Unified Extensibility Platform) and requires the **UXP Developer Tool** to run and debug.

### Prerequisites

  * Adobe Photoshop (version 23.3.0 or later, as specified in `manifest.json`).
  * [UXP Developer Tool](https://www.google.com/search?q=https://developer.adobe.com/photoshop/uxp/2022/guides/getting-started/getting-started-installation/).

### Installation Steps

1.  **Download Plugin:** Download the entire plugin folder to your local machine.
2.  **Launch UXP Developer Tool:** Open the Adobe UXP Developer Tool application.
3.  **Add Plugin:** Click the **"Add Plugin"** button in the UXP Developer Tool.
4.  **Select Folder:** Navigate to and select the root folder of the downloaded plugin (the folder containing the `manifest.json` file). The plugin, named **Stack Opacity**, should now appear in the list.
5.  **Load Plugin:** Click the **"..."** menu next to the plugin name and select **"Load"**.
6.  **Open in Photoshop:**
      * Launch or switch to Adobe Photoshop.
      * Go to the main menu: **Plugins \> Stack Opacity**
      * The **Stack Opacity** panel will open, ready for use.