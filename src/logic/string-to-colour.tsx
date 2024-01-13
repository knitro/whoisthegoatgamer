export interface StringToColourInfo {
  backgroundColour: string;
  textColour: string;
}

export const stringToColour = (input: string): StringToColourInfo => {
  const generatedColour = stringToHsl(input);
  const textColour = getTextColourBasedOnBackgroundHsl(generatedColour);
  const returnObject: StringToColourInfo = {
    backgroundColour: generatedColour,
    textColour: textColour,
  };
  return returnObject;
};

const stringToHsl = (input: string) => {
  const hue = hashCode(input) % 360;
  return `hsl(${hue}, 100%, 80%)`;
};

const getTextColourBasedOnBackgroundHsl = (hsl: string) => {
  // Get HSL components from stringToHsl
  const regex = /(hsl)|\(|\)|%/g;
  const cleanedHSL = hsl.replaceAll(regex, "");
  const hslArray = cleanedHSL.split(",");

  const rgb = convertHSLToRGB(
    Number.parseInt(hslArray[0]),
    Number.parseInt(hslArray[1]),
    Number.parseInt(hslArray[2])
  );

  return pickTextColorBasedOnBgColorAdvanced(rgb);
};

const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
};

const convertHSLToRGB = (h: number, s: number, l: number) => {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [255 * f(0), 255 * f(8), 255 * f(4)];
};

const pickTextColorBasedOnBgColorAdvanced = (rgbArray: number[]) => {
  const uiColors = [rgbArray[0] / 255, rgbArray[1] / 255, rgbArray[2] / 255];
  const c = uiColors.map((col) => {
    if (col <= 0.03928) {
      return col / 12.92;
    }
    return Math.pow((col + 0.055) / 1.055, 2.4);
  });
  const L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

  const lightColour = "#FFFFFF";
  const darkColour = "#000000";

  return L > 0.179 ? darkColour : lightColour;
};
