# Photoshop Stack Opacity 🎨

The **Stack Opacity** plugin for Adobe Photoshop provides a powerful, visual curve editor to define and apply custom opacity gradients across a stack of selected layers. This tool is ideal for creating effects like comet tails, volumetric lighting, or complex layer transitions with precision.

## ✨ Features

  * **Interactive Curve Editor:** Visually define the opacity falloff using a simple curve editor.
  * **Custom Points:** Click anywhere on the curve to add a new control point. Click and drag existing points. Double click to remove points.
  * **Presets:** Quickly load pre-defined curves like "Comet," "Bell," or "Full."
  * **Invert Functionality:** Horizontally mirror the current curve (flip the effect across the layer stack).
  * **Blend Mode: ** Select blend mode for your stack (default is Lighten).

## 🚀 How to Use

The plugin maps the layers in your selected group (or document) to the X-axis of the curve, with the layer at the bottom of the stack corresponding to **X=0** and the layer at the top corresponding to **X=1**.

The Y-axis represents the layer's opacity, from **0 (transparent)** to **1 (opaque)**.

1.  **Load Files into Stack:** Go to File > Scripts > Load Files into Stack. Select the files or folder you want to add. Make sure you do **not** convert the result into a Smart Object after loading layers.
2.  **Draw Your Curve:**
      * **Add Points:** Click on the canvas to add control points.
      * **Adjust Points:** Click and drag points to shape the curve.
      * **Use Presets:** Select a preset from the **Presets** dropdown to quickly load a shape.
3. **Choose Blend Mode:** Select the blend mode for your stack (default is Lighten).
4.  **Apply Curve:** Click the **Apply Curve to Stack** button.
      * The plugin will iterate through your selected layers (from bottom to top).
      * It will set the opacity of each layer based on the curve's value at that layer's corresponding position (X-value).
5.  **Manage Curve:** Use the **Invert** button to horizontally flip the curve, or the **Reset** button to return to the default diagonal line and reset the blend mode.

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

## ☄️ Star Trail Editing Tips

### Experiment using other filters after applying your desired opacity curve.

* **Diffuse** (Filters > Stylize > Diffuse): A subtle filter to help close up any tiny trail gaps between images. It also helps to slightly reduce color noise so the trails are a more uniform color. Anisotropic mode tends to give me the best results.
* **Oil Paint** (Filters > Stylize > Oil Paint): Good for closing larger trail gaps and makes them look "fuller". Experiment with the sliders but my preferred settings are:
    *   Stylization: <= 2.3
    *   Cleanliess: 10.0
    *   Scale: 0.1
    *   Bristle Detail: 0.0
    *   Lighting: Disabled
* **Motion Blur** (Filters > Blur > Motion Blur): Good for trails that are mostly straight. Closes larger trail gaps.
* **Radial Blur** (Filters > Blur > Radial Blur): Can be used for circular star trails but can have mixed results especially if the trail has some lens distortion making it not a more perfect circle.