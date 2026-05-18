// client/src/theme.js
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: `'Fira Code', sans-serif`,
    body: `'Inter', sans-serif`,
  },
  colors: {
    brand: {
      100: "#f7fafc",
      900: "#1a202c",
    },
  },
  radii: {
    none: "0px",
    xs: "0px",
    sm: "0px",
    base: "0px",
    md: "0px",
    lg: "0px",
    xl: "0px",
    "2xl": "0px",
    "3xl": "0px",
    full: "0px",
  },
  shadows: {
    none: "none",
    xs: "none",
    sm: "none",
    base: "none",
    md: "none",
    lg: "none",
    xl: "none",
    "2xl": "none",
    "3xl": "none",
    inner: "none",
    outline: "0 0 0 2px #3182ce",
  },
});

export default theme;
