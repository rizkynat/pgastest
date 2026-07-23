import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "SMARTCOLL",
  version: packageJson.version,
  copyright: `© ${currentYear}, SMARTCOLL.`,
  meta: {
    title: "SMARTCOLL",
    description:
      "SMARTCOLL is system for collection",
  },
};
