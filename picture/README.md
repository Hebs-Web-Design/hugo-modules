# picture

Hugo module to implement a basic partial and shortcode for picture emelents.

## Usage

### Shortcode

```
{{< picture img="img/logo.png" svg="img/logo.svg" alt="Logo" class="mx-auto px-3 md:px-0 inline-block" >}}
```

### Partial

```html
{{- partial "picture.html" (dict "img" "img/logo.png" "svg" "img/logo.svg" "alt" "Logo") -}}
```

## Options

* img : Path to image asset
* imgdark : Dark mode version of image asset (optional)
* svg : SVG version of image (optional)
* svgdark : Dark mode SVG version of image (optional)
* class : CSS classes to apply to image (optional)
* alt : Contents of `alt` attribute (optional)
* width (int) : Width for resize (default), crop, fill or fit operation (optional)
* height (int) : Height for resize (default), crop, fill or fit operation (optional)
* fit (bool) : Perform fit operation
* fill (bool) : Perform fill operation
* crop (bool) : Perform crop operation
* anchor : Anchor point for crop and fill
* versions : Comma seperated list of DPI/versions to generate. eg "2,4" would generate 2x and 4x along with 1x sizes (optional)
* disablewebp (bool) : Do not generate WebP versions of images in picture element (requires Hugo extended version - for non-extended versions this is always true) (optional)
* lazy (bool) : Enable lazy loading by adding `loading="lazy"` to the `img` tag (optional)
* trysvg (bool) : If a file of the same name, but with a `.svg` extension exists, this will be added as a `source` with a type of `image/svg+xml`. This works for both `img` and `imgdark` versions. The `svg` and `svgdark` options take precedence over the detected versions (optional)
* autowh (bool) : Add `width` and `height` attributes to the resulting `img` tag based on the final size of the image after any operations are completed (optional)
* norotate (bool) : Disable EXIF rotation (optional)

### Notes

Some options require or only support certain values:

* For fit, crop and fill operations both "width" and "height" must be provided.
* It is possible to provide "fit", "fill" and "crop" at the same time, however the first option wins:
  * Fit
  * Fill
  * Crop
  * Resize (no option set)
* The "anchor" option is only supported for "fill" and "crop" operations.
* The "versions" option must be provided as a comma seperated list of numbers. Currently only whole numbers are supported so generating a 3.5x image version is not supported. In addition one or both of "width" and "height" must be provided. This defines the "1x" version with alternate resolutions being calculated upwards from this size.
