# picture

Hugo module to implement a basic partial and shortcode for picture emlements.

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

* img : Path to image asset (in the current page resource when called via the shortcode or the global "assets" location)
* imgdark : Dark mode version of image asset (optional)
* svg : SVG version of image (optional)
* svgdark : Dark mode SVG version of image (optional)
* class : CSS classes to apply to image (optional)
* alt : Contents of `alt` attribute (optional)
* width (int) : Width for resize (default), crop, fill or fit operation (optional)
* height (int) : Height for resize (default), crop, fill or fit operation (optional)
* action (string) : Action to perform. One of resize (default), crop, fill or fit (optional)
* anchor : Anchor point for crop and fill
* versions : Comma seperated list or slice of DPI/versions to generate. eg "2,4" would generate 2x and 4x along with 1x (default) sizes (optional)
* disablewebp (bool) : Do not generate WebP versions of images in picture element (requires Hugo extended version - for non-extended versions this is always true) (optional)
* lazy (bool) : Enable lazy loading by adding `loading="lazy"` to the `img` tag (optional)
* norotate (bool) : Disable EXIF rotation (optional)
* twaspect (bool) : Add a Tailwind CSS "aspect-[w/h]" class to the image (optional)
* Page (Page) : Pass the current Page object to attempt to load resources from the page bundle (optional)

### Notes

Some options require or only support certain values:

* For fit, crop and fill actions both "width" and "height" must be provided.
* The "anchor" option is only supported for "fill" and "crop" operations.
* The "versions" option must be provided as a comma seperated list of numbers. Currently only whole numbers are supported so generating a 3.5x image version is not supported. In addition one or both of "width" and "height" must be provided. This defines the "1x" version with alternate resolutions being calculated upwards from this size.

## Example

For example, passing `2,3,4` for `versions` with `100` for width, based on an image with a resolution of 1000x500 (it's always best to be scaling down for all versions rather than scaling up), this will result in the following resize operations:

* 100x50 = base/default image
* 200x100 = 2x version
* 300x150 = 3x version
* 400x200 = 4x version
 
In addition, assuming the extended version of Hugo is used, WebP versions of all of the above will be generated at the same resolutions and added as `source` elements within the `picture` element. 
 
