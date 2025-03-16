import i18next from "i18next";
import Backend from "i18next-fs-backend";

i18next.use(Backend).init({
  lng: "es", // Idioma por defecto
  fallbackLng: "en", // Idioma de respaldo si no se encuentra la traducción
  backend: {
    loadPath: "./src/locales/{{lng}}.json", // Ruta a los archivos de traducción,
  },
  interpolation: {
    escapeValue: false,
  },
});
export default i18next;
