import path from "path";
import { I18n } from 'i18n';
const i18n = new I18n({
    locales: ['en', 'fr'],
    directory: path.join(process.cwd(), '/src/config/locales'),
    header: "lang",
    defaultLocale: 'fr'
});
export default i18n;
