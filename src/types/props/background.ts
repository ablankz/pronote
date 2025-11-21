import { ColorValueFactory, ColorValues } from "../value/color";

type BackgroundType = "color" | "image" | "gradient";
type BackgroundRepeat = "repeat" | "repeat-x" | "repeat-y" | "no-repeat";
type BackgroundAttachment = "scroll" | "fixed" | "local";
type BackgroundOrigin = "border-box" | "padding-box" | "content-box";
type BackgroundClip = "border-box" | "padding-box" | "content-box" | "text";
type BackgroundBlendMode =
    | "normal"
    | "multiply"
    | "screen"
    | "overlay"
    | "darken"
    | "lighten"
    | "color-dodge"
    | "color-burn"
    | "hard-light"
    | "soft-light"
    | "difference"
    | "exclusion"
    | "hue"
    | "saturation"
    | "color"
    | "luminosity";
// type BackgroundSize = "auto" | "cover" | "contain" | "100% 100%";
type BackgroundSize = {
  width: string;
  height: string;
  auto: boolean;
}
type BackgroundPosition = "top" | "bottom" | "left" | "right" | "center" | "50% 50%";

interface BackgroundProperties {
  type: BackgroundType;           // type
  color?: ColorValues;                 // background-color
  image?: string[];                 // background-image (url)
  gradient?: string;              // background-image (gradient)
  repeat?: BackgroundRepeat;      // background-repeat
  attachment?: BackgroundAttachment; // background-attachment
  position?: string;              // background-position (ex："center center"、"50% 50%")
  size?: string;                  // background-size (ex："cover"、"contain"、"100% 100%")
  origin?: BackgroundOrigin;      // background-origin
  clip?: BackgroundClip;          // background-clip
  blendMode?: BackgroundBlendMode[]; // background-blend-mode
}

const renderForHTML = (background: BackgroundProperties): Record<string, string|undefined> => {
  const style: Record<string, string|undefined> = {};
  if (background.type === "color") {
    style["background-color"] = ColorValueFactory.toString(background.color);
  } else if (background.type === "image") {
    style["background-image"] = background.image?.map((url) => `url(${url})`).join(", ");
    style["background-repeat"] = background.repeat;
    style["background-attachment"] = background.attachment;
    style["background-position"] = background.position;
    style["background-size"] = background.size;
    style["background-origin"] = background.origin;
    style["background-clip"] = background.clip;
    style["background-blend-mode"] = background.blendMode?.join(", ");
  } else if (background.type === "gradient") {
    style["background-image"] = background.gradient;
    style["background-repeat"] = background.repeat;
    style["background-attachment"] = background.attachment;
    style["background-position"] = background.position;
    style["background-size"] = background.size;
    style["background-origin"] = background.origin;
    style["background-clip"] = background.clip;
    style["background-blend-mode"] = background.blendMode?.join(", ");
  }
  return style;
}