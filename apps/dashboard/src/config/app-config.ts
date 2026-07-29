import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Hagehjelpen",
  version: packageJson.version,
  copyright: `© ${currentYear}, Hagehjelpen.`,
  meta: {
    title: "Hagehjelpen",
    description: "Hagehjelpen administrasjonspanel.",
  },
};
