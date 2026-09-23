import BootstrapStyle from "react-native-bootstrap-styles";

const theme = {
  primary: "#0d6efd",
  secondary: "#6c757d",
  success: "#198754",
  info: "#0dcaf0",
  warning: "#ffc107",
  danger: "#dc3545",
  light: "#f8f9fa",
  dark: "#212529",
};

const bootstrapStyle = new BootstrapStyle(theme);
export const s = bootstrapStyle.s;
export const c = bootstrapStyle.c;

export default bootstrapStyle;
